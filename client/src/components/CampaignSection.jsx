import React, { useState, useEffect } from 'react';
import './CampaignSection.css';

const CampaignSection = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donationAmounts, setDonationAmounts] = useState({});

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('http://localhost:5001/campaigns');
        if (!res.ok) throw new Error('Failed to fetch campaigns');
        const data = await res.json();
        setCampaigns(data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Unable to load campaigns.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAmountChange = (id, value) => {
    setDonationAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleDonate = async (campaign) => {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const amount = parseFloat(donationAmounts[campaign._id]) || 10;

    if (!userId || !email) {
      alert('Please log in before donating.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaign.title,
          amount: Math.round(amount * 100), // cents
          userId,
          email,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('❌ Unable to initiate Stripe payment.');
      }
    } catch (err) {
      console.error('❌ Stripe error:', err);
      alert('❌ Payment failed. Please try again.');
    }
  };

  return (
    <section id="donate-section" className="campaign-section">
      <h2>Donate to a Cause</h2>

      <div className="campaign-search">
        <input
          type="text"
          placeholder="Search for a Campaign"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button>🔍</button>
      </div>

      {loading ? (
        <p>Loading campaigns...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredCampaigns.length === 0 ? (
        <p>No matching campaigns found.</p>
      ) : (
        <div className="campaign-list">
          {filteredCampaigns.map((c, index) => {
            const percentage = c.goal
              ? Math.min(Math.round((c.amount || 0) / c.goal * 100), 100)
              : 0;

            return (
              <div className="campaign-card" key={index}>
                <h3>{c.title}</h3>
                <img
                  src={c.imageUrl || '/default-image.jpg'}
                  alt={c.title}
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="amount-line">
                  <span>${(c.amount || 0).toLocaleString()}</span>
                  <span>{percentage}%</span>
                </div>
                <p>{c.location}</p>
                <p className="category">{c.category}</p>

                <input
                  type="number"
                  min="1"
                  placeholder="Amount in $"
                  value={donationAmounts[c._id] || ''}
                  onChange={(e) => handleAmountChange(c._id, e.target.value)}
                  className="donation-amount-input"
                />

                <button
                  className="donate-button"
                  onClick={() => handleDonate(c)}
                >
                  DONATE
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CampaignSection;
