import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  // Admin always has access; staff roles checked against allowedRoles
  const userIsAdmin = user.role === 'admin';
  const hasAccess = allowedRoles.includes('admin') ? userIsAdmin : !userIsAdmin;
  if (!hasAccess) {
    return <Navigate to={userIsAdmin ? '/admin/dashboard' : '/staff/dashboard'} replace />;
  }
  return children;
}
