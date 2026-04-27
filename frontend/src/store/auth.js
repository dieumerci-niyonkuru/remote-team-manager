import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      theme: 'dark',
      language: 'en',
      setAuth: (user) => {
        set({ user, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
      setTheme: theme => set({ theme }),
      setLanguage: lang => set({ language: lang }),
    }),
    { name: 'auth-storage' }
  )
)
