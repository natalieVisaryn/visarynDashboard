import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuth } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      // Check authentication via API (this will include cookies automatically)
      // hasCookie() now uses checkAuth() internally, so we can just use checkAuth()
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
    };

    verifyAuth();
  }, []);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null; // Or you could return a loading spinner
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
