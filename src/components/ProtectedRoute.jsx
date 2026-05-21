import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store'; // Assuming useStore provides auth state
import { useFeatureGate } from '../hooks/useFeatureGate';

/**
 * ProtectedRoute wraps a route element and enforces authentication and role-based access.
 * @param {Object} props
 * @param {string[]} props.requiredRoles - roles allowed to view the wrapped component.
 * @param {React.ReactNode} props.children - the component to render when access is granted.
 */
const ProtectedRoute = ({ requiredRoles, children }) => {
  const { isAuth } = useStore();
  const hasAccess = useFeatureGate(requiredRoles);

  if (!isAuth) {
    // Not logged in – redirect to login page
    return <Navigate to="/login" replace />;
  }
  if (!hasAccess) {
    // Authenticated but lacking required role – send to dashboard or a no‑access page
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
