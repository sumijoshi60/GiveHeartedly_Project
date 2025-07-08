// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      const parsed = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
      return parsed?.email
        ? { ...parsed, _id: parsed._id || parsed.id }
        : null;

    } catch {
      return null;
    }
  });

  const loggedIn = !!user;

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Global axios interceptor for auto-logout on user deletion or unauthorized
  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (
          error.response &&
          error.response.status === 401 &&
          (error.response.data.message === 'User not found' || error.response.data.message === 'Unauthorized')
        ) {
          logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
