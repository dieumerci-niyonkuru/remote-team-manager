import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { ws, proj, task, timer, ai } from '../services/api'
import toast from 'react-hot-toast'

const COLS = [
  { key:'todo', label:'To Do', color:'#64748b' },
  { key:'in_progress', label:'In Progress', color:'#f59e0b' },
  { key:'done', label:'Done', color:'#22c55e' },
]
const PRI = { low:'badge-blue', medium:'badge-amber', high:'badge-red' }
const ROLE_BADGE = { owner:'badge-purple', manager:'badge-blue', developer:'badge-green', viewer:'badge-gray' }

const Modal = ({ title, onClose, children }) => (
  <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
    <div className="card scale-in" style={{ width:'100%', maxWidth:460, padding:36 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--text)' }}>{title}</h3>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
)

export default function WorkspaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, theme } = useStore()
  const t = useT(lang)
  const [data, setData] = useState({ workspace:null, members:[], projects:[], tasks:[], activity:[] })
  const [activeProj, setActiveProj] = useState(null)
  const [tab, setTab] = useState('board')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'task' | 'project' | 'invite'
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState({ status:'', priority:'' })
  const [activeTimer, setActiveTimer] = useState(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const load = async () => {
    try {
      const [w, m, p, a] = await Promise.all([ws.get(id), ws.members(id), proj.list(id), ws.activity(id)])
      const projects = p.data.data
      setData({ workspace:w.data.data, members:m.data.data, projects, tasks:[], activity:a.data.data })
      if (projects.length) { setActiveProj(projects[0]); loadTasks(projects[0].id) }
    } catch { navigate('/dashboard') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const loadTasks = async pid => {
    const r = await task.list(id, pid)
    setData(p => ({...p, tasks:r.data.data}))
  }

  const openModal = (type, defaults={}) => { setForm(defaults); setModal(type) }
  const closeModal = () => { setModal(null); setForm({}) }

  const handleCreateTask = async ev => {
    ev.preventDefault()
    if (!form.title?.trim() || !activeProj) return
    setSaving(true)
    try {
      const r = await task.create(id, activeProj.id, { ...form, status:'todo' })
      setData(p => ({...p, tasks:[...p.tasks, r.data.data]}))
      setForm({})
      toast.success('Task created')
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const handleAIBreakdown = async () => {
    if (!aiPrompt.trim() || !activeProj) return
    setAiLoading(true)
    try {
      const res = await ai.suggestTasks(aiPrompt)
      const tasksToCreate = res.data.tasks || []
      let newTasks = []
      for (const t of tasksToCreate) {
        const r = await task.create(id, activeProj.id, { title: t.title, description: t.description, priority: t.priority, status: 'todo' })
        newTasks.push(r.data.data)
      }
      setData(p => ({...p, tasks: [...p.tasks, ...newTasks]}))
      setAiPrompt('')
      toast.success(`AI generated ${newTasks.length} tasks! 🧠`)
    } catch {
      toast.error('AI request failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleUpdateTask = async (tid, updates) => {
    try {
      const r = await task.update(id, activeProj.id, tid, updates)
      setData(p => ({...p, tasks:p.tasks.map(t => t.id===tid ? r.data.data : t)}))
    } catch { toast.error('Failed to update') }
  }

  const handleDeleteTask = async tid => {
    if (!confirm('Delete this task?')) return
    try {
      await task.delete(id, activeProj.id, tid)
      setData(p => ({...p, tasks:p.tasks.filter(t => t.id!==tid)}))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const handleStartTimer = async tid => {
    try {
      await timer.start(tid)
      setActiveTimer(tid)
      toast.success('Timer started ⏱️')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to start timer') }
  }

  const handlePauseTimer = async tid => {
    try {
      await timer.pause(tid)
      setActiveTimer(null)
      toast.success('Timer paused ⏸️')
    } catch { toast.error('Failed to pause timer') }
  }

  const handleCreateProject = async ev => {
    ev.preventDefault()
    if (!form.name?.trim()) { toast.error(t.required); return }
    setSaving(true)
    try {
      const r = await proj.create(id, form)
      const p2 = r.data.data
      setData(p => ({...p, projects:[...p.projects, p2], tasks:[]}))
      setActiveProj(p2); closeModal(); toast.success('Project created 📁')
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${activeProj.name}"?`)) return
    try {
      await proj.delete(id, activeProj.id)
      const remaining = data.projects.filter(p => p.id !== activeProj.id)
      setData(p => ({...p, projects:remaining, tasks:[]}))
      setActiveProj(remaining[0] || null)
      if (remaining[0]) loadTasks(remaining[0].id)
      toast.success('Project deleted')
    } catch { toast.error('Failed') }
  }

  const handleInvite = async ev => {
    ev.preventDefault()
    if (!form.email) { toast.error(t.required); return }
    setSaving(true)
    try {
      const r = await ws.invite(id, form)
      setData(p => ({...p, members:[...p.members, r.data.data]}))
      closeModal(); toast.success('Member invited! 🎉')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setSaving(false) }
  }

  const handleRemoveMember = async uid => {
    if (!confirm('Remove this member?')) return
    try {
      await ws.removeMember(id, uid)
      setData(p => ({...p, members:p.members.filter(m => m.user.id!==uid)}))
      toast.success('Member removed')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const filteredTasks = data.tasks.filter(tk =>
    (!filter.status || tk.status===filter.status) &&
    (!filter.priority || tk.priority===filter.priority)
  )

  if (loading) return (
    <div className={theme} style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 64px)', background:'var(--bg)' }}>
      <div className="spinner" style={{ width:36, height:36, border:'3px solid var(--border)', borderTop:'3px solid #3366ff' }} />
    </div>
  )

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)' }}>
      {/* Workspace header */}
      <div style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'16px 24px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, flexWrap:'wrap' }}>
            <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding:'6px 10px', fontSize:13 }}>← Back</button>
            <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3366ff,#6699ff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontWeight:800, fontSize:16 }}>{data.workspace?.name[0]}</div>
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--text)' }}>{data.workspace?.name}</h1>
                {data.workspace?.description && <p style={{ fontSize:12, color:'var(--text2)' }}>{data.workspace.description}</p>}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-secondary" style={{ padding:'7px 14px', fontSize:13 }} onClick={() => openModal('invite')}>+ Invite</button>
            </div>
          </div>
          {/* Tabs */}
          <div className="tab-nav" style={{ maxWidth:360 }}>
            {['board', 'members', 'activity'].map(tb => (
              <button key={tb} className={`tab-item ${tab===tb?'active':''}`} onClick={() => setTab(tb)}>
                {tb==='board' ? '📋 Board' : tb==='members' ? `👥 Members (${data.members.length})` : '⚡ Activity'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'20px 24px' }}>

        {/* BOARD TAB */}
        {tab==='board' && (
          <>
            {/* Project bar */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>Projects:</span>
              {data.projects.map(p => (
                <button key={p.id} onClick={() => { setActiveProj(p); loadTasks(p.id) }}
                  style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, background:activeProj?.id===p.id?'#3366ff':'var(--bg3)', color:activeProj?.id===p.id?'#fff':'var(--text)', border:`1px solid ${activeProj?.id===p.id?'#3366ff':'var(--border)'}`, cursor:'pointer', transition:'var(--transition)' }}>
                  📁 {p.name}
                </button>
              ))}
              <button onClick={() => openModal('project')} style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, background:'transparent', color:'#3366ff', border:'1px dashed #3366ff', cursor:'pointer' }}>
                + New Project
              </button>
              {activeProj && (
                <div style={{ marginLeft:'auto', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                  {/* Filters */}
                  <select value={filter.status} onChange={e => setFilter(p=>({...p,status:e.target.value}))} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 10px', fontSize:12, color:'var(--text2)', outline:'none' }}>
                    <option value="">All status</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <select value={filter.priority} onChange={e => setFilter(p=>({...p,priority:e.target.value}))} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 10px', fontSize:12, color:'var(--text2)', outline:'none' }}>
                    <option value="">All priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button className="btn btn-danger" style={{ padding:'6px 12px', fontSize:12 }} onClick={handleDeleteProject}>🗑 Delete Project</button>
                  <button className="btn btn-primary" style={{ padding:'7px 16px', fontSize:13 }} onClick={() => openModal('task', { status:'todo', priority:'medium' })}>+ New Task</button>
                </div>
              )}
            </div>

            {/* Kanban */}
            {!activeProj ? (
              <div className="card empty-state">
                <div className="empty-icon">📁</div>
                <div className="empty-title">No projects yet</div>
                <div className="empty-desc">Create a project to start adding tasks</div>
                <button className="btn btn-primary" onClick={() => openModal('project')}>+ New Project</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, alignItems:'start' }}>
                {COLS.map(col => {
                  const colTasks = filteredTasks.filter(tk => tk.status===col.key)
                  return (
                    <div key={col.key} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:col.color, animation:col.key==='in_progress'?'pulse-dot 2s infinite':undefined }} />
                          <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{col.label}</span>
                        </div>
                        <span style={{ fontSize:11, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, padding:'2px 8px', color:'var(--text2)' }}>{colTasks.length}</span>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {colTasks.map(tk => (
                          <div key={tk.id} className="card" style={{ padding:14, borderLeft:`3px solid ${col.color}` }}>
                            <div style={{ fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:6, lineHeight:1.4 }}>{tk.title}</div>
                            {tk.description && <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8, lineHeight:1.5 }}>{tk.description}</div>}
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                              <span className={`badge ${PRI[tk.priority]}`}>{tk.priority}</span>
                              {tk.assignee && <span className="badge badge-gray">👤 {tk.assignee.first_name}</span>}
                              {tk.due_date && <span className="badge badge-gray">📅 {tk.due_date}</span>}
                              {/* Smart Dependency — show if blocked */}
                              {tk.dependencies?.length > 0 && (
                                <span className="badge" style={{ background:'rgba(239,68,68,0.12)', color:'#dc2626', fontWeight:700 }}>
                                  🔒 Blocked ({tk.dependencies.length})
                                </span>
                              )}
                            </div>
                            {tk.progress > 0 && (
                              <div>
                                <div className="progress-track"><div className="progress-fill" style={{ width:`${tk.progress}%` }} /></div>
                                <div style={{ fontSize:10, color:'var(--text2)', marginTop:3 }}>{tk.progress}% done</div>
                              </div>
                            )}
                            <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                              {activeTimer === tk.id ? (
                                <button onClick={() => handlePauseTimer(tk.id)} style={{ background:'rgba(239,68,68,0.1)', color:'#dc2626', border:'none', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, cursor:'pointer' }}>⏸ Pause</button>
                              ) : (
                                <button onClick={() => handleStartTimer(tk.id)} style={{ background:'rgba(51,102,255,0.1)', color:'#3366ff', border:'none', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, cursor:'pointer' }}>▶ Start</button>
                              )}
                              {col.key!=='todo' && <button onClick={() => handleUpdateTask(tk.id,{status:'todo'})} style={{ background:'rgba(100,116,139,0.1)', color:'var(--text2)', border:'none', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, cursor:'pointer' }}>← Todo</button>}
                              {col.key!=='in_progress' && <button onClick={() => handleUpdateTask(tk.id,{status:'in_progress'})} style={{ background:'rgba(245,158,11,0.1)', color:'#d97706', border:'none', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, cursor:'pointer' }}>⟳ Progress</button>}
                              {col.key!=='done' && <button onClick={() => handleUpdateTask(tk.id,{status:'done'})} style={{ background:'rgba(34,197,94,0.1)', color:'#16a34a', border:'none', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, cursor:'pointer' }}>✓ Done</button>}
                              <button onClick={() => handleDeleteTask(tk.id)} style={{ background:'rgba(239,68,68,0.1)', color:'#dc2626', border:'none', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, cursor:'pointer', marginLeft:'auto' }}>🗑</button>
                            </div>
                          </div>
                        ))}
                        {colTasks.length===0 && <div style={{ textAlign:'center', padding:'20px 0', fontSize:12, color:'var(--text3)' }}>No tasks here</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* MEMBERS TAB */}
        {tab==='members' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--text)' }}>Team Members ({data.members.length})</h2>
              <button className="btn btn-primary" style={{ padding:'8px 18px', fontSize:13 }} onClick={() => openModal('invite')}>+ Invite Member</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
              {data.members.map(m => (
                <div key={m.id} className="card" style={{ padding:18, display:'flex', alignItems:'center', gap:14 }}>
                  <div className="avatar" style={{ width:44, height:44, fontSize:14 }}>{m.user.first_name[0]}{m.user.last_name[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{m.user.first_name} {m.user.last_name}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.user.email}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Joined {new Date(m.joined_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                    <span className={`badge ${ROLE_BADGE[m.role]}`}>{m.role}</span>
                    {m.role !== 'owner' && <button onClick={() => handleRemoveMember(m.user.id)} style={{ background:'rgba(239,68,68,0.08)', color:'#dc2626', border:'none', borderRadius:6, padding:'2px 8px', fontSize:10, cursor:'pointer' }}>Remove</button>}
                  </div>
                </div>
              ))}
              {data.members.length===0 && <div className="card empty-state"><div className="empty-icon">👥</div><div className="empty-title">No members yet</div></div>}
            </div>
          </>
        )}

        {/* ACTIVITY TAB */}
        {tab==='activity' && (
          <>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Activity Feed</h2>
            {data.activity.length===0 ? (
              <div className="card empty-state"><div className="empty-icon">⚡</div><div className="empty-title">No activity yet</div><div className="empty-desc">Start creating tasks to see activity</div></div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {data.activity.map(a => (
                  <div key={a.id} className="card" style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
                    <div className="avatar" style={{ width:36, height:36, fontSize:12 }}>{a.actor?.first_name?.[0]}{a.actor?.last_name?.[0]}</div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontWeight:700, color:'var(--text)', fontSize:13 }}>{a.actor?.first_name} </span>
                      <span className={`badge ${a.action==='created'?'badge-green':a.action==='deleted'?'badge-red':'badge-amber'}`}>{a.action}</span>
                      <span style={{ fontSize:13, color:'var(--text2)', marginLeft:6 }}>{a.object_type}: <strong style={{ color:'var(--text)' }}>{a.object_name}</strong></span>
                    </div>
                    <span style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap' }}>{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* TASK MODAL */}
      {modal==='task' && (
        <Modal title="📋 New Task" onClose={closeModal}>
          <form onSubmit={handleCreateTask} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label className="label">Task title *</label>
              <input className="input" placeholder="What needs to be done?" value={form.title||''} onChange={e => setForm({...form, title:e.target.value})} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} style={{ resize:'none' }} value={form.description||''} onChange={e => setForm({...form, description:e.target.value})} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status||'todo'} onChange={e => setForm({...form, status:e.target.value})}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input" value={form.priority||'medium'} onChange={e => setForm({...form, priority:e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Due date</label>
              <input className="input" type="date" value={form.due_date||''} onChange={e => setForm({...form, due_date:e.target.value})} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" className="btn btn-secondary" style={{ flex:1 }} onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button>
            </div>
          </form>
          
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🧠</span> AI Auto Breakdown
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>Describe a large feature and AI will generate the sub-tasks for you.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" style={{ flex: 1, background: 'var(--brand-bg)', color: 'var(--brand)', borderColor: 'var(--brand)' }} placeholder="e.g. Build a payment checkout page..." value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} />
              <button type="button" className="btn btn-primary" onClick={() => { handleAIBreakdown(); closeModal(); }} disabled={aiLoading || !aiPrompt.trim()}>
                {aiLoading ? 'Thinking...' : 'Generate'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PROJECT MODAL */}
      {modal==='project' && (
        <Modal title="📁 New Project" onClose={closeModal}>
          <form onSubmit={handleCreateProject} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label className="label">Project name *</label>
              <input className="input" placeholder="My Amazing Project" value={form.name||''} onChange={e => setForm({...form, name:e.target.value})} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} style={{ resize:'none' }} value={form.description||''} onChange={e => setForm({...form, description:e.target.value})} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" className="btn btn-secondary" style={{ flex:1 }} onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* INVITE MODAL */}
      {modal==='invite' && (
        <Modal title="👥 Invite Member" onClose={closeModal}>
          <form onSubmit={handleInvite} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label className="label">Email address *</label>
              <input className="input" type="email" placeholder="teammate@example.com" value={form.email||''} onChange={e => setForm({...form, email:e.target.value})} required />
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:6 }}>⚠ The user must already have an account</div>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role||'developer'} onChange={e => setForm({...form, role:e.target.value})}>
                <option value="manager">Manager</option>
                <option value="developer">Developer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" className="btn btn-secondary" style={{ flex:1 }} onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? 'Inviting...' : 'Invite'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
