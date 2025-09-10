import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "@/config/database"
import type { JwtPayload } from "@/types"
import { ApiError } from "@/utils/ApiError"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Access token is required", 401, "UNAUTHORIZED")
    }

    const token = authHeader.substring(7)

    if (!process.env.JWT_SECRET) {
      throw new ApiError("JWT secret is not configured", 500, "SERVER_ERROR")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      throw new ApiError("User not found", 401, "UNAUTHORIZED")
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError("Invalid token", 401, "UNAUTHORIZED"))
    } else {
      next(error)
    }
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError("Authentication required", 401, "UNAUTHORIZED")
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError("Insufficient permissions", 403, "FORBIDDEN")
    }

    next()
  }
}
