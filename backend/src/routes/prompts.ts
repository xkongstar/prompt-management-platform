import { Router } from "express"
import { body, param } from "express-validator"
import { PromptController } from "@/controllers/PromptController"
import { validate } from "@/middleware/validation"
import { authenticate } from "@/middleware/auth"

const router = Router()
const promptController = new PromptController()

// All prompt routes require authentication
router.use(authenticate)

// Validation rules
const createPromptValidation = [
  body("title").trim().isLength({ min: 1, max: 500 }).withMessage("Title must be between 1 and 500 characters"),
  body("content").trim().isLength({ min: 1 }).withMessage("Content is required"),
  body("projectId").isUUID().withMessage("Invalid project ID"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
]

const updatePromptValidation = [
  param("id").isUUID().withMessage("Invalid prompt ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Title must be between 1 and 500 characters"),
  body("content").optional().trim().isLength({ min: 1 }).withMessage("Content cannot be empty"),
  body("status").optional().isIn(["draft", "published", "archived"]).withMessage("Invalid status"),
]

const promptIdValidation = [param("id").isUUID().withMessage("Invalid prompt ID")]

/**
 * @swagger
 * /api/v1/prompts:
 *   get:
 *     summary: Get prompts with filtering and pagination
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", promptController.getPrompts)

/**
 * @swagger
 * /api/v1/prompts:
 *   post:
 *     summary: Create a new prompt
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validate(createPromptValidation), promptController.createPrompt)

/**
 * @swagger
 * /api/v1/prompts/{id}:
 *   get:
 *     summary: Get prompt by ID
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", validate(promptIdValidation), promptController.getPrompt)

/**
 * @swagger
 * /api/v1/prompts/{id}:
 *   put:
 *     summary: Update prompt
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", validate(updatePromptValidation), promptController.updatePrompt)

/**
 * @swagger
 * /api/v1/prompts/{id}:
 *   delete:
 *     summary: Delete prompt
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", validate(promptIdValidation), promptController.deletePrompt)

/**
 * @swagger
 * /api/v1/prompts/{id}/duplicate:
 *   post:
 *     summary: Duplicate prompt
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/duplicate", validate(promptIdValidation), promptController.duplicatePrompt)

/**
 * @swagger
 * /api/v1/prompts/{id}/favorite:
 *   post:
 *     summary: Toggle favorite status
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/favorite", validate(promptIdValidation), promptController.toggleFavorite)

// Version management routes
router.get("/:id/versions", validate(promptIdValidation), promptController.getVersions)
router.get("/:id/versions/:version", validate(promptIdValidation), promptController.getVersion)
router.post("/:id/revert/:version", validate(promptIdValidation), promptController.revertToVersion)
router.get("/:id/diff/:v1/:v2", validate(promptIdValidation), promptController.compareVersions)

export default router
