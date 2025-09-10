// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
  pagination?: PaginationMeta
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

// User Types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: UserRole
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  USER = "user",
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

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Project Types
export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  visibility: ProjectVisibility
  settings: Record<string, any>
  createdAt: string
  updatedAt: string
  owner?: User
  _count?: {
    prompts: number
    collaborators: number
  }
}

export enum ProjectVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
  TEAM = "team",
}

export interface CreateProjectData {
  name: string
  description?: string
  visibility?: ProjectVisibility
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
  createdAt: string
  updatedAt: string
  author?: User
  project?: Project
  tags?: PromptTag[]
  _count?: {
    versions: number
  }
}

export enum PromptStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface CreatePromptData {
  title: string
  content: string
  projectId: string
  tags?: string[]
  status?: PromptStatus
}

export interface UpdatePromptData {
  title?: string
  content?: string
  status?: PromptStatus
  changeLog?: string
}

// Tag Types
export interface Tag {
  id: string
  name: string
  color: string
  projectId: string
  createdAt: string
  _count?: {
    prompts: number
  }
}

export interface PromptTag {
  promptId: string
  tagId: string
  tag: Tag
}

export interface CreateTagData {
  name: string
  color?: string
  projectId: string
}

// Version Types
export interface PromptVersion {
  id: string
  promptId: string
  version: number
  title: string
  content: string
  changeLog?: string
  authorId: string
  createdAt: string
  author?: User
}

// Collaboration Types
export interface ProjectCollaborator {
  id: string
  projectId: string
  userId: string
  role: CollaboratorRole
  permissions: Record<string, any>
  invitedBy: string
  joinedAt: string
  user?: User
  invitedBy?: User
}

export enum CollaboratorRole {
  VIEWER = "viewer",
  EDITOR = "editor",
  ADMIN = "admin",
}

// Search Types
export interface SearchParams {
  q?: string
  projectId?: string
  tags?: string[]
  status?: PromptStatus[]
  authorIds?: string[]
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface SearchSuggestions {
  tags: string[]
  prompts: string[]
}

// UI State Types
export interface UIState {
  sidebarCollapsed: boolean
  theme: "light" | "dark"
  loading: Record<string, boolean>
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
}

// Query Types
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  filters?: Record<string, any>
}

// Form Types
export interface FormState<T = any> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
}
