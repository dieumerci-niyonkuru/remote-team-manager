// NOTE: useStore is a unified React hook. It should ONLY be imported and called
// inside React components or other custom hooks. Importing it in plain JS modules
// (e.g., services, utilities) will cause "Invalid hook call" errors.
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
