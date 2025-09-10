import type { Response } from "express"
import type { ApiResponse, PaginationMeta } from "@/types"

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message = "Success", statusCode = 200, pagination?: PaginationMeta): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      pagination,
    }

    res.status(statusCode).json(response)
  }

  static error(res: Response, message = "Error occurred", statusCode = 500, errors?: any): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    }

    res.status(statusCode).json(response)
  }

  static created<T>(res: Response, data?: T, message = "Resource created successfully"): void {
    ResponseUtil.success(res, data, message, 201)
  }

  static noContent(res: Response, message = "No content"): void {
    const response: ApiResponse = {
      success: true,
      message,
    }

    res.status(204).json(response)
  }
}
