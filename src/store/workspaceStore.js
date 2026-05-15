import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      workspaces: [],
      activeWorkspace: null,
      setWorkspaces: (workspaces) => set({ workspaces }),
      setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
      clearWorkspaces: () => set({ workspaces: [], activeWorkspace: null }),
    }),
    { name: 'rtm-workspace' }
  )
);
