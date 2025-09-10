import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authService } from "@/services/authService"
import type { AuthState, LoginCredentials, RegisterData, User, AuthTokens } from "@/types"
import { message } from "antd"

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true })
          const response = await authService.login(credentials)

          if (response.success && response.data) {
            const { user, tokens } = response.data
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            })
            message.success("Login successful")
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })
          const response = await authService.register(data)

          if (response.success && response.data) {
            const { user, tokens } = response.data
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            })
            message.success("Registration successful")
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        authService.logout().catch(() => {
          // Ignore logout errors
        })
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        })
        message.info("Logged out successfully")
      },

      refreshToken: async () => {
        try {
          const { tokens } = get()
          if (!tokens?.refreshToken) {
            throw new Error("No refresh token available")
          }

          const response = await authService.refreshToken(tokens.refreshToken)

          if (response.success && response.data) {
            set({
              tokens: response.data.tokens,
            })
          }
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await authService.updateProfile(data)

          if (response.success && response.data) {
            set({ user: response.data })
            message.success("Profile updated successfully")
          }
        } catch (error) {
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setTokens: (tokens: AuthTokens) => {
        set({ tokens })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
