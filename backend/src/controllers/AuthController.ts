import type { Request, Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/config/database"
import { ResponseUtil } from "@/utils/response"
import { ApiError } from "@/utils/ApiError"
import type { AuthenticatedRequest } from "@/middleware/auth"
import type { JwtPayload, AuthTokens } from "@/types"
import RedisClient from "@/config/redis"

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new ApiError("User with this email already exists", 409, "USER_EXISTS")
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          role: "USER",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      })

      // Generate tokens
      const tokens = this.generateTokens(user)

      ResponseUtil.created(
        res,
        {
          user,
          tokens,
        },
        "User registered successfully",
      )
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new ApiError("Invalid credentials", 401, "INVALID_CREDENTIALS")
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

      if (!isPasswordValid) {
        throw new ApiError("Invalid credentials", 401, "INVALID_CREDENTIALS")
      }

      // Generate tokens
      const tokens = this.generateTokens(user)

      // Store refresh token in Redis
      await RedisClient.set(
        `refresh_token:${user.id}`,
        tokens.refreshToken,
        30 * 24 * 60 * 60, // 30 days
      )

      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      }

      ResponseUtil.success(
        res,
        {
          user: userResponse,
          tokens,
        },
        "Login successful",
      )
    } catch (error) {
      next(error)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        throw new ApiError("Refresh token is required", 400, "MISSING_REFRESH_TOKEN")
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload

      // Check if refresh token exists in Redis
      const storedToken = await RedisClient.get(`refresh_token:${decoded.userId}`)

      if (!storedToken || storedToken !== refreshToken) {
        throw new ApiError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN")
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        throw new ApiError("User not found", 404, "USER_NOT_FOUND")
      }

      // Generate new tokens
      const tokens = this.generateTokens(user)

      // Update refresh token in Redis
      await RedisClient.set(
        `refresh_token:${user.id}`,
        tokens.refreshToken,
        30 * 24 * 60 * 60, // 30 days
      )

      ResponseUtil.success(res, { tokens }, "Tokens refreshed successfully")
    } catch (error) {
      next(error)
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id

      // Remove refresh token from Redis
      await RedisClient.del(`refresh_token:${userId}`)

      ResponseUtil.success(res, null, "Logout successful")
    } catch (error) {
      next(error)
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        throw new ApiError("User not found", 404, "USER_NOT_FOUND")
      }

      ResponseUtil.success(res, user, "Profile retrieved successfully")
    } catch (error) {
      next(error)
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const { name, avatarUrl } = req.body

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(avatarUrl && { avatarUrl }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      ResponseUtil.success(res, updatedUser, "Profile updated successfully")
    } catch (error) {
      next(error)
    }
  }

  private generateTokens(user: any): AuthTokens {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" })

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    })

    return {
      accessToken,
      refreshToken,
    }
  }
}
