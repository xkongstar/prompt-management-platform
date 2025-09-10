import { Router } from "express"
import { body, param } from "express-validator"
import { TagController } from "@/controllers/TagController"
import { validate } from "@/middleware/validation"
import { authenticate } from "@/middleware/auth"

const router = Router()
const tagController = new TagController()

// All tag routes require authentication
router.use(authenticate)

// Validation rules
const createTagValidation = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Tag name must be between 1 and 100 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Color must be a valid hex color"),
  body("projectId").isUUID().withMessage("Invalid project ID"),
]

const updateTagValidation = [
  param("id").isUUID().withMessage("Invalid tag ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Tag name must be between 1 and 100 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Color must be a valid hex color"),
]

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     summary: Get tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", tagController.getTags)

/**
 * @swagger
 * /api/v1/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validate(createTagValidation), tagController.createTag)

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   put:
 *     summary: Update tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", validate(updateTagValidation), tagController.updateTag)

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   delete:
 *     summary: Delete tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", validate([param("id").isUUID().withMessage("Invalid tag ID")]), tagController.deleteTag)

/**
 * @swagger
 * /api/v1/tags/popular:
 *   get:
 *     summary: Get popular tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.get("/popular", tagController.getPopularTags)

export default router
