import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workspaceApi, projectApi, taskApi } from '../services/api'
import toast from 'react-hot-toast'

const TASK_COLS = [
  { key: 'todo', label: 'To Do', color: '#94a3b8' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#22c55e' },
]

const PRIORITY_COLORS = { low: 'badge-blue', medium: 'badge-amber', high: 'badge-red' }
const ROLE_COLORS = { owner: 'badge-purple', manager: 'badge-blue', developer: 'badge-green', viewer: 'badge-gray' }

export default function WorkspaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(null)
  const [members, setMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [tab, setTab] = useState('board')
  const [loading, setLoading] = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', status: 'todo', priority: 'medium', description: '' })
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [invite, setInvite] = useState({ email: '', role: 'developer' })
  const [activity, setActivity] = useState([])

  useEffect(() => {
    Promise.all([
      workspaceApi.get(id),
      workspaceApi.members(id),
      projectApi.list(id),
      workspaceApi.activity(id),
    ]).then(([ws, mem, proj, act]) => {
      setWorkspace(ws.data.data)
      setMembers(mem.data.data)
      setProjects(proj.data.data)
      setActivity(act.data.data)
      if (proj.data.data.length > 0) {
        setActiveProject(proj.data.data[0])
        loadTasks(proj.data.data[0].id)
      }
      setLoading(false)
    }).catch(() => { setLoading(false); navigate('/dashboard') })
  }, [id])

  const loadTasks = async projectId => {
    const res = await taskApi.list(id, projectId)
    setTasks(res.data.data)
  }

  const handleCreateTask = async e => {
    e.preventDefault()
    try {
      const res = await taskApi.create(id, activeProject.id, newTask)
      setTasks([...tasks, res.data.data])
      setShowNewTask(false)
      setNewTask({ title: '', status: 'todo', priority: 'medium', description: '' })
      toast.success('Task created! ✅')
    } catch { toast.error('Failed to create task') }
  }

  const handleUpdateTask = async (taskId, data) => {
    try {
      const res = await taskApi.update(id, activeProject.id, taskId, data)
      setTasks(tasks.map(t => t.id === taskId ? res.data.data : t))
    } catch { toast.error('Failed to update task') }
  }

  const handleDeleteTask = async taskId => {
    if (!confirm('Delete this task?')) return
    try {
      await taskApi.delete(id, activeProject.id, taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete task') }
  }

  const handleCreateProject = async e => {
    e.preventDefault()
    try {
      const res = await projectApi.create(id, newProject)
      const p = res.data.data
      setProjects([...projects, p])
      setActiveProject(p)
      setTasks([])
      setShowNewProject(false)
      setNewProject({ name: '', description: '' })
      toast.success('Project created! 📁')
    } catch { toast.error('Failed to create project') }
  }

  const handleInvite = async e => {
    e.preventDefault()
    try {
      const res = await workspaceApi.invite(id, invite)
      setMembers([...members, res.data.data])
      setShowInvite(false)
      setInvite({ email: '', role: 'developer' })
      toast.success('Member invited! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)', fontSize: 14 }}>
      <div className="spinner" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid #3366ff', borderRadius: '50%' }} />
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.4s ease' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', color: 'var(--text-muted)', fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{workspace?.name}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{workspace?.description}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['board', 'members', 'activity'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#3366ff' : 'var(--bg)', color: tab === t ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Board Tab */}
      {tab === 'board' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Project selector */}
          <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
            {projects.map(p => (
              <button key={p.id} onClick={() => { setActiveProject(p); loadTasks(p.id) }}
                style={{ background: activeProject?.id === p.id ? '#3366ff' : 'var(--bg)', color: activeProject?.id === p.id ? '#fff' : 'var(--text)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                📁 {p.name}
              </button>
            ))}
            <button onClick={() => setShowNewProject(true)} style={{ background: 'transparent', color: '#3366ff', border: '1px dashed #3366ff', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>+ New Project</button>
            {activeProject && <button onClick={() => setShowNewTask(true)} className="btn-primary" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>+ New Task</button>}
          </div>

          {/* Kanban */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {!activeProject ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                <p>Create a project to start adding tasks</p>
                <button className="btn-primary" onClick={() => setShowNewProject(true)} style={{ marginTop: 16 }}>Create Project</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {TASK_COLS.map(col => {
                  const colTasks = tasks.filter(t => t.status === col.key)
                  return (
                    <div key={col.key} style={{ flex: 1, minWidth: 240, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{col.label}</span>
                        </div>
                        <span style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px', color: 'var(--text-muted)' }}>{colTasks.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {colTasks.map(task => (
                          <div key={task.id} className="card" style={{ padding: 12, borderLeft: `3px solid ${col.color}`, cursor: 'default' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>{task.title}</div>
                            {task.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{task.description}</div>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                              {task.assignee && <span className="badge badge-gray" style={{ fontSize: 10 }}>👤 {task.assignee.first_name}</span>}
                              {task.due_date && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>📅 {task.due_date}</span>}
                            </div>
                            {task.progress > 0 && (
                              <div style={{ marginTop: 8 }}>
                                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${task.progress}%`, background: '#3366ff', borderRadius: 2 }} />
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{task.progress}%</div>
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              {col.key !== 'in_progress' && <button onClick={() => handleUpdateTask(task.id, { status: 'in_progress' })} style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 10 }}>→ Progress</button>}
                              {col.key !== 'done' && <button onClick={() => handleUpdateTask(task.id, { status: 'done' })} style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 10 }}>✓ Done</button>}
                              <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 10, marginLeft: 'auto' }}>🗑</button>
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--text-muted)' }}>No tasks</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Team Members ({members.length})</h2>
            <button className="btn-primary" onClick={() => setShowInvite(true)} style={{ padding: '8px 16px', fontSize: 13 }}>+ Invite Member</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {members.map(m => (
              <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3366ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14, flexShrink: 0 }}>
                  {m.user.first_name[0]}{m.user.last_name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{m.user.first_name} {m.user.last_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user.email}</div>
                </div>
                <span className={`badge ${ROLE_COLORS[m.role]}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {tab === 'activity' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Activity Feed</h2>
          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
              <p>No activity yet. Start creating tasks!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activity.map(a => (
                <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3366ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 12, flexShrink: 0 }}>
                    {a.actor?.first_name?.[0]}{a.actor?.last_name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{a.actor?.first_name} </span>
                    <span className={`badge ${a.action === 'created' ? 'badge-green' : a.action === 'deleted' ? 'badge-red' : 'badge-amber'}`} style={{ marginLeft: 4 }}>{a.action}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 6 }}>{a.object_type}: <strong style={{ color: 'var(--text)' }}>{a.object_name}</strong></span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(a.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Task Modal */}
      {showNewTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card animate-fade" style={{ width: '100%', maxWidth: 460, padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>New Task</h3>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Task title *</label>
                <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="What needs to be done?" required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows={3} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Status</label>
                  <select value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowNewTask(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card animate-fade" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>New Project</h3>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Project name *</label>
                <input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="My Amazing Project" required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} rows={3} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowNewProject(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card animate-fade" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Invite Member</h3>
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email address *</label>
                <input type="email" value={invite.email} onChange={e => setInvite({...invite, email: e.target.value})} placeholder="teammate@example.com" required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Role</label>
                <select value={invite.role} onChange={e => setInvite({...invite, role: e.target.value})}>
                  <option value="manager">Manager</option>
                  <option value="developer">Developer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowInvite(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
