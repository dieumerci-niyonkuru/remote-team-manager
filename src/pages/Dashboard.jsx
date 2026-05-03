import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { ws, timer } from '../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#3366ff','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16']

export default function Dashboard() {
  const { user, lang, theme } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState([])
  const [timeLogs, setTimeLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', description:'' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([ws.list(), timer.logs()])
      .then(([wRes, tRes]) => { 
        setWorkspaces(wRes.data.data || wRes.data)
        setTimeLogs(tRes.data || [])
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = t.required
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleCreate = async ev => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const r = await ws.create(form)
      setWorkspaces(p => [...p, r.data.data])
      setShowCreate(false)
      setForm({ name:'', description:'' })
      toast.success('Workspace created! 🎉')
      navigate(`/workspaces/${r.data.data.id}`)
    } catch { toast.error('Failed to create workspace') } finally { setSaving(false) }
  }

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)', padding:'32px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom:32, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }} className="fade-in">
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,3vw,32px)', fontWeight:800, color:'var(--text)', marginBottom:6 }}>
              Good day, {user?.first_name}! 👋
            </h1>
            <p style={{ color:'var(--text2)', fontSize:15 }}>Here's what's happening with your workspaces.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t.createWs}</button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:14, marginBottom:32 }}>
          {[
            { icon:'🏢', label:'Workspaces', value:workspaces.length, color:'#3366ff' },
            { icon:'👥', label:'Total Members', value:workspaces.reduce((a,w) => a+(w.member_count||0), 0), color:'#8b5cf6' },
            { icon:'📁', label:'Projects', value:'—', color:'#10b981' },
            { icon:'✅', label:'Tasks', value:'—', color:'#f59e0b' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:'var(--text)' }}>{s.value}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Productivity Analytics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', marginBottom: 16 }}>Time Logged per Task</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {timeLogs.length === 0 && <div style={{ fontSize: 13, color: 'var(--text3)' }}>No time logged yet.</div>}
              {timeLogs.slice(0, 5).map((log, i) => {
                const hrs = (log.duration_seconds / 3600).toFixed(1)
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{log.task_title}</span>
                      <span style={{ color: 'var(--text2)' }}>{hrs}h</span>
                    </div>
                    <div className="progress-track" style={{ background: 'var(--border2)' }}>
                      <div className="progress-fill" style={{ width: `${Math.min((hrs/8)*100, 100)}%`, background: COLORS[i%COLORS.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(var(--brand) ${Math.min(timeLogs.length*10, 100)}%, var(--border2) 0)` }}>
              <div style={{ position: 'absolute', inset: 12, background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{timeLogs.length}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>Tasks Logged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces grid */}
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Your Workspaces</h2>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:160, borderRadius:14 }} />)}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">🏢</div>
            <div className="empty-title">No workspaces yet</div>
            <div className="empty-desc">Create your first workspace to start collaborating with your team</div>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t.createWs}</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
            {workspaces.map((w, i) => (
              <div key={w.id} className="card card-hover" onClick={() => navigate(`/workspaces/${w.id}`)}
                style={{ padding:24, cursor:'pointer', borderTop:`3px solid ${COLORS[i%COLORS.length]}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:`${COLORS[i%COLORS.length]}18`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, color:COLORS[i%COLORS.length], fontSize:18 }}>{w.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{w.name}</div>
                    <div style={{ fontSize:12, color:'var(--text2)' }}>{w.member_count} member{w.member_count!==1?'s':''}</div>
                  </div>
                </div>
                {w.description && <p style={{ fontSize:13, color:'var(--text2)', marginBottom:12, lineHeight:1.5 }}>{w.description}</p>}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span className="badge badge-blue">👤 {w.owner?.first_name}</span>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{new Date(w.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setShowCreate(false)}>
          <div className="card scale-in" style={{ width:'100%', maxWidth:440, padding:36 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:24 }}>🏢 {t.createWs}</h3>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label className="label">{t.wsName} *</label>
                <input className={`input ${errors.name?'error':''}`} placeholder="My Team Workspace" value={form.name} onChange={e => { setForm({...form, name:e.target.value}); setErrors({}) }} />
                {errors.name && <div className="error-msg">⚠ {errors.name}</div>}
              </div>
              <div>
                <label className="label">{t.wsDesc}</label>
                <textarea className="input" rows={3} placeholder="What is this workspace for?" value={form.description} onChange={e => setForm({...form, description:e.target.value})} style={{ resize:'none' }} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex:1 }} onClick={() => setShowCreate(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? t.saving : t.create}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
