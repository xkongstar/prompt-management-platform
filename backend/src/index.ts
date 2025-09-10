import dotenv from "dotenv"
import app from "./app"
import Database from "@/config/database"
import RedisClient from "@/config/redis"
import { logger } from "@/config/logger"

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 8000

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await Database.connect()

    // Connect to Redis
    await RedisClient.connect()

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`)
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully")
  await Database.disconnect()
  await RedisClient.disconnect()
  process.exit(0)
})

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully")
  await Database.disconnect()
  await RedisClient.disconnect()
  process.exit(0)
})

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

startServer()
