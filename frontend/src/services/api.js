import axios from 'axios'

// Use environment variable or fallback to production URL
const BASE = import.meta.env.VITE_API_URL || 'https://remote-team-manager-production.up.railway.app/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor to add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('rtm_access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('rtm_refresh')
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE}/auth/token/refresh/`, { refresh: refreshToken })
          const { access } = response.data.data
          localStorage.setItem('rtm_access', access)
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.clear()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const auth = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  logout: (refresh) => api.post('/auth/logout/', { refresh })
}

// Workspace endpoints
export const ws = {
  list: () => api.get('/workspaces/'),
  create: (data) => api.post('/workspaces/', data),
  get: (id) => api.get(`/workspaces/${id}/`),
  update: (id, data) => api.patch(`/workspaces/${id}/`, data),
  delete: (id) => api.delete(`/workspaces/${id}/`),
  members: (id) => api.get(`/workspaces/${id}/members/`),
  invite: (id, data) => api.post(`/workspaces/${id}/members/`, data),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}/`),
  activity: (id) => api.get(`/workspaces/${id}/activity/`)
}

// Project endpoints
export const proj = {
  list: (workspaceId) => api.get(`/workspaces/${workspaceId}/projects/`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects/`, data),
  update: (workspaceId, projectId, data) => api.patch(`/workspaces/${workspaceId}/projects/${projectId}/`, data),
  delete: (workspaceId, projectId) => api.delete(`/workspaces/${workspaceId}/projects/${projectId}/`)
}

// Task endpoints
export const task = {
  list: (workspaceId, projectId, params) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/`, { params }),
  create: (workspaceId, projectId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/`, data),
  update: (workspaceId, projectId, taskId, data) => api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/`, data),
  delete: (workspaceId, projectId, taskId) => api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/`),
  subtasks: (workspaceId, projectId, taskId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/`),
  createSubtask: (workspaceId, projectId, taskId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/`, data),
  updateSubtask: (workspaceId, projectId, taskId, subtaskId, data) => api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/`, data),
  logTime: (workspaceId, projectId, taskId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/timelogs/`, data)
}

export default api
