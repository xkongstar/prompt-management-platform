import { apiClient } from "./api"
import type { Prompt, CreatePromptData, UpdatePromptData, PromptVersion, QueryParams } from "@/types"

export class PromptService {
  async getPrompts(params?: QueryParams) {
    return apiClient.get<Prompt[]>("/prompts", { params })
  }

  async getPrompt(id: string) {
    return apiClient.get<Prompt>(`/prompts/${id}`)
  }

  async createPrompt(data: CreatePromptData) {
    return apiClient.post<Prompt>("/prompts", data)
  }

  async updatePrompt(id: string, data: UpdatePromptData) {
    return apiClient.put<Prompt>(`/prompts/${id}`, data)
  }

  async deletePrompt(id: string) {
    return apiClient.delete(`/prompts/${id}`)
  }

  async duplicatePrompt(id: string, data?: { title?: string; projectId?: string }) {
    return apiClient.post<Prompt>(`/prompts/${id}/duplicate`, data)
  }

  async toggleFavorite(id: string) {
    return apiClient.post<{ favorited: boolean }>(`/prompts/${id}/favorite`)
  }

  async getVersions(id: string) {
    return apiClient.get<PromptVersion[]>(`/prompts/${id}/versions`)
  }

  async getVersion(id: string, version: number) {
    return apiClient.get<PromptVersion>(`/prompts/${id}/versions/${version}`)
  }

  async revertToVersion(id: string, version: number) {
    return apiClient.post<Prompt>(`/prompts/${id}/revert/${version}`)
  }

  async compareVersions(id: string, v1: number, v2: number) {
    return apiClient.get(`/prompts/${id}/diff/${v1}/${v2}`)
  }
}

export const promptService = new PromptService()
