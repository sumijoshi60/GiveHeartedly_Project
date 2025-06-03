// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Hero from './components/Hero';
import CampaignSection from './components/CampaignSection';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateCampaign from './pages/CreateCampaign';
import PrivateRoute from './components/PrivateRoute';
import Success from './pages/Success';
import Failure from './pages/Failure';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <>
                <Hero />
                <CampaignSection />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateCampaign />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
