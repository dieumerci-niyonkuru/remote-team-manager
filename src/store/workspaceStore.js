import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: false,
      error: null,
      setWorkspaces: (workspaces) => set({ workspaces, isLoading: false, error: null }),
      setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearWorkspaces: () => set({ workspaces: [], activeWorkspace: null, error: null }),
    }),
    { name: 'rtm-workspace' }
  )
);
