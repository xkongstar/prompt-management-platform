export class ApiError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: any) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
    this.details = details

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}
