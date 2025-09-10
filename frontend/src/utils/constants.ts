export const APP_NAME = import.meta.env.VITE_APP_NAME || "Prompt Management Platform"
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0"
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:id",
  PROMPTS: "/prompts",
  PROMPT_DETAIL: "/prompts/:id",
  PROMPT_EDIT: "/prompts/:id/edit",
  PROMPT_VERSIONS: "/prompts/:id/versions",
  SEARCH: "/search",
  FAVORITES: "/favorites",
  SETTINGS: "/settings",
} as const

export const QUERY_KEYS = {
  PROJECTS: "projects",
  PROJECT: "project",
  PROMPTS: "prompts",
  PROMPT: "prompt",
  TAGS: "tags",
  USERS: "users",
  SEARCH: "search",
} as const

export const STORAGE_KEYS = {
  AUTH: "auth-storage",
  UI: "ui-storage",
  THEME: "theme",
} as const

export const DEFAULT_PAGE_SIZE = 20
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const PROMPT_STATUS_COLORS = {
  draft: "#faad14",
  published: "#52c41a",
  archived: "#d9d9d9",
} as const

export const PROJECT_VISIBILITY_COLORS = {
  private: "#fa541c",
  public: "#13c2c2",
  team: "#722ed1",
} as const
