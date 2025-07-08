import React from 'react';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import './CampaignCard.css';

const CampaignCard = ({ campaign, onClick, showActions = true }) => {
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

  const percentage = campaign.progress || 0;
  const categoryColor = getCategoryColor(campaign.category);

  return (
    <div className="campaign-card" onClick={() => onClick && onClick(campaign)}>
      <div className="campaign-image-container">
        <img
          src={campaign.imageUrl || '/default-image.jpg'}
          alt={campaign.title}
          onError={(e) => (e.target.src = '/default-image.jpg')}
        />
        <div className="campaign-overlay">
          <FaArrowRight className="view-icon" />
        </div>
        <div className="category-badge" style={{ backgroundColor: categoryColor }}>
          {campaign.category}
        </div>
      </div>
      
      <div className="campaign-content">
        <h3 className="campaign-title">{campaign.title}</h3>
        
        <div className="campaign-meta">
          <div className="meta-item">
            <FaUser className="meta-icon" />
            <span>{campaign.organizerName || 'Anonymous'}</span>
          </div>
          <div className="meta-item">
            <FaMapMarkerAlt className="meta-icon" />
            <span>{campaign.location || 'Location not specified'}</span>
          </div>
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>{formatDate(campaign.createdAt)}</span>
          </div>
        </div>

        <div className="campaign-progress">
          <div className="progress-info">
            <span className="raised-amount">${(campaign.amount || 0).toLocaleString()}</span>
            <span className="goal-amount">raised of ${(campaign.goal || 0).toLocaleString()}</span>
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

        {showActions && (
          <div className="campaign-actions">
            <button className="view-campaign-btn">
              View Campaign
              <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard; 