import { apiClient } from "./api"
import type { LoginCredentials, RegisterData, User, AuthTokens } from "@/types"

export class AuthService {
  async login(credentials: LoginCredentials) {
    return apiClient.post<{ user: User; tokens: AuthTokens }>("/auth/login", credentials)
  }

  async register(data: RegisterData) {
    return apiClient.post<{ user: User; tokens: AuthTokens }>("/auth/register", data)
  }

  async refreshToken(refreshToken: string) {
    return apiClient.post<{ tokens: AuthTokens }>("/auth/refresh", { refreshToken })
  }

  async logout() {
    return apiClient.post("/auth/logout")
  }

  async getProfile() {
    return apiClient.get<User>("/auth/profile")
  }

  async updateProfile(data: Partial<User>) {
    return apiClient.put<User>("/auth/profile", data)
  }
}

export const authService = new AuthService()
