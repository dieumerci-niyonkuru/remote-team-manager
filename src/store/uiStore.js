import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      lang: 'en',
      sidebarCollapsed: false,
      isSyncing: false,
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSyncing: (isSyncing) => set({ isSyncing }),
    }),
    { name: 'rtm-ui' }
  )
);
