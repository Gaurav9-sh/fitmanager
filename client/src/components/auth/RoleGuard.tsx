import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface Props {
  children: React.ReactNode;
  roles: string[];
}

export default function RoleGuard({ children, roles }: Props) {
  const { user } = useAuthStore();

  if (!user || !roles.includes(user.role)) {
    // Redirect based on role
    if (user?.role === 'member') return <Navigate to="/portal/dashboard" replace />;
    if (user?.role === 'trainer') return <Navigate to="/portal/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
