// AdminDashboard.jsx
// This component serves as the main dashboard for admin users.
// Here, admins can manage the platform and view statistics.

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CampaignCard from '../components/CampaignCard';
import './AdminDashboard.css';

// Functional component for the admin dashboard
const AdminDashboard = () => {
  // State to hold dashboard stats
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalCampaigns: 0,
    totalUsers: 0,
    activeCampaigns: 0,
  });
  // State for campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  // State to handle loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch dashboard stats from the backend when the component mounts
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');
        // Call the backend API for admin dashboard stats with Authorization header
        const res = await fetch('http://localhost:5001/users/admin/dashboard-stats', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    const fetchCampaigns = async () => {
      setCampaignsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/campaigns/admin/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch campaigns');
        const data = await res.json();
        setCampaigns(data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        setCampaignsLoading(false);
      }
    };

    fetchStats();
    fetchCampaigns();
  }, []);

  const handleCardClick = (campaign) => {
    navigate(`/campaign/${campaign._id}`);
  };

  return (
    // Main container for the dashboard content
    <div className="admin-dashboard-container">
      {/* Dashboard title */}
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      {/* Welcome message for admins */}
      <p className="admin-dashboard-welcome">Welcome, Admin! Here you can manage the platform and view statistics.</p>

      {/* Navigation buttons */}
      <div className="admin-dashboard-nav">
        <Link to="/admin/users" className="admin-dashboard-nav-btn">
          Manage Users
        </Link>
        <Link to="/admin/pending-campaigns" className="admin-dashboard-nav-btn">
          Pending Campaigns
        </Link>
      </div>

      {/* Show loading or error state */}
      {loading ? (
        <p className="admin-dashboard-loading">Loading stats...</p>
      ) : error ? (
        <p className="admin-dashboard-error">{error}</p>
      ) : (
        // Stats cards container
        <div className="admin-dashboard-stats">
          {/* Card for Total Donations */}
          <div className="admin-dashboard-card">
            <h2>${stats.totalDonations.toLocaleString()}</h2>
            <p>Total Donations</p>
          </div>
          {/* Card for Total Campaigns */}
          <div className="admin-dashboard-card">
            <h2>{stats.totalCampaigns}</h2>
            <p>Total Campaigns</p>
          </div>
          {/* Card for Total Users */}
          <div className="admin-dashboard-card">
            <h2>{stats.totalUsers}</h2>
            <p>Total Users</p>
          </div>
          {/* Card for Active Campaigns */}
          <div className="admin-dashboard-card">
            <h2>{stats.activeCampaigns}</h2>
            <p>Active Campaigns</p>
          </div>
        </div>
      )}

      {/* Current Campaigns Section */}
      <div className="admin-campaigns-section">
        <h2 className="admin-campaigns-title">Current Campaigns</h2>
        <p className="admin-campaigns-subtitle">All approved campaigns currently active on the platform</p>
        
        {campaignsLoading ? (
          <p className="admin-campaigns-loading">Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p className="admin-campaigns-empty">No campaigns found.</p>
        ) : (
          <div className="admin-campaigns-grid">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onClick={handleCardClick}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component for use in routing
export default AdminDashboard; 