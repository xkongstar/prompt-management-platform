import { PrismaClient } from "@prisma/client"
import { logger } from "./logger"

class Database {
  private static instance: PrismaClient

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          {
            emit: "event",
            level: "query",
          },
          {
            emit: "event",
            level: "error",
          },
          {
            emit: "event",
            level: "info",
          },
          {
            emit: "event",
            level: "warn",
          },
        ],
      })

      // Log database queries in development
      if (process.env.NODE_ENV === "development") {
        Database.instance.$on("query", (e) => {
          logger.debug("Query: " + e.query)
          logger.debug("Params: " + e.params)
          logger.debug("Duration: " + e.duration + "ms")
        })
      }

      Database.instance.$on("error", (e) => {
        logger.error("Database error:", e)
      })
    }

    return Database.instance
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = Database.getInstance()
      await prisma.$connect()
      logger.info("Database connected successfully")
    } catch (error) {
      logger.error("Database connection failed:", error)
      throw error
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const prisma = Database.getInstance()
      await prisma.$disconnect()
      logger.info("Database disconnected successfully")
    } catch (error) {
      logger.error("Database disconnection failed:", error)
      throw error
    }
  }
}

export const prisma = Database.getInstance()
export default Database
