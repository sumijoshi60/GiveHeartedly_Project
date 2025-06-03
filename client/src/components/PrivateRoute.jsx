import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { loggedIn, loading } = useAuth();

  if (loading) return null; // Or show a spinner/loading screen

  return loggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
