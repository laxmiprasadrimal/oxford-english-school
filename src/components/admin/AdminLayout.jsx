import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-container">
      {/* Mobile Toggle */}
      <div className="admin-mobile-header">
        <div className="logo" style={{ color: 'var(--primary-color)' }}>
          Admin Panel
        </div>
        <div className={`hamburger ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Oxford Admin</h2>
        </div>
        <ul className="sidebar-links">
          <li>
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-chart-pie"></i> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/events" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-calendar-alt"></i> Events
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/gallery" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-images"></i> Gallery
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-user-cog"></i> Profile
            </NavLink>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="btn btn-primary" onClick={handleLogout} style={{ width: '100%' }}>
            <i className="fa-solid fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
