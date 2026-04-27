import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          err.config.headers.Authorization = `Bearer ${data.access}`
          return api(err.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: d => api.post('/auth/register/', d),
  login: d => api.post('/auth/login/', d),
  me: () => api.get('/auth/me/'),
  logout: refresh => api.post('/auth/logout/', { refresh }),
}

export const workspaceApi = {
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

export const projectApi = {
  list: wsId => api.get(`/workspaces/${wsId}/projects/`),
  create: (wsId, d) => api.post(`/workspaces/${wsId}/projects/`, d),
  update: (wsId, id, d) => api.patch(`/workspaces/${wsId}/projects/${id}/`, d),
  delete: (wsId, id) => api.delete(`/workspaces/${wsId}/projects/${id}/`),
}

export const taskApi = {
  list: (wsId, projId, params) => api.get(`/workspaces/${wsId}/projects/${projId}/tasks/`, { params }),
  create: (wsId, projId, d) => api.post(`/workspaces/${wsId}/projects/${projId}/tasks/`, d),
  update: (wsId, projId, id, d) => api.patch(`/workspaces/${wsId}/projects/${projId}/tasks/${id}/`, d),
  delete: (wsId, projId, id) => api.delete(`/workspaces/${wsId}/projects/${projId}/tasks/${id}/`),
  subtasks: (wsId, projId, id) => api.get(`/workspaces/${wsId}/projects/${projId}/tasks/${id}/subtasks/`),
  createSubtask: (wsId, projId, id, d) => api.post(`/workspaces/${wsId}/projects/${projId}/tasks/${id}/subtasks/`, d),
  updateSubtask: (wsId, projId, taskId, id, d) => api.patch(`/workspaces/${wsId}/projects/${projId}/tasks/${taskId}/subtasks/${id}/`, d),
  logTime: (wsId, projId, id, d) => api.post(`/workspaces/${wsId}/projects/${projId}/tasks/${id}/timelogs/`, d),
}

export default api
