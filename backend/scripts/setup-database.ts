import { execSync } from "child_process"
import { PrismaClient } from "@prisma/client"
import { logger } from "../src/config/logger"

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    logger.info("🚀 Starting database setup...")

    // Check if database is accessible
    logger.info("📡 Testing database connection...")
    await prisma.$connect()
    logger.info("✅ Database connection successful")

    // Generate Prisma client
    logger.info("🔧 Generating Prisma client...")
    execSync("npx prisma generate", { stdio: "inherit" })
    logger.info("✅ Prisma client generated")

    // Run migrations
    logger.info("📦 Running database migrations...")
    execSync("npx prisma migrate deploy", { stdio: "inherit" })
    logger.info("✅ Database migrations completed")

    // Check if we should seed the database
    const userCount = await prisma.user.count()

    if (userCount === 0) {
      logger.info("🌱 Database is empty, running seed...")
      execSync("npx prisma db seed", { stdio: "inherit" })
      logger.info("✅ Database seeded successfully")
    } else {
      logger.info(`📊 Database already contains ${userCount} users, skipping seed`)
    }

    logger.info("🎉 Database setup completed successfully!")
  } catch (error) {
    logger.error("❌ Database setup failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      logger.error("Setup failed:", error)
      process.exit(1)
    })
}

export { setupDatabase }
