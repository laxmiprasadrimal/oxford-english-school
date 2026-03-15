import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const ProfileManagement = () => {
  const { token, admin } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('New passwords do not match');
    }

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password updated successfully!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred. Check backend connection.');
    }
  };

  return (
    <div className="admin-page">
      <h2>Profile Management</h2>
      <p style={{ marginBottom: '2rem', color: 'gray' }}>Logged in as: <strong>{admin?.email}</strong></p>

      <div className="feature-card" style={{ maxWidth: '500px', padding: '2rem', textAlign: 'left' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Change Password</h3>
        
        {message && <div style={{ color: 'green', marginBottom: '1rem', padding: '10px', background: '#e6ffe6', borderRadius: '5px' }}>{message}</div>}
        {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', background: '#ffe6e6', borderRadius: '5px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
            <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required style={inputStyle} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Update Password</button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };

export default ProfileManagement;
