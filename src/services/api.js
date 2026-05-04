import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('rtm_access')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(r => r, async err => {
  if (err.response?.status === 401 && !err.config._retry) {
    err.config._retry = true
    const r = localStorage.getItem('rtm_refresh')
    if (r) {
      try {
        const { data } = await axios.post(`${BASE}/auth/token/refresh/`, { refresh: r })
        localStorage.setItem('rtm_access', data.access)
        err.config.headers.Authorization = `Bearer ${data.access}`
        return api(err.config)
      } catch { localStorage.clear(); window.location.href = '/login' }
    }
  }
  return Promise.reject(err)
})

export const auth = {
  register: d => {
    if (d instanceof FormData) return api.post('/auth/register/', d, { headers: { 'Content-Type': 'multipart/form-data' } })
    return api.post('/auth/register/', d)
  },
  login: d => api.post('/auth/login/', d),
  me: () => api.get('/auth/me/'),
  logout: r => api.post('/auth/logout/', { refresh: r }),
}
export const ws = {
  list: () => api.get('/workspaces/'),
  create: d => api.post('/workspaces/', d),
  get: id => api.get(`/workspaces/${id}/`),
  update: (id, d) => api.patch(`/workspaces/${id}/`, d),
  delete: id => api.delete(`/workspaces/${id}/`),
  members: id => api.get(`/workspaces/${id}/members/`),
  invite: (id, d) => api.post(`/workspaces/${id}/members/`, d),
  removeMember: (id, uid) => api.delete(`/workspaces/${id}/members/${uid}/`),
  activity: id => api.get(`/workspaces/${id}/activity/`),
}
export const proj = {
  list: wid => api.get(`/workspaces/${wid}/projects/`),
  create: (wid, d) => api.post(`/workspaces/${wid}/projects/`, d),
  update: (wid, id, d) => api.patch(`/workspaces/${wid}/projects/${id}/`, d),
  delete: (wid, id) => api.delete(`/workspaces/${wid}/projects/${id}/`),
}
export const task = {
  list: (wid, pid, p) => api.get(`/workspaces/${wid}/projects/${pid}/tasks/`, { params: p }),
  create: (wid, pid, d) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/`, d),
  update: (wid, pid, id, d) => api.patch(`/workspaces/${wid}/projects/${pid}/tasks/${id}/`, d),
  delete: (wid, pid, id) => api.delete(`/workspaces/${wid}/projects/${pid}/tasks/${id}/`),
  subtasks: (wid, pid, id) => api.get(`/workspaces/${wid}/projects/${pid}/tasks/${id}/subtasks/`),
  addSubtask: (wid, pid, id, d) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/${id}/subtasks/`, d),
  updateSubtask: (wid, pid, tid, id, d) => api.patch(`/workspaces/${wid}/projects/${pid}/tasks/${tid}/subtasks/${id}/`, d),
  logTime: (wid, pid, id, d) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/${id}/timelogs/`, d),
}
export const chat = {
  channels: () => api.get('/channels/'),
  createChannel: d => api.post('/channels/', d),
  joinChannel: id => api.post(`/channels/${id}/join/`),
  messages: params => api.get('/messages/', { params }),
  dms: () => api.get('/direct-messages/'),
  createDm: d => api.post('/direct-messages/', d),
}
export const timer = {
  start: task_id => api.post('/start/', { task_id }),
  pause: task_id => api.post('/pause/', { task_id }),
  logs: () => api.get('/logs/'),
}
export const hr = {
  employees: () => api.get('/employee-profiles/'),
  createEmployee: d => api.post('/employee-profiles/', d),
  jobs: () => api.get('/job-postings/'),
  createJob: d => api.post('/job-postings/', d),
  payroll: () => api.get('/payroll/'),
}
export const files = {
  list: params => api.get('/file-attachments/', { params }),
  upload: d => api.post('/file-attachments/', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
}
export const ai = {
  suggestTasks: prompt => api.post('/ai/suggest-tasks/', { prompt }),
}
export const automation = {
  list: () => api.get('/automation/rules/'),
  create: d => api.post('/automation/rules/', d),
  delete: id => api.delete(`/automation/rules/${id}/`),
}
export const wiki = {
  list: (q) => api.get('/wiki/articles/', { params: q ? { q } : {} }),
  get: (id) => api.get(`/wiki/articles/${id}/`),
  create: d => api.post('/wiki/articles/', d),
  update: (id, d) => api.patch(`/wiki/articles/${id}/`, d),
  delete: id => api.delete(`/wiki/articles/${id}/`),
}
export const search = {
  global: (q) => api.get('/search/', { params: { q } }),
}
export default api
