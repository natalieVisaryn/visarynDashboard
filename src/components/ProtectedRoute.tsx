import { Navigate } from 'react-router-dom';
import { useUser, normalizeUserAccountType } from '../context/userContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, user must match this role exactly. Ignored when `allowedRoles` is set. */
  requiredRole?: "ADMIN" | "USER";
  /** If set, user must have one of these roles (e.g. USER and ADMIN for screening detail). */
  allowedRoles?: ("ADMIN" | "USER")[];
}

const ProtectedRoute = ({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeUserAccountType(user.accountType) ?? null;

  if (allowedRoles) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole) {
    if (role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
