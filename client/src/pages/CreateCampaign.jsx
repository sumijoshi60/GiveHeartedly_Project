import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCampaign.css'; // Make sure this matches exactly with your CSS filename

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

  useEffect(() => {
    // document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'visible';
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

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

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to create a campaign.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('goal', formData.goal);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('image', formData.image);
    formDataToSend.append('userId', localStorage.getItem('userId'));

    try {
      const response = await fetch('http://localhost:5001/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create campaign:", errorText);
        return;
      }

      const result = await response.json();
      alert('Campaign created!');
      navigate('/');

    } catch (err) {
      console.error('Network error:', err);
    }
  };

  return (
    <div className="create-campaign-bg">
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
              className="image-preview"
            />
          )}

          <button type="submit">Create Campaign</button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;