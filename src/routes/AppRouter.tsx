import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from '@/components';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ListeningEdit from '@/pages/admin/skills/ListeningEdit';
import ReadingEdit from '@/pages/admin/skills/ReadingEdit';
import SpeakingEdit from '@/pages/admin/skills/SpeakingEdit';
import WritingEdit from '@/pages/admin/skills/WritingEdit';

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
      
      {/* Skills Management Routes */}
      <Route path="/admin/skills/listening/:id" element={
        <AdminRoute>
          <ListeningEdit />
        </AdminRoute>
      } />
      
      <Route path="/admin/skills/reading/:id" element={
        <AdminRoute>
          <ReadingEdit />
        </AdminRoute>
      } />
      
      <Route path="/admin/skills/speaking/:id" element={
        <AdminRoute>
          <SpeakingEdit />
        </AdminRoute>
      } />
      
      <Route path="/admin/skills/writing/:id" element={
        <AdminRoute>
          <WritingEdit />
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