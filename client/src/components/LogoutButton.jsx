import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: '#dc2626',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        padding: '6px 12px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
