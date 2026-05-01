import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://remote-team-manager-production.up.railway.app/api';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
