import { Router } from "express"
import { body, param } from "express-validator"
import { ProjectController } from "@/controllers/ProjectController"
import { validate } from "@/middleware/validation"
import { authenticate } from "@/middleware/auth"

const router = Router()
const projectController = new ProjectController()

// All project routes require authentication
router.use(authenticate)

// Validation rules
const createProjectValidation = [
  body("name").trim().isLength({ min: 1, max: 200 }).withMessage("Project name must be between 1 and 200 characters"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Description must not exceed 1000 characters"),
  body("visibility").optional().isIn(["private", "public", "team"]).withMessage("Invalid visibility option"),
]

const updateProjectValidation = [
  param("id").isUUID().withMessage("Invalid project ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Project name must be between 1 and 200 characters"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Description must not exceed 1000 characters"),
  body("visibility").optional().isIn(["private", "public", "team"]).withMessage("Invalid visibility option"),
]

const projectIdValidation = [param("id").isUUID().withMessage("Invalid project ID")]

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get user's projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", projectController.getProjects)

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validate(createProjectValidation), projectController.createProject)

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", validate(projectIdValidation), projectController.getProject)

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", validate(updateProjectValidation), projectController.updateProject)

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", validate(projectIdValidation), projectController.deleteProject)

/**
 * @swagger
 * /api/v1/projects/{id}/statistics:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/statistics", validate(projectIdValidation), projectController.getProjectStatistics)

// Member management routes
router.get("/:id/members", validate(projectIdValidation), projectController.getProjectMembers)
router.post("/:id/invitations", validate(projectIdValidation), projectController.inviteMember)
router.put("/:id/members/:userId", validate(projectIdValidation), projectController.updateMemberRole)
router.delete("/:id/members/:userId", validate(projectIdValidation), projectController.removeMember)

export default router
