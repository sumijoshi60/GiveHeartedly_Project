//client/src/components/CampaignSection.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaHeart, FaArrowRight } from 'react-icons/fa';
import './CampaignSection.css';

const CampaignSection = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('http://localhost:5001/campaigns/with-donations');
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
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (campaign) => {
    navigate(`/campaign/${campaign._id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Medical': '#ff6b6b',
      'Education': '#4ecdc4',
      'Disaster Relief': '#45b7d1',
      'Animals': '#96ceb4',
      'Other': '#feca57'
    };
    return colors[category] || '#4fcfa5';
  };

  return (
    <section id="donate-section" className="campaign-section">
      <div className="campaign-section-header">
        <h2>Support Amazing Causes</h2>
        <p>Discover and donate to campaigns that are making a difference in the world</p>
      </div>

      <div className="campaign-search-container">
        <div className="campaign-search">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search campaigns, categories, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {searchTerm && (
          <div className="search-results-info">
            <span>{filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing campaigns...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="no-campaigns-container">
          <FaHeart className="no-campaigns-icon" />
          <h3>No campaigns found</h3>
          <p>{searchTerm ? 'Try adjusting your search terms' : 'Check back soon for new campaigns'}</p>
        </div>
      ) : (
        <div className="campaign-list">
          {filteredCampaigns.map((c, index) => {
            const percentage = c.progress || 0;
            const categoryColor = getCategoryColor(c.category);
            
            return (
              <div className="campaign-card" key={index} onClick={() => handleCardClick(c)}>
                <div className="campaign-image-container">
                  <img
                    src={c.imageUrl || '/default-image.jpg'}
                    alt={c.title}
                    onError={(e) => (e.target.src = '/default-image.jpg')}
                  />
                  <div className="campaign-overlay">
                    <FaArrowRight className="view-icon" />
                  </div>
                  <div className="category-badge" style={{ backgroundColor: categoryColor }}>
                    {c.category}
                  </div>
                </div>
                
                <div className="campaign-content">
                  <h3 className="campaign-title">{c.title}</h3>
                  
                  <div className="campaign-meta">
                    <div className="meta-item">
                      <FaUser className="meta-icon" />
                      <span>{c.organizerName || 'Anonymous'}</span>
                    </div>
                    <div className="meta-item">
                      <FaMapMarkerAlt className="meta-icon" />
                      <span>{c.location || 'Location not specified'}</span>
                    </div>
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>

                  <div className="campaign-progress">
                    <div className="progress-info">
                      <span className="raised-amount">${(c.amount || 0).toLocaleString()}</span>
                      <span className="goal-amount">raised of ${(c.goal || 0).toLocaleString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: percentage === 0 ? '2px' : `${percentage}%`, backgroundColor: categoryColor, minWidth: '2px' }}
                      ></div>
                    </div>
                    <div className="progress-percentage">
                      <span>{percentage}%</span>
                    </div>
                  </div>

                  <div className="campaign-actions">
                    <button className="view-campaign-btn">
                      View Campaign
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CampaignSection;    