import { useAuthStore } from '../store/authStore';

/**
 * useFeatureGate - checks whether the current user's role is in the allowed list.
 *
 * @param {string[] | undefined} requiredRoles - array of roles that may access the feature.
 *   If undefined or empty, access is granted to any authenticated user.
 * @returns {boolean} true when the user passes the gate
 */
export function useFeatureGate(requiredRoles) {
  const user = useAuthStore((s) => s.user);

  // No restriction defined — always pass
  if (!requiredRoles || requiredRoles.length === 0) return true;

  // Not logged in — deny
  if (!user) return false;

  // Super-admins always have access
  if (user.role === 'super_admin') return true;

  return requiredRoles.includes(user.role);
}

export default useFeatureGate;
