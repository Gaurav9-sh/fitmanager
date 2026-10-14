import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect member role to portal
  if (user?.role === 'member' && !window.location.pathname.startsWith('/portal')) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return <>{children}</>;
}
