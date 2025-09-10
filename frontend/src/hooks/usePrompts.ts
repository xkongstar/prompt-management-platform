import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { promptService } from "@/services/promptService"
import type { CreatePromptData, UpdatePromptData, QueryParams } from "@/types"
import { message } from "antd"

export const usePrompts = (params?: QueryParams) => {
  return useQuery({
    queryKey: ["prompts", params],
    queryFn: () => promptService.getPrompts(params),
  })
}

export const usePrompt = (id: string) => {
  return useQuery({
    queryKey: ["prompt", id],
    queryFn: () => promptService.getPrompt(id),
    enabled: !!id,
  })
}

export const useCreatePrompt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePromptData) => promptService.createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] })
      message.success("Prompt created successfully")
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create prompt")
    },
  })
}

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromptData }) => promptService.updatePrompt(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["prompt", id] })
      queryClient.invalidateQueries({ queryKey: ["prompts"] })
      message.success("Prompt updated successfully")
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update prompt")
    },
  })
}

export const useDeletePrompt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promptService.deletePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] })
      message.success("Prompt deleted successfully")
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete prompt")
    },
  })
}

export const useDuplicatePrompt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { title?: string; projectId?: string } }) =>
      promptService.duplicatePrompt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] })
      message.success("Prompt duplicated successfully")
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to duplicate prompt")
    },
  })
}

export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promptService.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to toggle favorite")
    },
  })
}

export const usePromptVersions = (id: string) => {
  return useQuery({
    queryKey: ["prompt-versions", id],
    queryFn: () => promptService.getVersions(id),
    enabled: !!id,
  })
}
