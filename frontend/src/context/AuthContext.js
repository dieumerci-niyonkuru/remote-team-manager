import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/accounts/profile/').then(res => setUser(res.data)).catch(() => logout()).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);
  const login = async (username, password) => {
    const res = await api.post('/accounts/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const userRes = await api.get('/accounts/profile/');
    setUser(userRes.data);
    return res.data;
  };
  const register = async (data) => { return (await api.post('/accounts/register/', data)).data; };
  const logout = () => { localStorage.clear(); setUser(null); };
  return <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};
