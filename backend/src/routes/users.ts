import { Router } from "express"
import { UserController } from "@/controllers/UserController"
import { authenticate, authorize } from "@/middleware/auth"

const router = Router()
const userController = new UserController()

// All user routes require authentication
router.use(authenticate)

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authorize("admin"), userController.getUsers)

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: Search users for collaboration
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/search", userController.searchUsers)

export default router
