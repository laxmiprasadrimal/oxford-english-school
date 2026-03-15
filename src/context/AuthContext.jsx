import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on load
    const storedAdmin = localStorage.getItem('admin');
    const token = localStorage.getItem('token');
    
    if (storedAdmin && token) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = (adminData, token) => {
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('token', token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin, token: localStorage.getItem('token') }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
