// Updated UserProfile.jsx with Toast and Disabled Button (Delete removed)

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';
import axios from 'axios';
import { FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaMapMarkerAlt, FaListAlt, FaEdit, FaDownload, FaHistory, FaStopCircle } from 'react-icons/fa';
import WithdrawModal from '../components/WithdrawModal.jsx';
import WithdrawalHistoryModal from '../components/WithdrawalHistoryModal.jsx';

const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('donations');
  const [donationList, setDonationList] = useState([]);
  const [currentCampaigns, setCurrentCampaigns] = useState([]);
  const [pastCampaigns, setPastCampaigns] = useState([]);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [withdrawalHistoryModalOpen, setWithdrawalHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;

      try {
        if (activeTab === 'donations') {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5001/api/donations/user/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDonationList(res.data);
        } else {
          const response = await axios.get(`http://localhost:5001/campaigns/user/${user._id}`);
          const all = response.data;
          setCurrentCampaigns(all.filter(c => !c.ended));
          setPastCampaigns(all.filter(c => c.ended));
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    fetchData();
  }, [activeTab, user, editModalOpen, refreshTrigger]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.put(`http://localhost:5001/campaigns/${editingCampaign._id}`, {
        title: editingCampaign.title,
        goal: editingCampaign.goal,
        description: editingCampaign.description,
      });
      
      setEditModalOpen(false);
      setEditingCampaign(null);
      toast.success("✅ Campaign updated! Your changes will be visible after admin approval.");
      setRefreshTrigger(prev => prev + 1); // Refresh to show updated status
    } catch (err) {
      console.error('❌ Update failed:', err);
      toast.error("❌ Failed to update campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (campaignId, campaignTitle, amount, formData) => {
    if (amount <= 0) {
      toast.warning("No funds available to withdraw");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5001/campaigns/${campaignId}/withdraw`, {
        amount: amount,
        paymentMethod: formData.paymentMethod,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        purpose: formData.purpose,
        email: formData.email,
        userId: user._id
      });
      
      toast.success(`Funds transferred successfully! $${amount} has been sent to your ${formData.paymentMethod} account.`);
      setRefreshTrigger(prev => prev + 1); // Refresh the data
    } catch (err) {
      console.error('❌ Withdrawal failed:', err);
      toast.error("❌ Failed to transfer funds. Please try again.");
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const openWithdrawModal = (campaign) => {
    setSelectedCampaign(campaign);
    setWithdrawModalOpen(true);
  };

  const openWithdrawalHistoryModal = (campaign) => {
    setSelectedCampaign(campaign);
    setWithdrawalHistoryModalOpen(true);
  };

  const renderCampaignCard = (c, isCompleted = false) => (
    <div key={c._id} className="donation-card">
      <div className="donation-header">
        <h4>{c.title}</h4>
        <span className="donation-amount">${c.amount} / ${c.goal}</span>
      </div>
      <div className="donation-details">
        <p><FaListAlt size={14} style={{ marginRight: 6 }} /><strong>Category:</strong> {c.category}</p>
        <p><FaMapMarkerAlt size={14} style={{ marginRight: 6 }} /><strong>Location:</strong> {c.location}</p>
        {c.totalWithdrawn > 0 && (
          <p><strong>Withdrawn:</strong> ${c.totalWithdrawn}</p>
        )}
        {c.endedAt && (
          <p><strong>Ended On:</strong> {new Date(c.endedAt).toLocaleDateString()}</p>
        )}
        {/* Show approval status for current campaigns */}
        {!isCompleted && (
          <p className="campaign-approval-status">
            Status: {c.rejected
              ? <span className="disapproved-status">Disapproved</span>
              : c.approved
                ? <span className="approved-status">Approved</span>
                : <span className="pending-status">Approval Pending</span>
            }
          </p>
        )}
      </div>
      <div className="campaign-actions">
        <span className="campaign-status" style={isCompleted ? { backgroundColor: '#e8f5e9', color: '#2e7d32' } : {}}>
          {isCompleted 
            ? (c.availableFunds > 0 ? '✅ Completed (Funds Available)' : '✅ Completed') 
            : '🟢 In Progress'
          }
        </span>
        {/* End Campaign button for campaigns that are not ended */}
        {!isCompleted && !c.ended && (
          <button
            className="end-campaign-btn"
            style={{ marginLeft: 'auto' }}
            onClick={async () => {
              if (!window.confirm('Are you sure you want to end this campaign? This action cannot be undone.')) return;
              try {
                await axios.put(`http://localhost:5001/campaigns/${c._id}/end`);
                toast.success('Campaign ended successfully!');
                setRefreshTrigger(prev => prev + 1);
              } catch (err) {
                toast.error('Failed to end campaign');
              }
            }}
          >
            <FaStopCircle style={{ marginRight: 6, marginBottom: -2 }} /> End Campaign
          </button>
        )}
        {c.availableFunds > 0 && (
          <button
            className="withdraw-btn"
            onClick={() => openWithdrawModal(c)}
          >
            <FaDownload /> Transfer Funds
          </button>
        )}
        {(c.totalWithdrawn > 0 || c.availableFunds > 0) && (
          <button
            className="history-btn"
            onClick={() => openWithdrawalHistoryModal(c)}
          >
            <FaHistory /> View History
          </button>
        )}
      </div>
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
                    year: 'numeric', month: 'long', day: 'numeric',
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
                {currentCampaigns.map(c => renderCampaignCard(c, false))}
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

  const totalDonated = donationList.reduce((sum, donation) => sum + donation.amount, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalDonated);

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
        <ToastContainer position="bottom-right" autoClose={3000} />
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

      {withdrawModalOpen && selectedCampaign && (
        <WithdrawModal
          isOpen={withdrawModalOpen}
          campaign={selectedCampaign}
          onClose={() => setWithdrawModalOpen(false)}
          onWithdraw={handleWithdraw}
        />
      )}

      {withdrawalHistoryModalOpen && selectedCampaign && (
        <WithdrawalHistoryModal
          isOpen={withdrawalHistoryModalOpen}
          campaign={selectedCampaign}
          onClose={() => setWithdrawalHistoryModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
