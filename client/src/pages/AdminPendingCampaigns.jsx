// AdminPendingCampaigns.jsx
// This page allows admins to view and approve all pending (unapproved) campaigns as cards with a modal for details.
// Only admins should be able to access this page (route should be protected).

import React, { useEffect, useState } from 'react';
import './AdminPendingCampaigns.css'; // We'll create this CSS file for styling

const AdminPendingCampaigns = () => {
  // State to hold the list of pending campaigns
  const [campaigns, setCampaigns] = useState([]);
  // State for loading and error messages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for modal
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [approving, setApproving] = useState(false);

  // Fetch all pending campaigns from the backend when the component mounts
  useEffect(() => {
    const fetchPendingCampaigns = async () => {
      setLoading(true);
      setError('');
      try {
        // Get the JWT token from localStorage for authentication
        const token = localStorage.getItem('token');
        // Make a GET request to the backend to fetch pending campaigns
        const res = await fetch('http://localhost:5001/campaigns/admin/pending', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch pending campaigns');
        setCampaigns(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch pending campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetchPendingCampaigns();
  }, []); // Only run on mount

  // Handler to approve a campaign
  const handleApprove = async (campaignId) => {
    setApproving(true);
    setError('');
    try {
      // Get the JWT token from localStorage for authentication
      const token = localStorage.getItem('token');
      // Make a PUT request to approve the campaign
      const res = await fetch(`http://localhost:5001/campaigns/admin/approve/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve campaign');
      // Remove the approved campaign from the list in the UI
      setCampaigns(prev => prev.filter(c => c._id !== campaignId));
      setSelectedCampaign(null); // Close the modal
    } catch (err) {
      setError(err.message || 'Failed to approve campaign');
    } finally {
      setApproving(false);
    }
  };

  // Handler to disapprove a campaign
  const handleDisapprove = async (campaignId) => {
    setApproving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/campaigns/admin/disapprove/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to disapprove campaign');
      setCampaigns(prev => prev.filter(c => c._id !== campaignId));
      setSelectedCampaign(null);
    } catch (err) {
      setError(err.message || 'Failed to disapprove campaign');
    } finally {
      setApproving(false);
    }
  };

  // Handler to close the modal
  const closeModal = () => setSelectedCampaign(null);

  return (
    <div className="admin-pending-campaigns-container">
      {/* Page title */}
      <h1 className="admin-pending-campaigns-title">Pending Campaign Approvals</h1>
      {/* Loading and error messages */}
      {loading ? (
        <p className="admin-pending-campaigns-loading">Loading pending campaigns...</p>
      ) : error ? (
        <p className="admin-pending-campaigns-error">{error}</p>
      ) : campaigns.length === 0 ? (
        <p className="admin-pending-campaigns-empty">No pending campaigns to approve.</p>
      ) : (
        // Card layout for pending campaigns
        <div className="admin-pending-campaigns-card-list">
          {campaigns.map(campaign => (
            <div
              key={campaign._id}
              className="admin-pending-campaign-card"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <img
                src={campaign.imageUrl || '/default-image.jpg'}
                alt={campaign.title}
                className="admin-pending-campaign-card-img"
                onError={e => (e.target.src = '/default-image.jpg')}
              />
              <div className="admin-pending-campaign-card-content">
                <h3>{campaign.title}</h3>
                <p><strong>Goal:</strong> ${campaign.goal?.toLocaleString()}</p>
                <p><strong>Category:</strong> {campaign.category}</p>
                <p><strong>Created:</strong> {new Date(campaign.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for campaign details */}
      {selectedCampaign && (
        <div className="admin-pending-campaign-modal-overlay" onClick={closeModal}>
          <div className="admin-pending-campaign-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-pending-campaign-modal-close" onClick={closeModal}>&times;</button>
            {/* Campaign image */}
            <img
              src={selectedCampaign.imageUrl || '/default-image.jpg'}
              alt={selectedCampaign.title}
              className="admin-pending-campaign-modal-img"
              onError={e => (e.target.src = '/default-image.jpg')}
            />
            {/* Campaign title */}
            <h2>{selectedCampaign.title}</h2>
            {/* Campaign details */}
            <div className="admin-pending-campaign-modal-details">
              <p><strong>Goal:</strong> ${selectedCampaign.goal?.toLocaleString()}</p>
              <p><strong>Category:</strong> {selectedCampaign.category}</p>
              <p><strong>Location:</strong> {selectedCampaign.location}</p>
              <p><strong>Created By:</strong> {selectedCampaign.userId?.name || selectedCampaign.userId || 'Unknown'}</p>
              <p><strong>Created At:</strong> {new Date(selectedCampaign.createdAt).toLocaleString()}</p>
            </div>
            {/* Campaign description */}
            <p><strong>Description:</strong></p>
            <div className="admin-pending-campaign-modal-desc">{selectedCampaign.description}</div>
            {/* Approve and Disapprove buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="admin-pending-campaigns-approve-btn"
                onClick={() => handleApprove(selectedCampaign._id)}
                disabled={approving}
              >
                {approving ? 'Approving...' : 'Approve'}
              </button>
              <button
                className="admin-pending-campaigns-disapprove-btn"
                onClick={() => handleDisapprove(selectedCampaign._id)}
                disabled={approving}
              >
                Disapprove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingCampaigns; 