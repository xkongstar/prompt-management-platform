import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import rateLimit from "express-rate-limit"
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler"
import { logger } from "@/config/logger"
import { setupSwagger } from "@/config/swagger"

// Import routes
import authRoutes from "@/routes/auth"
import projectRoutes from "@/routes/projects"
import promptRoutes from "@/routes/prompts"
import userRoutes from "@/routes/users"
import searchRoutes from "@/routes/search"
import tagRoutes from "@/routes/tags"

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Compression middleware
app.use(compression())

// Logging middleware
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim())
      },
    },
  }),
)

// Setup Swagger documentation
setupSwagger(app)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
const API_VERSION = process.env.API_VERSION || "v1"
app.use(`/api/${API_VERSION}/auth`, authRoutes)
app.use(`/api/${API_VERSION}/projects`, projectRoutes)
app.use(`/api/${API_VERSION}/prompts`, promptRoutes)
app.use(`/api/${API_VERSION}/users`, userRoutes)
app.use(`/api/${API_VERSION}/search`, searchRoutes)
app.use(`/api/${API_VERSION}/tags`, tagRoutes)

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
