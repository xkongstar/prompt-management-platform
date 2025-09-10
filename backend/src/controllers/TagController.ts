import type { Response, NextFunction } from "express"
import { prisma } from "@/config/database"
import { ResponseUtil } from "@/utils/response"
import { ApiError } from "@/utils/ApiError"
import type { AuthenticatedRequest } from "@/middleware/auth"

export class TagController {
  async getTags(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { projectId, search } = req.query

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

      if (search) {
        where.name = { contains: search as string, mode: "insensitive" }
      }

      const tags = await prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: { prompts: true },
          },
        },
        orderBy: { name: "asc" },
      })

      ResponseUtil.success(res, tags, "Tags retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async createTag(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { name, color = "#1890ff", projectId } = req.body

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

      // Check if tag already exists in project
      const existingTag = await prisma.tag.findUnique({
        where: {
          name_projectId: {
            name,
            projectId,
          },
        },
      })

      if (existingTag) {
        throw new ApiError("Tag already exists in this project", 409, "TAG_EXISTS")
      }

      const tag = await prisma.tag.create({
        data: {
          name,
          color,
          projectId,
        },
        include: {
          _count: {
            select: { prompts: true },
          },
        },
      })

      ResponseUtil.created(res, tag, "Tag created successfully")
    } catch (error) {
      next(error)
    }
  }

  async updateTag(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const { name, color } = req.body

      // Check if user has access to update the tag
      const tag = await prisma.tag.findFirst({
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

      if (!tag) {
        throw new ApiError("Tag not found or insufficient permissions", 404, "TAG_NOT_FOUND")
      }

      // Check if new name conflicts with existing tag in same project
      if (name && name !== tag.name) {
        const existingTag = await prisma.tag.findUnique({
          where: {
            name_projectId: {
              name,
              projectId: tag.projectId,
            },
          },
        })

        if (existingTag) {
          throw new ApiError("Tag name already exists in this project", 409, "TAG_EXISTS")
        }
      }

      const updatedTag = await prisma.tag.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(color && { color }),
        },
        include: {
          _count: {
            select: { prompts: true },
          },
        },
      })

      ResponseUtil.success(res, updatedTag, "Tag updated successfully")
    } catch (error) {
      next(error)
    }
  }

  async deleteTag(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // Check if user has access to delete the tag
      const tag = await prisma.tag.findFirst({
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

      if (!tag) {
        throw new ApiError("Tag not found or insufficient permissions", 404, "TAG_NOT_FOUND")
      }

      await prisma.tag.delete({
        where: { id },
      })

      ResponseUtil.success(res, null, "Tag deleted successfully")
    } catch (error) {
      next(error)
    }
  }

  async getPopularTags(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { projectId, limit = 10 } = req.query

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

      const tags = await prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: { prompts: true },
          },
        },
        orderBy: {
          prompts: {
            _count: "desc",
          },
        },
        take: Number(limit),
      })

      ResponseUtil.success(res, tags, "Popular tags retrieved successfully")
    } catch (error) {
      next(error)
    }
  }
}
