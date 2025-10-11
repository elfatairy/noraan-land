import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { PATHS } from './paths';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to={role === 'admin' ? PATHS.ADMIN_LOGIN : PATHS.LOGIN} state={{ from: location }} replace />;
  // }

  // if (role && user?.role !== role) {
  //   return <Navigate to={PATHS.HOME} replace />;
  // }

  return children;
};
