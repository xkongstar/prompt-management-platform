import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { useAuthStore } from "@/stores/authStore"
import { message } from "antd"
import type { ApiResponse } from "@/types"

class ApiClient {
  private axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.axios.interceptors.request.use(
      (config) => {
        const { tokens } = useAuthStore.getState()
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor - Handle errors and token refresh
    this.axios.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const { tokens, refreshToken, logout } = useAuthStore.getState()

            if (tokens?.refreshToken) {
              await refreshToken()
              // Retry original request with new token
              const newTokens = useAuthStore.getState().tokens
              if (newTokens?.accessToken) {
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
                return this.axios(originalRequest)
              }
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            useAuthStore.getState().logout()
            window.location.href = "/auth/login"
            return Promise.reject(refreshError)
          }
        }

        // Handle other errors
        if (error.response?.data?.message) {
          message.error(error.response.data.message)
        } else if (error.message) {
          message.error(error.message)
        }

        return Promise.reject(error)
      },
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.delete<ApiResponse<T>>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
