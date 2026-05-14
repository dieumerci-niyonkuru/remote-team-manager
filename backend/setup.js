const fs = require('fs');

fs.writeFileSync('src/store.js', [
  "import { create } from 'zustand';",
  "",
  "export const useStore = create((set) => ({",
  "  user: null,",
  "  token: localStorage.getItem('token') || null,",
  "  isAuthenticated: !!localStorage.getItem('token'),",
  "  setUser: (user) => set({ user, isAuthenticated: !!user }),",
  "  setToken: (token) => {",
  "    if (token) { localStorage.setItem('token', token); }",
  "    else { localStorage.removeItem('token'); }",
  "    set({ token, isAuthenticated: !!token });",
  "  },",
  "  logout: () => {",
  "    localStorage.removeItem('token');",
  "    set({ user: null, token: null, isAuthenticated: false });",
  "  },",
  "  team: [],",
  "  setTeam: (team) => set({ team }),",
  "}));",
].join('\n'));
console.log('✅ src/store.js created');

fs.mkdirSync('src/services', { recursive: true });
fs.writeFileSync('src/services/api.js', [
  "import axios from 'axios';",
  "",
  "const api = axios.create({",
  "  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',",
  "  headers: { 'Content-Type': 'application/json' },",
  "});",
  "",
  "api.interceptors.request.use((config) => {",
  "  const token = localStorage.getItem('token');",
  "  if (token) config.headers.Authorization = 'Bearer ' + token;",
  "  return config;",
  "});",
  "",
  "export const auth = {",
  "  login: (data) => api.post('/auth/login', data),",
  "  register: (data) => api.post('/auth/register', data),",
  "  logout: () => api.post('/auth/logout'),",
  "  me: () => api.get('/auth/me'),",
  "};",
  "",
  "export default api;",
].join('\n'));
console.log('✅ src/services/api.js created');
