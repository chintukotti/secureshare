import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
export default function PublicOnlyRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  if (isAuthLoading) return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner label="Loading..." /></div>;
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <Outlet />;
}
