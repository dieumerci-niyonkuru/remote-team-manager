import { useAuthStore } from './authStore';
import { useWorkspaceStore } from './workspaceStore';
import { useUIStore } from './uiStore';
import { usePresenceStore } from './presenceStore';

// Unified hook for backward compatibility with existing components
export const useStore = () => {
  const auth = useAuthStore();
  const workspace = useWorkspaceStore();
  const ui = useUIStore();
  const presence = usePresenceStore();

  return {
    ...auth,
    ...workspace,
    ...ui,
    ...presence,
    // Custom unified logout
    logout: () => {
      auth.logout();
      workspace.clearWorkspaces();
    }
  };
};

export { useAuthStore, useWorkspaceStore, useUIStore, usePresenceStore };
