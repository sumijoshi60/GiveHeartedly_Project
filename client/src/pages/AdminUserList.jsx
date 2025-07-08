// AdminUserList.jsx
// This page displays all users for admin management, with search functionality.

import React, { useEffect, useState } from 'react';
import './AdminUserList.css'; // We'll create this CSS file for styling

const AdminUserList = () => {
  // State for users, search, loading, and error
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/users/admin/all-users?search=${encodeURIComponent(search)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search]); // Refetch when search changes

  // Handler to ban (delete) a user
  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban (delete) this user? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/users/admin/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user');
      setUsers(prev => prev.filter(u => u._id !== userId && u.id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="admin-userlist-container">
      <h1 className="admin-userlist-title">All Users</h1>
      {/* Search box */}
      <input
        className="admin-userlist-search"
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {/* Loading and error states */}
      {loading ? (
        <p className="admin-userlist-loading">Loading users...</p>
      ) : error ? (
        <p className="admin-userlist-error">{error}</p>
      ) : (
        <table className="admin-userlist-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id || user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active === false ? 'Inactive' : 'Active'}</td>
                <td>
                  <button
                    className="admin-userlist-ban-btn"
                    onClick={() => handleBanUser(user._id || user.id)}
                  >
                    Ban User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserList; 