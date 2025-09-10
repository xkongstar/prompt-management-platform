import { createClient, type RedisClientType } from "redis"
import { logger } from "./logger"

class RedisClient {
  private static instance: RedisClientType

  public static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      })

      RedisClient.instance.on("error", (err) => {
        logger.error("Redis Client Error:", err)
      })

      RedisClient.instance.on("connect", () => {
        logger.info("Redis Client Connected")
      })

      RedisClient.instance.on("ready", () => {
        logger.info("Redis Client Ready")
      })

      RedisClient.instance.on("end", () => {
        logger.info("Redis Client Disconnected")
      })
    }

    return RedisClient.instance
  }

  public static async connect(): Promise<void> {
    try {
      const client = RedisClient.getInstance()
      if (!client.isOpen) {
        await client.connect()
      }
      logger.info("Redis connected successfully")
    } catch (error) {
      logger.error("Redis connection failed:", error)
      throw error
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const client = RedisClient.getInstance()
      if (client.isOpen) {
        await client.disconnect()
      }
      logger.info("Redis disconnected successfully")
    } catch (error) {
      logger.error("Redis disconnection failed:", error)
      throw error
    }
  }

  // Cache helper methods
  public static async get(key: string): Promise<string | null> {
    const client = RedisClient.getInstance()
    return await client.get(key)
  }

  public static async set(key: string, value: string, ttl?: number): Promise<void> {
    const client = RedisClient.getInstance()
    if (ttl) {
      await client.setEx(key, ttl, value)
    } else {
      await client.set(key, value)
    }
  }

  public static async del(key: string): Promise<void> {
    const client = RedisClient.getInstance()
    await client.del(key)
  }

  public static async exists(key: string): Promise<boolean> {
    const client = RedisClient.getInstance()
    const result = await client.exists(key)
    return result === 1
  }
}

export const redis = RedisClient.getInstance()
export default RedisClient
