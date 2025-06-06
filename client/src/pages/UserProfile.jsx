import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';
import axios from 'axios';
import { FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaMapMarkerAlt, FaListAlt } from 'react-icons/fa';

const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('donations');
  const [donationList, setDonationList] = useState([]);
    const [currentCampaigns, setCurrentCampaigns] = useState([]);
  const [pastCampaigns, setPastCampaigns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;

      try {
        if (activeTab === 'donations') {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5001/api/donations/user/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("✅ Donations fetched:", res.data);
          setDonationList(res.data);
        } else {
          const res = await axios.get(`http://localhost:5001/campaigns/user/${user._id}`);
          console.log("✅ Campaigns fetched:", res.data);
          const all = res.data;
                    setCurrentCampaigns(all.filter(c => c.progress < 100));
          setPastCampaigns(all.filter(c => c.progress >= 100));
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    fetchData();
  }, [activeTab, user]);

  const totalDonated = donationList.reduce((sum, donation) => sum + donation.amount, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalDonated);

  const renderCampaignCard = (c, isCompleted = false) => (
    <div key={c._id} className="donation-card">
      <div className="donation-header">
        <h4>{c.title}</h4>
        <span className="donation-amount">${c.amount} / ${c.goal}</span>
      </div>
      <div className="donation-details">
        <p><FaListAlt size={14} style={{ marginRight: 6 }} /><strong>Category:</strong> {c.category}</p>
        <p><FaMapMarkerAlt size={14} style={{ marginRight: 6 }} /><strong>Location:</strong> {c.location}</p>
        <p><FaCheckCircle size={14} style={{ marginRight: 6 }} /><strong>Progress:</strong> {c.progress}%</p>
      </div>
      <span className="campaign-status" style={isCompleted ? { backgroundColor: '#e8f5e9', color: '#2e7d32' } : {}}>
        {isCompleted ? '✅ Goal Reached' : '🟢 In Progress'}
      </span>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'donations':
        return (
          <>
            <div className="total-donated">
              💰 <strong>Total Donated:</strong> {formattedTotal}
            </div>
            <div className="donation-list">
              {donationList.length === 0 ? (
                <p className="no-donations">No donations yet.</p>
              ) : (
                donationList.map((donation) => {
                  const formattedAmount = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: donation.currency || 'USD',
                  }).format(donation.amount);

                  const formattedDate = new Date(donation.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <div key={donation._id} className="donation-card">
                      <div className="donation-header">
                        <h4>{donation.campaignTitle}</h4>
                        <span className="donation-amount">{formattedAmount}</span>
                      </div>
                      <div className="donation-details">
                        <p><FaCalendarAlt size={14} style={{ marginRight: 6 }} /><strong>Date:</strong> {formattedDate}</p>
                        <p><FaMoneyBillWave size={14} style={{ marginRight: 6 }} /><strong>Status:</strong> {donation.paymentStatus}</p>
                        <p><FaCheckCircle size={14} style={{ marginRight: 6 }} /><strong>Currency:</strong> {donation.currency?.toUpperCase()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        );

      case 'current':
        return (
          <>
            {currentCampaigns.length === 0 ? (
              <p className="placeholder-content">No active campaigns.</p>
            ) : (
              <div className="donation-list">
                {currentCampaigns.map(c => renderCampaignCard(c))}
              </div>
            )}
          </>
        );

      case 'history':
        return (
          <>
            {pastCampaigns.length === 0 ? (
              <p className="placeholder-content">No completed campaigns yet.</p>
            ) : (
              <div className="donation-list">
                {pastCampaigns.map(c => renderCampaignCard(c, true))}
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <img src="/logo192.png" alt="User Avatar" className="profile-avatar" />
        <h2>{user?.name || 'Your Name'}</h2>
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
            <p>{donationList.length}</p>
          </div>
          <div className="summary-box" onClick={() => setActiveTab('current')}>
            <h3>Current Campaigns</h3>
            <p>{currentCampaigns.length}</p>
          </div>
          <div className="summary-box" onClick={() => setActiveTab('history')}>
            <h3>Campaign History</h3>
            <p>{pastCampaigns.length}</p>
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
