import axios from 'axios';

const BASE = import.meta.env.PROD
  ? 'https://remote-team-manager-production.up.railway.app/api'
  : '/api';

const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('rtm_access');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Unified response interceptor: unwrap data envelope + handle 401 token refresh
api.interceptors.response.use(
  r => {
    // Unwrap { data: ... } envelope returned by the backend
    if (r.data && typeof r.data === 'object' && 'data' in r.data) {
      r.data = r.data.data;
    }
    return r;
  },
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const refresh = localStorage.getItem('rtm_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('rtm_access', data.access);
          err.config.headers.Authorization = `Bearer ${data.access}`;
          return api(err.config);
        } catch {
          localStorage.removeItem('rtm_access');
          localStorage.removeItem('rtm_refresh');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: d => (d instanceof FormData
    ? api.post('/auth/register/', d, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/auth/register/', d)),
  login: d => api.post('/auth/login/', d),
  me: () => api.get('/auth/me/'),
  updateProfile: d => (d instanceof FormData
    ? api.patch('/auth/me/', d, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.patch('/auth/me/', d)),
  logout: r => api.post('/auth/logout/', { refresh: r }),
  changePassword: d => api.patch('/auth/change-password/', d),
};

export const ws = {
  list: () => api.get('/workspaces/'),
  create: d => api.post('/workspaces/', d),
  get: id => api.get(`/workspaces/${id}/`),
  update: (id, d) => api.patch(`/workspaces/${id}/`, d),
  delete: id => api.delete(`/workspaces/${id}/`),
  members: id => api.get(`/workspaces/${id}/members/`),
  invite: (id, d) => api.post(`/workspaces/${id}/add_member/`, d),
  removeMember: (id, uid) => api.delete(`/workspaces/${id}/members/${uid}/`),
  activity: id => api.get(`/workspaces/${id}/activity/`),
};

export const proj = {
  list: wid => api.get('/projects/', { params: { workspace: wid } }),
  create: (wid, d) => api.post('/projects/', { ...d, workspace: wid }),
  update: (wid, id, d) => api.patch(`/projects/${id}/`, d),
  delete: (wid, id) => api.delete(`/projects/${id}/`),
};

export const task = {
  list: (wid, pid, p) => api.get('/tasks/', { params: { ...p, project: pid } }),
  create: (wid, pid, d) => api.post('/tasks/', { ...d, project: pid }),
  update: (wid, pid, id, d) => api.patch(`/tasks/${id}/`, d),
  delete: (wid, pid, id) => api.delete(`/tasks/${id}/`),
  subtasks: (wid, pid, id) => api.get(`/tasks/${id}/subtasks/`),
  addSubtask: (wid, pid, id, d) => api.post(`/tasks/${id}/add_subtask/`, d),
  updateSubtask: (wid, pid, tid, id, d) => api.patch(`/tasks/${tid}/subtasks/${id}/`, d),
  logTime: (wid, pid, id, d) => api.post(`/tasks/${id}/timelogs/`, d),
};

export const chat = {
  channels: () => api.get('/channels/'),
  createChannel: d => api.post('/channels/', d),
  joinChannel: id => api.post(`/channels/${id}/join/`),
  leaveChannel: id => api.post(`/channels/${id}/leave/`),
  messages: params => api.get('/messages/', { params }),
  sendMessage: d => api.post('/messages/', d),
  dms: () => api.get('/direct-messages/'),
  createDm: d => api.post('/direct-messages/', d),
  addReaction: (id, emoji) => api.post(`/messages/${id}/react/`, { emoji }),
  editMessage: (id, content) => api.patch(`/messages/${id}/`, { content }),
  deleteMessage: id => api.delete(`/messages/${id}/`),
  pinMessage: id => api.post(`/messages/${id}/pin/`),
  markRead: channelId => api.post(`/channels/${channelId}/read/`),
  pinnedMessages: channelId => api.get(`/channels/${channelId}/pinned/`),
  searchMessages: (channelId, q) => api.get(`/channels/${channelId}/search/`, { params: { q } }),
  thread: msgId => api.get(`/messages/${msgId}/thread/`),
  uploadFile: d => api.post('/file-attachments/', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const timer = {
  start: task_id => api.post('/timelogs/start/', { task_id }),
  pause: task_id => api.post('/timelogs/pause/', { task_id }),
  logs: () => api.get('/timelogs/logs/'),
};

export const hr = {
  employees: () => api.get('/employee-profiles/'),
  createEmployee: d => api.post('/employee-profiles/', d),
  jobs: () => api.get('/job-postings/'),
  createJob: d => api.post('/job-postings/', d),
  payroll: () => api.get('/payroll/'),
};

export const files = {
  list: params => api.get('/file-attachments/', { params }),
  upload: d => api.post('/file-attachments/', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: id => api.delete(`/file-attachments/${id}/`),
};

export const ai = {
  suggestTasks: prompt => api.post('/ai-suggestions/', { prompt }),
};

export const automation = {
  list: () => api.get('/automation-rules/'),
  create: d => api.post('/automation-rules/', d),
  update: (id, d) => api.patch(`/automation-rules/${id}/`, d),
  delete: id => api.delete(`/automation-rules/${id}/`),
};

export const integrations = {
  list: wid => api.get('/integrations/', { params: { workspace: wid } }),
  connect: d => api.post('/integrations/', d),
  update: (id, d) => api.patch(`/integrations/${id}/`, d),
  delete: id => api.delete(`/integrations/${id}/`),
};

export const wiki = {
  list: q => api.get('/wiki-articles/', { params: q ? { q } : {} }),
  get: id => api.get(`/wiki-articles/${id}/`),
  create: d => api.post('/wiki-articles/', d),
  update: (id, d) => api.patch(`/wiki-articles/${id}/`, d),
  delete: id => api.delete(`/wiki-articles/${id}/`),
  revisions: articleId => api.get(`/wiki-articles/${articleId}/revisions/`),
  restore: (articleId, revisionId) => api.post(`/wiki-articles/${articleId}/revisions/${revisionId}/restore/`),
};

export const calls = {
  initiate: (room_id, user_ids = []) => api.post('/calls/initiate/', { room_id, user_ids }),
};

export const invites = {
  received: () => api.get('/invites/received/'),
  sent: (wid) => api.get('/invites/sent/', { params: wid ? { workspace: wid } : {} }),
  generateLink: (d) => api.post('/invites/generate_link/', d),
  joinByToken: (token) => api.post('/invites/join_by_token/', { token }),
  accept: (id) => api.post(`/invites/${id}/accept/`),
  reject: (id) => api.post(`/invites/${id}/reject/`),
  delete: (id) => api.delete(`/invites/${id}/`),
};

export const notifications = {
  list: () => api.get('/notifications/'),
  markRead: id => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
  delete: id => api.delete(`/notifications/${id}/`),
};

export const search = {
  global: q => api.get('/search/', { params: { q } }),
};

export const okr = {
  objectives: () => api.get('/objectives/'),
  createObjective: d => api.post('/objectives/', d),
  updateObjective: (id, d) => api.patch(`/objectives/${id}/`, d),
  deleteObjective: id => api.delete(`/objectives/${id}/`),
  keyResults: objectiveId => api.get('/key-results/', { params: { objective: objectiveId } }),
  createKeyResult: (objectiveId, d) => api.post('/key-results/', { ...d, objective: objectiveId }),
  updateKeyResult: (id, d) => api.patch(`/key-results/${id}/`, d),
  deleteKeyResult: id => api.delete(`/key-results/${id}/`),
};

export const unwrapData = res => {
  if (!res) return [];
  const d = res.data;
  if (d && typeof d === 'object') {
    if ('results' in d) return d.results;
    if (Array.isArray(d)) return d;
    return d;
  }
  return [];
};

export default api;
