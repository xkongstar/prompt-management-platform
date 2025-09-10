import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"
import type { CreateProjectData, QueryParams } from "@/types"
import { message } from "antd"

export const useProjects = (params?: QueryParams) => {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => projectService.getProjects(params),
  })
}

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      message.success("Project created successfully")
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create project")
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectData> }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["project", id] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      message.success("Project updated successfully")
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update project")
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      message.success("Project deleted successfully")
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete project")
    },
  })
}

export const useProjectStatistics = (id: string) => {
  return useQuery({
    queryKey: ["project-statistics", id],
    queryFn: () => projectService.getProjectStatistics(id),
    enabled: !!id,
  })
}
