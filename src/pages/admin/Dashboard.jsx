import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ events: 0, gallery: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, galleryRes] = await Promise.all([
          fetch('http://localhost:5000/api/events'),
          fetch('http://localhost:5000/api/gallery')
        ]);
        
        const eventsData = await eventsRes.json();
        const galleryData = await galleryRes.json();
        
        setStats({
          events: (eventsData.upcomingEvents?.length || 0) + (eventsData.pastEvents?.length || 0),
          gallery: galleryData.length || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [token]);

  return (
    <div className="admin-page">
      <h2>Welcome to Admin Dashboard</h2>
      
      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className="stats-grid" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <div className="stat-card feature-card" style={{ flex: 1 }}>
            <i className="fa-solid fa-calendar-check" style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}></i>
            <h3 style={{ marginTop: '1rem', color: 'var(--primary-color)' }}>Total Events</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.events}</p>
          </div>
          
          <div className="stat-card feature-card" style={{ flex: 1 }}>
            <i className="fa-solid fa-images" style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}></i>
            <h3 style={{ marginTop: '1rem', color: 'var(--primary-color)' }}>Gallery Items</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.gallery}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
