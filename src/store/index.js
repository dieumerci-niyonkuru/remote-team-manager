import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(persist(set => ({
  user: null, isAuth: false, theme: 'dark',
  workspaces: [], activeWorkspace: null,
  setUser: u => set({ user: u, isAuth: !!u }),
  setWorkspaces: w => set({ workspaces: w }),
  setActiveWorkspace: aw => set({ activeWorkspace: aw }),
  logout: () => { 
    localStorage.removeItem('rtm_access'); 
    localStorage.removeItem('rtm_refresh'); 
    set({ user: null, isAuth: false, workspaces: [], activeWorkspace: null }) 
  },
  setTheme: t => set({ theme: t }),
}), { name: 'rtm-store' }))
