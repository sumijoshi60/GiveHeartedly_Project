import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCampaign.css';

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    location: '',
    category: '',
    description: '',
    image: null,
    imagePreview: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setFormData({
        ...formData,
        image: file,
        imagePreview: file ? URL.createObjectURL(file) : null,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Please upload a campaign image.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('goal', formData.goal);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('image', formData.image);
    formDataToSend.append('userId', localStorage.getItem('userId')); // ✅ Add this


    console.log("📤 Sending campaign data with image to Cloudinary...");

    try {
      const response = await fetch('http://localhost:5001/campaigns', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to create campaign. Raw response:", errorText);
        return;
      }

      const result = await response.json();
      console.log("✅ Response from server:", result);

      alert('Campaign created!');
      navigate('/');

    } catch (err) {
      console.error('🚨 Network or server error:', err);
    }
  };

  // Clean up the object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  return (
    <div
      className="create-campaign-bg"
      style={{
        backgroundImage: "url('/start-campaign-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="create-campaign-container">
        <h2>Start a Fundraising Campaign</h2>
        <form onSubmit={handleSubmit} className="campaign-form">
          <input
            type="text"
            name="title"
            placeholder="Campaign Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="goal"
            placeholder="Fundraising Goal ($)"
            value={formData.goal}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Medical">Medical</option>
            <option value="Education">Education</option>
            <option value="Disaster Relief">Disaster Relief</option>
            <option value="Animals">Animals</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            name="description"
            placeholder="Describe your cause"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            required
          />

          <label htmlFor="imageUpload" className="image-upload-label">
            Upload Campaign Image
          </label>
          <input
            type="file"
            id="imageUpload"
            name="image"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <span className="file-name">
            {formData.image ? formData.image.name : 'No file chosen'}
          </span>

          {formData.imagePreview && (
            <img
              src={formData.imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }}
            />
          )}

          <button type="submit">Create Campaign</button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
