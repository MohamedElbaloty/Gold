import React, { createContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

const ACCOUNT_MODE_KEY = 'accountMode';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [accountMode, setAccountModeState] = useState(() => localStorage.getItem(ACCOUNT_MODE_KEY) || null);

  const setAccountMode = (mode) => {
    if (mode === null) {
      localStorage.removeItem(ACCOUNT_MODE_KEY);
    } else {
      localStorage.setItem(ACCOUNT_MODE_KEY, mode);
    }
    setAccountModeState(mode);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/api/user/profile');
        setUser(res.data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      setAccountModeState(null);
      localStorage.removeItem(ACCOUNT_MODE_KEY);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      setAccountModeState(null);
      localStorage.removeItem(ACCOUNT_MODE_KEY);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAccountModeState(null);
    localStorage.removeItem('token');
    localStorage.removeItem(ACCOUNT_MODE_KEY);
  };

  const createDemoAccount = async () => {
    try {
      const res = await api.post('/api/auth/demo');
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      setAccountModeState('demo');
      localStorage.setItem(ACCOUNT_MODE_KEY, 'demo');
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create demo account'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, accountMode, setAccountMode, login, register, logout, createDemoAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
