// AdminRoute.jsx
// This component protects admin-only routes in the app.
// Only users with role 'admin' can access the wrapped content.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  // If not logged in or not an admin, redirect to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  // Otherwise, render the protected content
  return children;
};

export default AdminRoute; 