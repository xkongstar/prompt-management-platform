import { Router } from "express"
import { SearchController } from "@/controllers/SearchController"
import { authenticate } from "@/middleware/auth"

const router = Router()
const searchController = new SearchController()

// All search routes require authentication
router.use(authenticate)

/**
 * @swagger
 * /api/v1/search/prompts:
 *   get:
 *     summary: Search prompts
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
router.get("/prompts", searchController.searchPrompts)

/**
 * @swagger
 * /api/v1/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
router.get("/suggestions", searchController.getSearchSuggestions)

/**
 * @swagger
 * /api/v1/search/advanced:
 *   post:
 *     summary: Advanced search
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
router.post("/advanced", searchController.advancedSearch)

export default router
