//client/src/components/EditCampaignModal.jsx

import React, { useState } from 'react';
import './EditCampaignModal.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditCampaignModal = ({ campaign, setCampaign, onClose, onSubmit, submitting, setRefreshTrigger }) => {
  const [ending, setEnding] = useState(false);

  if (!campaign) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaign({ ...campaign, [name]: value });
  };

  const handleEndCampaign = async () => {
    if (!window.confirm("Are you sure you want to end this campaign?")) return;

    try {
      setEnding(true);
      await axios.put(`http://localhost:5001/campaigns/${campaign._id}/end`);
      toast.success("🎉 Campaign ended successfully");

      // Trigger refresh in parent and close modal
      onClose();
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("❌ Failed to end campaign:", err);
      toast.error("Could not end campaign");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Edit Campaign</h3>
        <form onSubmit={onSubmit}>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={campaign.title}
            onChange={handleChange}
            required
          />

          <label>Goal ($)</label>
          <input
            type="number"
            name="goal"
            value={campaign.goal}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            rows="4"
            value={campaign.description}
            onChange={handleChange}
            required
          />

          <div className="modal-buttons">
            <button type="submit" className="save-btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting || ending}>
              Cancel
            </button>
          </div>

          {campaign.progress >= 100 && !campaign.ended && (
            <button
              type="button"
              className="save-btn"
              style={{ marginTop: '12px', backgroundColor: '#2b6cb0' }}
              onClick={handleEndCampaign}
              disabled={ending}
            >
              {ending ? 'Ending...' : 'End Campaign'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditCampaignModal;
