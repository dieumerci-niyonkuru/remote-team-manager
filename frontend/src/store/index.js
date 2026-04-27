import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(persist(set => ({
  user: null, isAuth: false, theme: 'dark', lang: 'en',
  setUser: u => set({ user: u, isAuth: !!u }),
  logout: () => { localStorage.removeItem('rtm_access'); localStorage.removeItem('rtm_refresh'); set({ user: null, isAuth: false }) },
  setTheme: t => set({ theme: t }),
  setLang: l => set({ lang: l }),
}), { name: 'rtm-store' }))
