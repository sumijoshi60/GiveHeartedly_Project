// src/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton'; // ✅ default import
import './Hero.css';

const Hero = () => {
  const { loggedIn, user } = useAuth();

  const scrollToDonation = () => {
    const section = document.getElementById('donate-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="hero" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
      <div className="hero-overlay" />

      <nav className="navbar">
        <img src="/logo.png" alt="GiveHeartedly logo" className="logo" />
        <ul className="nav-links">
          <li><a href="#donate-section">Donate</a></li>
          <li><Link to="/create">Fundraise</Link></li>
          <li><a href="#">Fundraising Guides</a></li>
          {loggedIn ? (
            <>
              <li><Link to="/profile">Profile</Link></li>
              <li><LogoutButton /></li>
            </>
          ) : (
            <li><Link to="/login" className="login-btn">Login</Link></li>
          )}
        </ul>
      </nav>

      <div className="hero-content">
        <h1>Together, We Make Giving Powerful.</h1>
        <p>Start your fundraiser today. Create change that lasts.</p>
        <Link to="/create" className="cta-button">Start a Campaign</Link>
        <button className="cta-button" onClick={scrollToDonation}>Donate</button>
      </div>
    </header>
  );
};

export default Hero;
