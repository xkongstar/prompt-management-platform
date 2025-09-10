import type { Response, NextFunction } from "express"
import { prisma } from "@/config/database"
import { ResponseUtil } from "@/utils/response"
import { ApiError } from "@/utils/ApiError"
import type { AuthenticatedRequest } from "@/middleware/auth"

export class ProjectController {
  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { page = 1, limit = 10, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const where = {
        OR: [
          { ownerId: userId },
          {
            collaborators: {
              some: {
                userId: userId,
              },
            },
          },
        ],
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: "insensitive" } },
            { description: { contains: search as string, mode: "insensitive" } },
          ],
        }),
      }

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder },
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { prompts: true, collaborators: true },
            },
          },
        }),
        prisma.project.count({ where }),
      ])

      const pagination = {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + Number(limit) < total,
        hasPrev: Number(page) > 1,
      }

      ResponseUtil.success(res, projects, "Projects retrieved successfully", 200, pagination)
    } catch (error) {
      next(error)
    }
  }

  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { name, description, visibility = "private" } = req.body

      const project = await prisma.project.create({
        data: {
          name,
          description,
          visibility,
          ownerId: userId,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { prompts: true, collaborators: true },
          },
        },
      })

      ResponseUtil.created(res, project, "Project created successfully")
    } catch (error) {
      next(error)
    }
  }

  async getProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: { userId },
              },
            },
          ],
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          collaborators: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: { prompts: true },
          },
        },
      })

      if (!project) {
        throw new ApiError("Project not found", 404, "PROJECT_NOT_FOUND")
      }

      ResponseUtil.success(res, project, "Project retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const { name, description, visibility } = req.body

      // Check if user owns the project or has admin role
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId,
                  role: "admin",
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new ApiError("Project not found or insufficient permissions", 404, "PROJECT_NOT_FOUND")
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(visibility && { visibility }),
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { prompts: true, collaborators: true },
          },
        },
      })

      ResponseUtil.success(res, updatedProject, "Project updated successfully")
    } catch (error) {
      next(error)
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // Only project owner can delete
      const project = await prisma.project.findFirst({
        where: {
          id,
          ownerId: userId,
        },
      })

      if (!project) {
        throw new ApiError("Project not found or insufficient permissions", 404, "PROJECT_NOT_FOUND")
      }

      await prisma.project.delete({
        where: { id },
      })

      ResponseUtil.success(res, null, "Project deleted successfully")
    } catch (error) {
      next(error)
    }
  }

  async getProjectStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // Check access
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: { userId },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new ApiError("Project not found", 404, "PROJECT_NOT_FOUND")
      }

      const [totalPrompts, publishedPrompts, draftPrompts, archivedPrompts, totalCollaborators] = await Promise.all([
        prisma.prompt.count({ where: { projectId: id } }),
        prisma.prompt.count({ where: { projectId: id, status: "published" } }),
        prisma.prompt.count({ where: { projectId: id, status: "draft" } }),
        prisma.prompt.count({ where: { projectId: id, status: "archived" } }),
        prisma.projectCollaborator.count({ where: { projectId: id } }),
      ])

      const statistics = {
        totalPrompts,
        publishedPrompts,
        draftPrompts,
        archivedPrompts,
        totalCollaborators,
      }

      ResponseUtil.success(res, statistics, "Project statistics retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async getProjectMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // Check access
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: { userId },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new ApiError("Project not found", 404, "PROJECT_NOT_FOUND")
      }

      const members = await prisma.projectCollaborator.findMany({
        where: { projectId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          invitedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      ResponseUtil.success(res, members, "Project members retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const { email, role = "viewer" } = req.body

      // Check if user owns the project or has admin role
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId,
                  role: "admin",
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new ApiError("Project not found or insufficient permissions", 404, "PROJECT_NOT_FOUND")
      }

      // Find user to invite
      const userToInvite = await prisma.user.findUnique({
        where: { email },
      })

      if (!userToInvite) {
        throw new ApiError("User not found", 404, "USER_NOT_FOUND")
      }

      // Check if user is already a member
      const existingMember = await prisma.projectCollaborator.findUnique({
        where: {
          projectId_userId: {
            projectId: id,
            userId: userToInvite.id,
          },
        },
      })

      if (existingMember) {
        throw new ApiError("User is already a member of this project", 409, "USER_ALREADY_MEMBER")
      }

      const collaboration = await prisma.projectCollaborator.create({
        data: {
          projectId: id,
          userId: userToInvite.id,
          role,
          invitedBy: userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      })

      ResponseUtil.created(res, collaboration, "Member invited successfully")
    } catch (error) {
      next(error)
    }
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id, userId: memberId } = req.params
      const { role } = req.body

      // Check if user owns the project or has admin role
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId,
                  role: "admin",
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new ApiError("Project not found or insufficient permissions", 404, "PROJECT_NOT_FOUND")
      }

      const updatedMember = await prisma.projectCollaborator.update({
        where: {
          projectId_userId: {
            projectId: id,
            userId: memberId,
          },
        },
        data: { role },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      })

      ResponseUtil.success(res, updatedMember, "Member role updated successfully")
    } catch (error) {
      next(error)
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { id, userId: memberId } = req.params

      // Check if user owns the project or has admin role
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              collaborators: {
                some: {
                  userId,
                  role: "admin",
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new ApiError("Project not found or insufficient permissions", 404, "PROJECT_NOT_FOUND")
      }

      await prisma.projectCollaborator.delete({
        where: {
          projectId_userId: {
            projectId: id,
            userId: memberId,
          },
        },
      })

      ResponseUtil.success(res, null, "Member removed successfully")
    } catch (error) {
      next(error)
    }
  }
}
