// client/src/pages/Success.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Success = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setMessage('❌ Missing session ID');
      setLoading(false);
      return;
    }

    const saveDonation = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/donations/save-donation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          throw new Error('Failed to save donation');
        }

        setMessage('🎉 Thank you! Your donation was successful and recorded.');
      } catch (err) {
        console.error('❌ Error saving donation:', err);
        setMessage('❌ Payment succeeded but failed to save donation.');
      } finally {
        setLoading(false);
      }
    };

    saveDonation();
  }, [searchParams]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      {loading ? (
        <p>⏳ Processing your donation...</p>
      ) : (
        <>
          <h2>{message}</h2>
          <button onClick={() => navigate('/')}>Go Back Home</button>
        </>
      )}
    </div>
  );
};

export default Success;
