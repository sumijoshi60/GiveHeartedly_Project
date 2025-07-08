import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CampaignDetails.css';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`http://localhost:5001/campaigns/${id}`);
        const data = await res.json();
        setCampaign(data);
      } catch (err) {
        console.error('Error loading campaign:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleDonate = async () => {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const amount = parseFloat(donationAmount) || 10;

    if (!userId || !email) {
      alert('Please log in before donating.');
      return;
    }

    try {
      // ✅ First verify if user still exists (prevents deleted/banned users from donating)
      const verifyRes = await fetch(`http://localhost:5001/users/verify/${userId}`);
      const verifyData = await verifyRes.json();
      
      if (!verifyData.exists) {
        alert('Your account has been deleted or banned. You cannot make donations.');
        // Clear local storage and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      const res = await fetch('http://localhost:5001/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaign.title,
          amount: Math.round(amount * 100),
          userId,
          email,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Unable to initiate Stripe payment.');
      }
    } catch (err) {
      console.error('Stripe error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const LogoButton = () => (
    <button
      onClick={() => navigate(-1)}
      className="home-logo-link"
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      <img src="/logo.png" alt="Home" className="home-logo" />
    </button>
  );

  if (loading) return (
    <div className="loading-container">
      <LogoButton />
      <p>Loading campaign...</p>
    </div>
  );
  
  if (!campaign) return (
    <div className="not-found-container">
      <LogoButton />
      <p>Campaign not found.</p>
    </div>
  );

  const amount = campaign.amount || 0;
  const goal = campaign.goal || 1;
  const progress = Math.min((amount / goal) * 100, 100).toFixed(1);
  const totalDonations = campaign.donations?.length || Math.floor(amount / 20);

  return (
    <div className="campaign-details-layout">
      <div className="fixed-logo-wrapper">
        <LogoButton />
      </div>
      <div className="campaign-page-container">
        <div className="campaign-detail-wrapper">
          {/* Left Section */}
          <div className="campaign-left">
            <h1>{campaign.title}</h1>
            <img 
              className="campaign-image" 
              src={campaign.imageUrl || '/default-image.jpg'} 
              alt={campaign.title}
              onError={(e) => (e.target.src = '/default-image.jpg')}
            />
            <p className="organizer">👤 Organized by {campaign.organizerName || 'Anonymous'}</p>
            <div className="donation-protected">🔒 Donation protected</div>
            <p className="description">{campaign.description}</p>
          </div>
          {/* Right Sidebar */}
          <div className="campaign-right">
            <div className="funds-info">
              <h2>${amount.toLocaleString()} raised</h2>
              <p>of ${goal.toLocaleString()} goal</p>
              <p>{totalDonations} donations</p>
              <div className="circular-progress-wrapper">
                <svg className="progress-ring" width="80" height="80">
                  <circle
                    className="progress-ring-bg"
                    stroke="#dfe6e9"
                    strokeWidth="8"
                    fill="transparent"
                    r="30"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="#00b894"
                    strokeWidth="8"
                    fill="transparent"
                    r="30"
                    cx="40"
                    cy="40"
                    strokeDasharray={188.4}
                    strokeDashoffset={188.4 - (188.4 * progress) / 100}
                  />
                </svg>
                <div className="progress-text">{progress}%</div>
              </div>
            </div>
            <input
              type="number"
              placeholder="Enter amount"
              min="1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="donation-input"
            />
            <button onClick={handleDonate} className="donate-now-btn">
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;