import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from '@/components';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Admin Routes - Require authentication and ADMIN role */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AppRouter;