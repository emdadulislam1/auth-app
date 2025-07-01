import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { validateToken } from '../utils/tokenValidation';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Initialize token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      if (validateToken(storedToken)) {
        setTokenState(storedToken);
        setIsTokenValid(true);
      } else {
        localStorage.removeItem('token');
        sessionStorage.clear(); // Clear any session data
        setTokenState(null);
        setIsTokenValid(false);
      }
    } else {
      setIsTokenValid(false);
    }
    
    setLoading(false);
  }, []);

  // Handle token changes
  useEffect(() => {
    if (token) {
      if (validateToken(token)) {
        localStorage.setItem('token', token);
        setIsTokenValid(true);
      } else {
        setTokenState(null);
        setIsTokenValid(false);
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('token');
      sessionStorage.clear();
      setIsTokenValid(false);
    }
  }, [token]);

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (token && !validateToken(token)) {
        logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [token]);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
  };

  const logout = () => {
    setTokenState(null);
    setIsTokenValid(false);
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Clear any cached data
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, loading, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
}; 