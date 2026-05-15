import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      setUser: (user) => set({ user, isAuth: !!user }),
      logout: () => {
        localStorage.removeItem('rtm_access');
        localStorage.removeItem('rtm_refresh');
        set({ user: null, isAuth: false });
      },
    }),
    { name: 'rtm-auth' }
  )
);
