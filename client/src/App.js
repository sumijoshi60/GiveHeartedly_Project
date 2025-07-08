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
import CampaignDetails from './pages/CampaignDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminUserList from './pages/AdminUserList';
import AdminPendingCampaigns from './pages/AdminPendingCampaigns';

// ✅ Logs AFTER imports
console.log('✅ Hero:', Hero);
console.log('✅ CampaignSection:', CampaignSection);
console.log('✅ Login:', Login);
console.log('✅ Signup:', Signup);
console.log('✅ CreateCampaign:', CreateCampaign);
console.log('✅ PrivateRoute:', PrivateRoute);
console.log('✅ Success:', Success);
console.log('✅ Failure:', Failure);
console.log('✅ UserProfile:', UserProfile);
console.log('✅ CampaignDetails:', CampaignDetails);
console.log('✅ AdminDashboard:', AdminDashboard);
console.log('✅ AdminUserList:', AdminUserList);
console.log('✅ AdminPendingCampaigns:', AdminPendingCampaigns);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />
        <Route path="/campaign/:id" element={<CampaignDetails />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUserList />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pending-campaigns"
          element={
            <AdminRoute>
              <AdminPendingCampaigns />
            </AdminRoute>
          }
        />

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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
