import type { Request, Response, NextFunction } from "express"
import { ApiError } from "@/utils/ApiError"
import { logger } from "@/config/logger"
import type { ApiResponse } from "@/types"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })

  if (error instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      errors: error.details,
    }

    res.status(error.statusCode).json(response)
    return
  }

  // Handle Prisma errors
  if (error.name === "PrismaClientKnownRequestError") {
    const response: ApiResponse = {
      success: false,
      message: "Database operation failed",
    }

    res.status(400).json(response)
    return
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    const response: ApiResponse = {
      success: false,
      message: "Invalid token",
    }

    res.status(401).json(response)
    return
  }

  // Default error response
  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
  }

  res.status(500).json(response)
}

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
  }

  res.status(404).json(response)
}
