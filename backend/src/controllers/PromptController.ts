import type { Response, NextFunction } from "express"
import { prisma } from "@/config/database"
import { ResponseUtil } from "@/utils/response"
import { ApiError } from "@/utils/ApiError"
import type { AuthenticatedRequest } from "@/middleware/auth"

export class PromptController {
  async getPrompts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const {
        page = 1,
        limit = 10,
        search,
        projectId,
        status,
        tags,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      // Build where clause
      const where: any = {
        project: {
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: { userId },
              },
            },
          ],
        },
      }

      if (projectId) {
        where.projectId = projectId as string
      }

      if (status) {
        where.status = status as string
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: "insensitive" } },
          { content: { contains: search as string, mode: "insensitive" } },
        ]
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags]
        where.tags = {
          some: {
            tag: {
              name: { in: tagArray as string[] },
            },
          },
        }
      }

      const [prompts, total] = await Promise.all([
        prisma.prompt.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
            project: {
              select: { id: true, name: true },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: { versions: true },
            },
          },
        }),
        prisma.prompt.count({ where }),
      ])

      const pagination = {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + Number(limit) < total,
        hasPrev: Number(page) > 1,
      }

      ResponseUtil.success(res, prompts, "Prompts retrieved successfully", 200, pagination)
    } catch (error) {
      next(error)
    }
  }

  async createPrompt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { title, content, projectId, tags = [], status = "draft" } = req.body

      // Check if user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId,
                  role: { in: ["editor", "admin"] },
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new ApiError("Project not found or insufficient permissions", 404, "PROJECT_NOT_FOUND")
      }

      const prompt = await prisma.prompt.create({
        data: {
          title,
          content,
          projectId,
          authorId: userId,
          status,
          version: 1,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      })

      // Create initial version
      await prisma.promptVersion.create({
        data: {
          promptId: prompt.id,
          version: 1,
          title,
          content,
          authorId: userId,
          changeLog: "Initial version",
        },
      })

      // Handle tags if provided
      if (tags.length > 0) {
        const tagConnections = await Promise.all(
          tags.map(async (tagName: string) => {
            // Find or create tag
            const tag = await prisma.tag.upsert({
              where: {
                name_projectId: {
                  name: tagName,
                  projectId,
                },
              },
              update: {},
              create: {
                name: tagName,
                projectId,
              },
            })

            return {
              promptId: prompt.id,
              tagId: tag.id,
            }
          }),
        )

        await prisma.promptTag.createMany({
          data: tagConnections,
        })
      }

      ResponseUtil.created(res, prompt, "Prompt created successfully")
    } catch (error) {
      next(error)
    }
  }

  async getPrompt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: { userId },
                },
              },
            ],
          },
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          versions: {
            orderBy: { version: "desc" },
            take: 5,
            select: {
              id: true,
              version: true,
              changeLog: true,
              createdAt: true,
              author: {
                select: { id: true, name: true },
              },
            },
          },
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found", 404, "PROMPT_NOT_FOUND")
      }

      ResponseUtil.success(res, prompt, "Prompt retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async updatePrompt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const { title, content, status, changeLog } = req.body

      // Check if user has access to edit the prompt
      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: {
                    userId,
                    role: { in: ["editor", "admin"] },
                  },
                },
              },
            ],
          },
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found or insufficient permissions", 404, "PROMPT_NOT_FOUND")
      }

      // Check if content has changed to create new version
      const contentChanged = content && content !== prompt.content
      const titleChanged = title && title !== prompt.title

      let newVersion = prompt.version
      if (contentChanged || titleChanged) {
        newVersion = prompt.version + 1

        // Create new version
        await prisma.promptVersion.create({
          data: {
            promptId: id,
            version: newVersion,
            title: title || prompt.title,
            content: content || prompt.content,
            authorId: userId,
            changeLog: changeLog || "Updated prompt",
          },
        })
      }

      const updatedPrompt = await prisma.prompt.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(status && { status }),
          ...(contentChanged || titleChanged ? { version: newVersion } : {}),
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })

      ResponseUtil.success(res, updatedPrompt, "Prompt updated successfully")
    } catch (error) {
      next(error)
    }
  }

  async deletePrompt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // Check if user has access to delete the prompt
      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          OR: [
            { authorId: userId },
            {
              project: {
                ownerId: userId,
              },
            },
            {
              project: {
                collaborators: {
                  some: {
                    userId,
                    role: "admin",
                  },
                },
              },
            },
          ],
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found or insufficient permissions", 404, "PROMPT_NOT_FOUND")
      }

      await prisma.prompt.delete({
        where: { id },
      })

      ResponseUtil.success(res, null, "Prompt deleted successfully")
    } catch (error) {
      next(error)
    }
  }

  async duplicatePrompt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const { title: newTitle, projectId: newProjectId } = req.body

      // Get original prompt
      const originalPrompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: { userId },
                },
              },
            ],
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })

      if (!originalPrompt) {
        throw new ApiError("Prompt not found", 404, "PROMPT_NOT_FOUND")
      }

      const targetProjectId = newProjectId || originalPrompt.projectId

      // Check access to target project
      const targetProject = await prisma.project.findFirst({
        where: {
          id: targetProjectId,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId,
                  role: { in: ["editor", "admin"] },
                },
              },
            },
          ],
        },
      })

      if (!targetProject) {
        throw new ApiError("Target project not found or insufficient permissions", 404, "PROJECT_NOT_FOUND")
      }

      const duplicatedPrompt = await prisma.prompt.create({
        data: {
          title: newTitle || `${originalPrompt.title} (Copy)`,
          content: originalPrompt.content,
          projectId: targetProjectId,
          authorId: userId,
          status: "draft",
          version: 1,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      })

      // Create initial version
      await prisma.promptVersion.create({
        data: {
          promptId: duplicatedPrompt.id,
          version: 1,
          title: duplicatedPrompt.title,
          content: duplicatedPrompt.content,
          authorId: userId,
          changeLog: `Duplicated from prompt: ${originalPrompt.title}`,
        },
      })

      ResponseUtil.created(res, duplicatedPrompt, "Prompt duplicated successfully")
    } catch (error) {
      next(error)
    }
  }

  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // Check if prompt exists and user has access
      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: { userId },
                },
              },
            ],
          },
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found", 404, "PROMPT_NOT_FOUND")
      }

      // Check if already favorited
      const existingFavorite = await prisma.userFavorite.findUnique({
        where: {
          userId_promptId: {
            userId,
            promptId: id,
          },
        },
      })

      if (existingFavorite) {
        // Remove from favorites
        await prisma.userFavorite.delete({
          where: {
            userId_promptId: {
              userId,
              promptId: id,
            },
          },
        })

        ResponseUtil.success(res, { favorited: false }, "Removed from favorites")
      } else {
        // Add to favorites
        await prisma.userFavorite.create({
          data: {
            userId,
            promptId: id,
          },
        })

        ResponseUtil.success(res, { favorited: true }, "Added to favorites")
      }
    } catch (error) {
      next(error)
    }
  }

  async getVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // Check access
      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: { userId },
                },
              },
            ],
          },
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found", 404, "PROMPT_NOT_FOUND")
      }

      const versions = await prisma.promptVersion.findMany({
        where: { promptId: id },
        orderBy: { version: "desc" },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      ResponseUtil.success(res, versions, "Versions retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async getVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id, version } = req.params

      // Check access
      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: { userId },
                },
              },
            ],
          },
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found", 404, "PROMPT_NOT_FOUND")
      }

      const promptVersion = await prisma.promptVersion.findFirst({
        where: {
          promptId: id,
          version: Number(version),
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      if (!promptVersion) {
        throw new ApiError("Version not found", 404, "VERSION_NOT_FOUND")
      }

      ResponseUtil.success(res, promptVersion, "Version retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async revertToVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id, version } = req.params

      // Check if user has edit access
      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: {
                    userId,
                    role: { in: ["editor", "admin"] },
                  },
                },
              },
            ],
          },
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found or insufficient permissions", 404, "PROMPT_NOT_FOUND")
      }

      // Get the version to revert to
      const targetVersion = await prisma.promptVersion.findFirst({
        where: {
          promptId: id,
          version: Number(version),
        },
      })

      if (!targetVersion) {
        throw new ApiError("Version not found", 404, "VERSION_NOT_FOUND")
      }

      // Create new version with reverted content
      const newVersion = prompt.version + 1

      await prisma.promptVersion.create({
        data: {
          promptId: id,
          version: newVersion,
          title: targetVersion.title,
          content: targetVersion.content,
          authorId: userId,
          changeLog: `Reverted to version ${version}`,
        },
      })

      // Update prompt
      const updatedPrompt = await prisma.prompt.update({
        where: { id },
        data: {
          title: targetVersion.title,
          content: targetVersion.content,
          version: newVersion,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      })

      ResponseUtil.success(res, updatedPrompt, "Reverted to version successfully")
    } catch (error) {
      next(error)
    }
  }

  async compareVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id, v1, v2 } = req.params

      // Check access
      const prompt = await prisma.prompt.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: { userId },
                },
              },
            ],
          },
        },
      })

      if (!prompt) {
        throw new ApiError("Prompt not found", 404, "PROMPT_NOT_FOUND")
      }

      const [version1, version2] = await Promise.all([
        prisma.promptVersion.findFirst({
          where: { promptId: id, version: Number(v1) },
        }),
        prisma.promptVersion.findFirst({
          where: { promptId: id, version: Number(v2) },
        }),
      ])

      if (!version1 || !version2) {
        throw new ApiError("One or both versions not found", 404, "VERSION_NOT_FOUND")
      }

      const comparison = {
        version1,
        version2,
        // Simple diff - in production, you might want to use a proper diff library
        titleChanged: version1.title !== version2.title,
        contentChanged: version1.content !== version2.content,
      }

      ResponseUtil.success(res, comparison, "Version comparison retrieved successfully")
    } catch (error) {
      next(error)
    }
  }
}
