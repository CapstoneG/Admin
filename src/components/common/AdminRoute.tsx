import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const hasAdminRole = user?.roles?.some((role: any) => 
    role.name === 'ADMIN' || role.name === 'admin'
  );

  if (!hasAdminRole) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          You don't have permission to access this page.
        </p>
        <a 
          href="/" 
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Go to Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
