import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // ✅ Check all conditions before proceeding
      if (!res.ok || !data.user || (!data.user._id && !data.user.id)) {
        setError(data.message || 'Login failed');
        return;
      }

      const userId = data.user._id || data.user.id;
      if (!userId) {
        setError('Invalid user data received.');
        return;
      }

      localStorage.setItem('userId', userId);
      localStorage.setItem('email', data.user.email);
      localStorage.setItem('token', data.token); // Store JWT token for authenticated requests
      login(data.user); // ✅ Update auth context
      // Redirect based on user role
      if (data.user.role === 'admin') {
        // If the user is an admin, navigate to the admin dashboard
        navigate('/admin');
      } else {
        // Otherwise, navigate to the normal homepage
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Login to Your Account</h2>
        <p className="subtext">Enter your credentials to continue</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">Sign In</button>
          {error && <p className="error-text">{error}</p>}
        </form>

        <Link to="/" className="back-home">← Back to Home</Link>
      </div>

      <div className="login-right">
        <h2>New Here?</h2>
        <p>Sign up and discover a great amount of new opportunities!</p>
        <Link to="/signup" className="signup-button">Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;
