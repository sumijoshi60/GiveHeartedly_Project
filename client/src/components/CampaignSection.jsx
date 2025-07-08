//client/src/components/CampaignSection.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHeart } from 'react-icons/fa';
import CampaignCard from './CampaignCard';
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
          {filteredCampaigns.map((campaign, index) => (
            <CampaignCard
              key={campaign._id || index}
              campaign={campaign}
              onClick={handleCardClick}
              showActions={true}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CampaignSection;    