import type { Response, NextFunction } from "express"
import { prisma } from "@/config/database"
import { ResponseUtil } from "@/utils/response"
import type { AuthenticatedRequest } from "@/middleware/auth"

export class SearchController {
  async searchPrompts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { q: query, projectId, tags, status, page = 1, limit = 10 } = req.query

      if (!query) {
        ResponseUtil.success(res, [], "No query provided")
        return
      }

      const skip = (Number(page) - 1) * Number(limit)

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
        OR: [
          { title: { contains: query as string, mode: "insensitive" } },
          { content: { contains: query as string, mode: "insensitive" } },
        ],
      }

      if (projectId) {
        where.projectId = projectId as string
      }

      if (status) {
        where.status = status as string
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
          orderBy: { updatedAt: "desc" },
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

      ResponseUtil.success(res, prompts, "Search results retrieved successfully", 200, pagination)
    } catch (error) {
      next(error)
    }
  }

  async getSearchSuggestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { q: query } = req.query

      if (!query || (query as string).length < 2) {
        ResponseUtil.success(res, [], "Query too short")
        return
      }

      // Get tag suggestions
      const tagSuggestions = await prisma.tag.findMany({
        where: {
          name: { contains: query as string, mode: "insensitive" },
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
        take: 5,
        select: { name: true },
      })

      // Get prompt title suggestions
      const promptSuggestions = await prisma.prompt.findMany({
        where: {
          title: { contains: query as string, mode: "insensitive" },
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
        take: 5,
        select: { title: true },
      })

      const suggestions = {
        tags: tagSuggestions.map((tag) => tag.name),
        prompts: promptSuggestions.map((prompt) => prompt.title),
      }

      ResponseUtil.success(res, suggestions, "Suggestions retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async advancedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const {
        query,
        projectIds,
        tags,
        status,
        authorIds,
        dateFrom,
        dateTo,
        page = 1,
        limit = 10,
        sortBy = "updatedAt",
        sortOrder = "desc",
      } = req.body

      const skip = (Number(page) - 1) * Number(limit)

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

      if (query) {
        where.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ]
      }

      if (projectIds && projectIds.length > 0) {
        where.projectId = { in: projectIds }
      }

      if (status && status.length > 0) {
        where.status = { in: status }
      }

      if (authorIds && authorIds.length > 0) {
        where.authorId = { in: authorIds }
      }

      if (tags && tags.length > 0) {
        where.tags = {
          some: {
            tag: {
              name: { in: tags },
            },
          },
        }
      }

      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom)
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo)
        }
      }

      const [prompts, total] = await Promise.all([
        prisma.prompt.findMany({
          where,
          skip,
          take: Number(limit),
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
          orderBy: { [sortBy]: sortOrder },
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

      ResponseUtil.success(res, prompts, "Advanced search results retrieved successfully", 200, pagination)
    } catch (error) {
      next(error)
    }
  }
}
