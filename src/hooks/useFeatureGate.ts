import { useAuthStore } from '../store/authStore';

/**
 * Hook to determine if the current user has at least one of the allowed roles.
 * @param allowedRoles Array of role strings (e.g., ['admin', 'workspace_owner'])
 * @returns boolean – true if the user's role matches one of the allowed roles.
 */
export const useFeatureGate = (allowedRoles: string[]): boolean => {
  const { user } = useAuthStore();
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};
