import { apiClient } from "./api"
import type { Project, CreateProjectData, QueryParams } from "@/types"

export class ProjectService {
  async getProjects(params?: QueryParams) {
    return apiClient.get<Project[]>("/projects", { params })
  }

  async getProject(id: string) {
    return apiClient.get<Project>(`/projects/${id}`)
  }

  async createProject(data: CreateProjectData) {
    return apiClient.post<Project>("/projects", data)
  }

  async updateProject(id: string, data: Partial<CreateProjectData>) {
    return apiClient.put<Project>(`/projects/${id}`, data)
  }

  async deleteProject(id: string) {
    return apiClient.delete(`/projects/${id}`)
  }

  async getProjectStatistics(id: string) {
    return apiClient.get(`/projects/${id}/statistics`)
  }

  async getProjectMembers(id: string) {
    return apiClient.get(`/projects/${id}/members`)
  }

  async inviteMember(id: string, data: { email: string; role: string }) {
    return apiClient.post(`/projects/${id}/invitations`, data)
  }

  async updateMemberRole(projectId: string, userId: string, role: string) {
    return apiClient.put(`/projects/${projectId}/members/${userId}`, { role })
  }

  async removeMember(projectId: string, userId: string) {
    return apiClient.delete(`/projects/${projectId}/members/${userId}`)
  }
}

export const projectService = new ProjectService()
