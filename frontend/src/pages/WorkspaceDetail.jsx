import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ws, proj, task } from '../services/api'
import toast from 'react-hot-toast'

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#64748b' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#22c55e' },
]

export default function WorkspaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme } = useStore()
  const [workspace, setWorkspace] = useState(null)
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [jobs, setJobs] = useState([])
  const [activeTab, setActiveTab] = useState('board')
  const [loading, setLoading] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showJobModal, setShowJobModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium' })
  const [newJob, setNewJob] = useState({ title: '', description: '', location: 'Remote', requirements: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const w = await ws.get(id)
        setWorkspace(w.data.data)
        const [p, j] = await Promise.all([
          proj.list(id),
          fetch(`${import.meta.env.VITE_API_URL || 'https://remote-team-manager-production.up.railway.app/api'}/workspaces/${id}/jobs/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('rtm_access')}` }
          }).then(res => res.json()).catch(() => ({ data: [] }))
        ])
        setProjects(p.data.data || [])
        setJobs(j.data || [])
        if (p.data.data.length) {
          setActiveProject(p.data.data[0])
          const t = await task.list(id, p.data.data[0].id)
          setTasks(t.data.data || [])
        }
      } catch (err) {
        toast.error('Failed to load workspace')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const loadTasks = async (projectId) => {
    const res = await task.list(id, projectId)
    setTasks(res.data.data || [])
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProject.name.trim()) {
      toast.error('Project name required')
      return
    }
    setSaving(true)
    try {
      const res = await proj.create(id, newProject)
      const newProj = res.data.data
      setProjects([...projects, newProj])
      setActiveProject(newProj)
      setShowProjectModal(false)
      setNewProject({ name: '', description: '' })
      toast.success('Project created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) {
      toast.error('Task title required')
      return
    }
    setSaving(true)
    try {
      const res = await task.create(id, activeProject.id, newTask)
      setTasks([...tasks, res.data.data])
      setShowTaskModal(false)
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' })
      toast.success('Task created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!newJob.title.trim() || !newJob.description.trim()) {
      toast.error('Title and description required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://remote-team-manager-production.up.railway.app/api'}/workspaces/${id}/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('rtm_access')}`
        },
        body: JSON.stringify(newJob)
      }).then(r => r.json())
      if (res.data) {
        setJobs([...jobs, res.data])
        setShowJobModal(false)
        setNewJob({ title: '', description: '', location: 'Remote', requirements: '' })
        toast.success('Job posted!')
      } else {
        throw new Error(res.message)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post job')
    } finally {
      setSaving(false)
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await task.update(id, activeProject.id, taskId, { status: newStatus })
      setTasks(tasks.map(t => t.id === taskId ? res.data.data : t))
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await task.delete(id, activeProject.id, taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  if (loading) return <div className={theme} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', marginBottom: 16 }}>← Back</button>
        <h1>{workspace?.name}</h1>
        <p>{workspace?.description}</p>

        {/* Tabs */}
        <div className="tab-nav" style={{ margin: '20px 0', display: 'flex', gap: 8 }}>
          <button className={activeTab === 'board' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setActiveTab('board')}>Board</button>
          <button className={activeTab === 'jobs' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setActiveTab('jobs')}>Jobs</button>
        </div>

        {activeTab === 'board' && (
          <>
            <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
              {projects.map(p => (
                <button
                  key={p.id}
                  className={activeProject?.id === p.id ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                  onClick={() => { setActiveProject(p); loadTasks(p.id) }}
                >
                  {p.name}
                </button>
              ))}
              <button className="btn-primary btn-sm" onClick={() => setShowProjectModal(true)}>+ New Project</button>
            </div>

            {!activeProject ? (
              <div className="card empty-state">No project selected or created</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                  <h2>Tasks in {activeProject.name}</h2>
                  <button className="btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ New Task</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {COLUMNS.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.key)
                    return (
                      <div key={col.key} style={{ background: 'var(--bg2)', borderRadius: 12, padding: 12 }}>
                        <h3 style={{ color: col.color }}>{col.label} ({colTasks.length})</h3>
                        {colTasks.map(t => (
                          <div key={t.id} className="card" style={{ padding: 10, marginBottom: 8 }}>
                            <div><strong>{t.title}</strong></div>
                            {t.description && <div style={{ fontSize: 12 }}>{t.description}</div>}
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              {col.key !== 'todo' && <button onClick={() => updateTaskStatus(t.id, 'todo')} className="btn-sm btn-secondary">← Todo</button>}
                              {col.key !== 'in_progress' && <button onClick={() => updateTaskStatus(t.id, 'in_progress')} className="btn-sm btn-secondary">→ Progress</button>}
                              {col.key !== 'done' && <button onClick={() => updateTaskStatus(t.id, 'done')} className="btn-sm btn-secondary">✓ Done</button>}
                              <button onClick={() => deleteTask(t.id)} className="btn-sm btn-danger">🗑</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'jobs' && (
          <div>
            <button className="btn-primary btn-sm" onClick={() => setShowJobModal(true)}>+ Post Job</button>
            {jobs.length === 0 && <div className="card empty-state">No jobs posted yet</div>}
            {jobs.map(job => (
              <div key={job.id} className="card" style={{ marginTop: 12, padding: 16 }}>
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <div><strong>Location:</strong> {job.location}</div>
                <div><strong>Status:</strong> {job.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* Modals (unchanged) */}
        {showProjectModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProjectModal(false)}>
            <div className="modal-content"><h3>New Project</h3><input className="input" placeholder="Name" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} /><textarea className="input-textarea" placeholder="Description" rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} /><div style={{ display: 'flex', gap: 8, marginTop: 16 }}><button className="btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button><button className="btn-primary" onClick={handleCreateProject} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button></div></div>
          </div>
        )}

        {showTaskModal && activeProject && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTaskModal(false)}>
            <div className="modal-content"><h3>New Task</h3><input className="input" placeholder="Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} /><textarea className="input-textarea" placeholder="Description" rows="2" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><select className="input" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select><select className="input" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div><div style={{ display: 'flex', gap: 8, marginTop: 16 }}><button className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button><button className="btn-primary" onClick={handleCreateTask} disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button></div></div>
          </div>
        )}

        {showJobModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowJobModal(false)}>
            <div className="modal-content"><h3>Post a Job</h3><input className="input" placeholder="Title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} /><textarea className="input-textarea" placeholder="Description" rows="4" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} /><input className="input" placeholder="Location" style={{ marginTop: 8 }} value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} /><textarea className="input-textarea" placeholder="Requirements" rows="3" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} /><div style={{ display: 'flex', gap: 8, marginTop: 16 }}><button className="btn-secondary" onClick={() => setShowJobModal(false)}>Cancel</button><button className="btn-primary" onClick={handleCreateJob} disabled={saving}>{saving ? 'Posting...' : 'Post'}</button></div></div>
          </div>
        )}
      </div>
    </div>
  )
}
