import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--gray-50)', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '4px solid var(--primary-200)', borderTopColor: 'var(--primary-600)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--gray-500)', fontFamily: 'Inter, sans-serif' }}>Loading Sahakar Seva...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    const roleRoutes = { customer: '/customer', worker: '/worker', admin: '/admin' };
    return <Navigate to={roleRoutes[role] || '/auth'} replace />;
  }

  return children;
}
