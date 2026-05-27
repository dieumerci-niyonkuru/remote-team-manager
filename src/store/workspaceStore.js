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
      addWorkspace: (workspace) => set((state) => ({ workspaces: [...state.workspaces, workspace] })),
      updateWorkspace: (id, updates) => set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        activeWorkspace: state.activeWorkspace?.id === id ? { ...state.activeWorkspace, ...updates } : state.activeWorkspace,
      })),
      removeWorkspace: (id) => set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== id),
        activeWorkspace: state.activeWorkspace?.id === id ? null : state.activeWorkspace,
      })),
      setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearWorkspaces: () => set({ workspaces: [], activeWorkspace: null, error: null }),
    }),
    { name: 'rtm-workspace' }
  )
);
