
import { useState } from 'react';
import axios from 'axios';

const DonateForm = ({ campaign }) => {
  const [amount, setAmount] = useState('');

  const handleDonate = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5001/create-checkout-session', {
        title: campaign?.title || "General Donation",
        amount: Math.round(Number(amount) * 100), // Stripe expects cents
        userId: localStorage.getItem("userId"), // adjust if using auth context
      });

      window.location.href = res.data.url;
    } catch (error) {
      console.error("❌ Error creating Stripe session:", error);
      alert("Failed to start donation session. Try again.");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Donate to {campaign?.title || "Support Us"}</h2>
      <input
        type="number"
        min="1"
        placeholder="Enter amount in USD"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ padding: '0.5rem', fontSize: '1rem', width: '200px' }}
      />
      <br /><br />
      <button onClick={handleDonate} style={{ padding: '0.5rem 1rem' }}>
        Donate Now
      </button>
    </div>
  );
};

export default DonateForm;
