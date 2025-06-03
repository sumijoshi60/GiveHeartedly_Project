import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // ✅ Add this line
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth(); // ✅ Access user from context
  const [activeTab, setActiveTab] = useState('donations');

  const renderContent = () => {
    switch (activeTab) {
      case 'donations':
        return <p className="placeholder-content">Your donation history will appear here.</p>;
      case 'current':
        return <p className="placeholder-content">Your current campaigns will appear here.</p>;
      case 'history':
        return <p className="placeholder-content">Your past campaign history will appear here.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <img src="/logo192.png" alt="User Avatar" className="profile-avatar" />
        <h2>{user?.name || 'Your Name'}</h2> {/* ✅ Display user's name */}
        <p>Contributing since April 2023</p>
        <nav>
          <ul>
            <li>Story</li>
            <li>Settings</li>
            <li>Refunds</li>
            <li>Subscription</li>
          </ul>
        </nav>
      </aside>

      <main className="profile-main">
        <section className="profile-summary">
          <div className="summary-box" onClick={() => setActiveTab('donations')}>
            <h3>Donations</h3>
            <p>3</p>
          </div>
          <div className="summary-box" onClick={() => setActiveTab('current')}>
            <h3>Current Campaigns</h3>
            <p>2</p>
          </div>
          <div className="summary-box" onClick={() => setActiveTab('history')}>
            <h3>Campaign History</h3>
            <p>5</p>
          </div>
        </section>

        <section className="profile-content">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default UserProfile;
