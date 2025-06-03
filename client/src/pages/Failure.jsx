// src/pages/Failure.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ResultPage.css';

const Failure = () => {
  return (
    <div className="result-page failure">
      <h1 className="fade-in">❌ Payment Failed</h1>
      <p className="fade-in">Something went wrong during your transaction. Please try again later.</p>
      <Link className="fade-in" to="/">Return to Home</Link>
    </div>
  );
};

export default Failure;


