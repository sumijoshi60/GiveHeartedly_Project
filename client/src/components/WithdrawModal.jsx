import React, { useState } from 'react';
import { FaTimes, FaPaypal, FaCreditCard, FaDownload } from 'react-icons/fa';
import './WithdrawModal.css';

const WithdrawModal = ({ isOpen, onClose, campaign, onWithdraw }) => {
  const [formData, setFormData] = useState({
    paymentMethod: '',
    accountNumber: '',
    accountName: '',
    withdrawalAmount: '',
    purpose: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.paymentMethod || !formData.withdrawalAmount || !formData.accountNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.withdrawalAmount);
    if (amount <= 0) {
      alert('Please enter a valid withdrawal amount greater than $0');
      return;
    }
    
    const availableFunds = campaign.availableFunds || campaign.amount;
    if (amount > availableFunds) {
      alert(`Withdrawal amount cannot exceed available funds ($${availableFunds})`);
      return;
    }

    setSubmitting(true);
    try {
      await onWithdraw(campaign._id, campaign.title, amount, formData);
      onClose();
      setFormData({
        paymentMethod: '',
        accountNumber: '',
        accountName: '',
        withdrawalAmount: '',
        purpose: '',
        email: ''
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="withdraw-modal-overlay">
      <div className="withdraw-modal">
        <div className="withdraw-modal-header">
          <h2>Transfer Funds</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="withdraw-modal-content">
          <div className="campaign-info">
            <h3>{campaign.title}</h3>
            <p>Available funds: <strong>${campaign.availableFunds || campaign.amount}</strong></p>
            {campaign.totalWithdrawn > 0 && (
              <p>Total withdrawn: <strong>${campaign.totalWithdrawn}</strong></p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="withdraw-form">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="">Select payment method</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="accountName">Account Holder Name *</label>
              <input
                type="text"
                id="accountName"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="accountNumber">
                {formData.paymentMethod === 'paypal' ? 'PayPal Email' : 
                 formData.paymentMethod === 'stripe' ? 'Stripe Account ID' : 
                 'Account Number'} *
              </label>
              <input
                type={formData.paymentMethod === 'paypal' ? 'email' : 'text'}
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder={
                  formData.paymentMethod === 'paypal' ? 'Enter PayPal email' :
                  formData.paymentMethod === 'stripe' ? 'Enter Stripe account ID' :
                  'Enter account number'
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="withdrawalAmount">Withdrawal Amount *</label>
              <div className="amount-input-container">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="withdrawalAmount"
                  name="withdrawalAmount"
                  value={formData.withdrawalAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <small className="amount-hint">Available: ${campaign.availableFunds || campaign.amount} | Enter any amount up to ${campaign.availableFunds || campaign.amount}</small>
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Purpose of Withdrawal</label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Describe how you plan to use these funds..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Contact Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter contact email for updates"
              />
            </div>

            <div className="withdraw-modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                <FaDownload />
                {submitting ? 'Processing Transfer...' : 'Transfer Funds'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal; 