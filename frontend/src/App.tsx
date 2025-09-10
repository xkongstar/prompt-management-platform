import type React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "antd"
import { useAuthStore } from "@/stores/authStore"
import { ROUTES } from "@/utils/constants"

// Layout components
import AuthLayout from "@/components/layouts/AuthLayout"
import AppLayout from "@/components/layouts/AppLayout"

// Auth pages
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"

// App pages
import DashboardPage from "@/pages/DashboardPage"
import ProjectsPage from "@/pages/projects/ProjectsPage"
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage"
import PromptsPage from "@/pages/prompts/PromptsPage"
import PromptDetailPage from "@/pages/prompts/PromptDetailPage"
import PromptEditPage from "@/pages/prompts/PromptEditPage"
import SearchPage from "@/pages/SearchPage"
import FavoritesPage from "@/pages/FavoritesPage"
import SettingsPage from "@/pages/SettingsPage"

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <Layout className="full-height">
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth/*"
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="prompts" element={<PromptsPage />} />
          <Route path="prompts/:id" element={<PromptDetailPage />} />
          <Route path="prompts/:id/edit" element={<PromptEditPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Layout>
  )
}

export default App
