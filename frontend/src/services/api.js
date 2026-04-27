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
  register: d => api.post('/auth/register/', d),
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
  logTime: (wid, pid, id, d) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/${id}/timelogs/`, d),
}

export default api
