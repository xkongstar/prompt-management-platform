import type { Response, NextFunction } from "express"
import { prisma } from "@/config/database"
import { ResponseUtil } from "@/utils/response"
import type { AuthenticatedRequest } from "@/middleware/auth"

export class UserController {
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const where = search
        ? {
            OR: [
              { name: { contains: search as string, mode: "insensitive" } },
              { email: { contains: search as string, mode: "insensitive" } },
            ],
          }
        : {}

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ])

      const pagination = {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + Number(limit) < total,
        hasPrev: Number(page) > 1,
      }

      ResponseUtil.success(res, users, "Users retrieved successfully", 200, pagination)
    } catch (error) {
      next(error)
    }
  }

  async searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query, limit = 10 } = req.query

      if (!query) {
        ResponseUtil.success(res, [], "No query provided")
        return
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query as string, mode: "insensitive" } },
            { email: { contains: query as string, mode: "insensitive" } },
          ],
        },
        take: Number(limit),
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      })

      ResponseUtil.success(res, users, "Users found")
    } catch (error) {
      next(error)
    }
  }
}
