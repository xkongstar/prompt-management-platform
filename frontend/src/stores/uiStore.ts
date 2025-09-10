import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UIState, Notification } from "@/types"

interface UIStore extends UIState {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: "light" | "dark") => void
  setLoading: (key: string, loading: boolean) => void
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: "light",
      loading: {},
      notifications: [],

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },

      setTheme: (theme: "light" | "dark") => {
        set({ theme })
      },

      setLoading: (key: string, loading: boolean) => {
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: loading,
          },
        }))
      },

      addNotification: (notification: Omit<Notification, "id">) => {
        const id = Date.now().toString()
        const newNotification: Notification = {
          ...notification,
          id,
        }

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))

        // Auto remove notification after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, notification.duration || 4500)
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    },
  ),
)
