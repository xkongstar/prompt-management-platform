import type { Request, Response, NextFunction } from "express"
import { validationResult, type ValidationChain } from "express-validator"
import { ApiError } from "@/utils/ApiError"

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const validationErrors = errors.array().map((error) => ({
      field: error.type === "field" ? error.path : "unknown",
      message: error.msg,
      value: error.type === "field" ? error.value : undefined,
    }))

    next(new ApiError("Validation failed", 400, "VALIDATION_ERROR", validationErrors))
  }
}
