export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
  pagination?: PaginationMeta
}

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode?: number
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  filters?: Record<string, any>
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: UserRole
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// Project Types
export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  visibility: ProjectVisibility
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export enum ProjectVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
  TEAM = "team",
}

// Prompt Types
export interface Prompt {
  id: string
  title: string
  content: string
  projectId: string
  authorId: string
  status: PromptStatus
  version: number
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export enum PromptStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// Collaboration Types
export interface ProjectCollaborator {
  id: string
  projectId: string
  userId: string
  role: CollaboratorRole
  permissions: Record<string, any>
  invitedBy: string
  joinedAt: Date
}

export enum CollaboratorRole {
  VIEWER = "viewer",
  EDITOR = "editor",
  ADMIN = "admin",
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
