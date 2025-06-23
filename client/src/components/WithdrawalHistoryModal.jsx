import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaPaypal, FaCreditCard, FaUniversity, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import './WithdrawalHistoryModal.css';

const WithdrawalHistoryModal = ({ isOpen, onClose, campaign }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && campaign) {
      fetchWithdrawalHistory();
    }
  }, [isOpen, campaign]);

  const fetchWithdrawalHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/campaigns/${campaign._id}/withdrawals`);
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data);
      } else {
        console.error('Failed to fetch withdrawal history');
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'paypal':
        return <FaPaypal />;
      case 'stripe':
        return <FaCreditCard />;
      case 'bank':
        return <FaUniversity />;
      default:
        return <FaMoneyBillWave />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskAccountNumber = (accountNumber, method) => {
    if (!accountNumber) return 'N/A';
    
    if (method === 'paypal') {
      // For PayPal, mask the email
      const [username, domain] = accountNumber.split('@');
      if (!username || !domain) return 'N/A';
      return `${username.charAt(0)}***@${domain}`;
    } else {
      // For other methods, mask the account number
      if (accountNumber.length < 4) return 'N/A';
      return `****${accountNumber.slice(-4)}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="withdrawal-history-modal-overlay">
      <div className="withdrawal-history-modal">
        <div className="withdrawal-history-modal-header">
          <h2>Withdrawal History</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="withdrawal-history-modal-content">
          <div className="campaign-summary">
            <h3>{campaign.title}</h3>
            <div className="funds-summary">
              <div className="summary-item">
                <span className="label">Total Raised:</span>
                <span className="value">${campaign.amount}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Withdrawn:</span>
                <span className="value">${campaign.totalWithdrawn || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Available Funds:</span>
                <span className="value">${campaign.availableFunds || campaign.amount}</span>
              </div>
            </div>
          </div>

          <div className="withdrawal-history-section">
            <h4>Withdrawal History</h4>
            
            {loading ? (
              <div className="loading-state">
                <p>Loading withdrawal history...</p>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="no-withdrawals">
                <FaDownload className="no-withdrawals-icon" />
                <p>No withdrawals made yet</p>
                <small>Withdrawals will appear here once you transfer funds from this campaign.</small>
              </div>
            ) : (
              <div className="withdrawal-list">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal._id} className="withdrawal-item">
                    <div className="withdrawal-header">
                      <div className="withdrawal-amount">
                        <FaDownload />
                        <span>${withdrawal.amount}</span>
                      </div>
                      <div className="withdrawal-date">
                        <FaCalendarAlt />
                        <span>{formatDate(withdrawal.withdrawnAt)}</span>
                      </div>
                    </div>
                    
                    <div className="withdrawal-details">
                      <div className="detail-row">
                        <span className="detail-label">Payment Method:</span>
                        <span className="detail-value">
                          {getPaymentMethodIcon(withdrawal.paymentMethod)}
                          {withdrawal.paymentMethod ? withdrawal.paymentMethod.charAt(0).toUpperCase() + withdrawal.paymentMethod.slice(1) : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Account:</span>
                        <span className="detail-value">
                          {withdrawal.accountName || 'N/A'} - {maskAccountNumber(withdrawal.accountNumber, withdrawal.paymentMethod)}
                        </span>
                      </div>
                      
                      {withdrawal.purpose && (
                        <div className="detail-row">
                          <span className="detail-label">Purpose:</span>
                          <span className="detail-value purpose-text">{withdrawal.purpose}</span>
                        </div>
                      )}
                      
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value status-processed">
                          <span className="status-dot"></span>
                          Processed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalHistoryModal; 