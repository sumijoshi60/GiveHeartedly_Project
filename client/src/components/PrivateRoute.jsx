//client/src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { loggedIn } = useAuth(); // ✅ removed loading

  return loggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
