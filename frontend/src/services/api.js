import axios from 'axios'

// Hardcode the correct production URL
const BASE = 'https://remote-team-manager-production.up.railway.app/api'

console.log('API Base URL:', BASE)

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Log all requests
api.interceptors.request.use(req => {
  console.log('API Request:', req.method, req.url, req.data)
  return req
})

api.interceptors.response.use(
  res => {
    console.log('API Response:', res.status, res.data)
    return res
  },
  err => {
    console.error('API Error:', err.response?.status, err.response?.data, err.message)
    return Promise.reject(err)
  }
)

// Attach token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('rtm_access')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('rtm_refresh')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE}/auth/token/refresh/`, { refresh: refreshToken })
          localStorage.setItem('rtm_access', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const auth = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
}

export const ws = {
  list: () => api.get('/workspaces/'),
  create: (data) => api.post('/workspaces/', data),
  get: (id) => api.get(`/workspaces/${id}/`),
  update: (id, data) => api.patch(`/workspaces/${id}/`, data),
  delete: (id) => api.delete(`/workspaces/${id}/`),
  members: (id) => api.get(`/workspaces/${id}/members/`),
  invite: (id, data) => api.post(`/workspaces/${id}/members/`, data),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}/`),
  activity: (id) => api.get(`/workspaces/${id}/activity/`),
}

export const proj = {
  list: (workspaceId) => api.get(`/workspaces/${workspaceId}/projects/`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects/`, data),
  update: (workspaceId, projectId, data) => api.patch(`/workspaces/${workspaceId}/projects/${projectId}/`, data),
  delete: (workspaceId, projectId) => api.delete(`/workspaces/${workspaceId}/projects/${projectId}/`),
}

export const task = {
  list: (workspaceId, projectId, params) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/`, { params }),
  create: (workspaceId, projectId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/`, data),
  update: (workspaceId, projectId, taskId, data) => api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/`, data),
  delete: (workspaceId, projectId, taskId) => api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/`),
  subtasks: (workspaceId, projectId, taskId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/`),
  addSubtask: (workspaceId, projectId, taskId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/`, data),
  logTime: (workspaceId, projectId, taskId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/timelogs/`, data),
}

export const comment = {
  list: (workspaceId, projectId, taskId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/`),
  create: (workspaceId, projectId, taskId, content) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/`, { content }),
}

export default api
