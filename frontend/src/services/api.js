import axios from 'axios'

const BASE = 'https://remote-team-manager.up.railway.app/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rtm_access')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
        } catch (e) {
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
  register: (d) => api.post('/auth/register/', d),
  login: (d) => api.post('/auth/login/', d),
  me: () => api.get('/auth/me/'),
  logout: (r) => api.post('/auth/logout/', { refresh: r || localStorage.getItem('rtm_refresh') }),
}

export const ws = {
  list: () => api.get('/workspaces/'),
  create: (d) => api.post('/workspaces/', d),
  get: (id) => api.get(`/workspaces/${id}/`),
  update: (id, d) => api.patch(`/workspaces/${id}/`, d),
  delete: (id) => api.delete(`/workspaces/${id}/`),
  members: (id) => api.get(`/workspaces/${id}/members/`),
  invite: (id, d) => api.post(`/workspaces/${id}/members/`, d),
  removeMember: (id, uid) => api.delete(`/workspaces/${id}/members/${uid}/`),
  activity: (id) => api.get(`/workspaces/${id}/activity/`),
}

export const proj = {
  list: (wid) => api.get(`/workspaces/${wid}/projects/`),
  create: (wid, d) => api.post(`/workspaces/${wid}/projects/`, d),
  update: (wid, id, d) => api.patch(`/workspaces/${wid}/projects/${id}/`, d),
  delete: (wid, id) => api.delete(`/workspaces/${wid}/projects/${id}/`),
}

export const task = {
  list: (wid, pid, params) => api.get(`/workspaces/${wid}/projects/${pid}/tasks/`, { params }),
  create: (wid, pid, d) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/`, d),
  update: (wid, pid, id, d) => api.patch(`/workspaces/${wid}/projects/${pid}/tasks/${id}/`, d),
  delete: (wid, pid, id) => api.delete(`/workspaces/${wid}/projects/${pid}/tasks/${id}/`),
  subtasks: (wid, pid, id) => api.get(`/workspaces/${wid}/projects/${pid}/tasks/${id}/subtasks/`),
  addSubtask: (wid, pid, id, d) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/${id}/subtasks/`, d),
  logTime: (wid, pid, id, d) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/${id}/timelogs/`, d),
  attachments: (wid, pid, id) => api.get(`/workspaces/${wid}/projects/${pid}/tasks/${id}/attachments/`),
  uploadAttachment: (wid, pid, id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/workspaces/${wid}/projects/${pid}/tasks/${id}/attachments/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export const comments = {
  list: (wid, pid, tid) => api.get(`/workspaces/${wid}/projects/${pid}/tasks/${tid}/comments/`),
  create: (wid, pid, tid, content, parentId = null) => api.post(`/workspaces/${wid}/projects/${pid}/tasks/${tid}/comments/`, { content, parent: parentId }),
}

export const notifications = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.patch(`/notifications/${id}/read/`),
  countUnread: () => api.get('/notifications/unread-count/'),
}

export const directMessages = {
  conversations: (wid) => api.get(`/workspaces/${wid}/direct-messages/`),
  messages: (convoId) => api.get(`/direct-messages/${convoId}/messages/`),
  send: (convoId, content) => api.post(`/direct-messages/${convoId}/messages/`, { content }),
}

export const ai = {
  suggestTask: (taskData) => api.post('/ai/suggest/', taskData),
}

export default api
