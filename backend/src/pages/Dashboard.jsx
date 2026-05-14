import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ws, timer } from '../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#3366ff','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16']

export default function Dashboard() {
  const { user, theme } = useStore()
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

  const handleCreate = async ev => {
    ev.preventDefault()
    if (!form.name.trim()) return setErrors({ name: 'Required' })
    setSaving(true)
    try {
      const r = await ws.create(form)
      setWorkspaces(p => [...p, r.data.data])
      setShowCreate(false)
      toast.success('Workspace initialized! 🚀')
      navigate(`/workspaces/${r.data.data.id}`)
    } catch { toast.error('Activation failed') } finally { setSaving(false) }
  }

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'100vh', padding:'60px 24px' }}>
      <div className="container" style={{ maxWidth:1200 }}>
        
        {/* Mission Control Header */}
        <div style={{ marginBottom:48, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24 }} className="fade-in">
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
             <div style={{ width:80, height:80, borderRadius:24, overflow:'hidden', border:'4px solid var(--border)', background:'var(--bg2)' }}>
                {user?.avatar ? <img src={user.avatar} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>👤</div>}
             </div>
             <div>
                <h1 style={{ fontSize:36, fontWeight:900, color:'var(--text)', marginBottom:4, letterSpacing:'-0.04em' }}>
                   Command Center: <span className="text-gradient">{user?.first_name}</span>
                </h1>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                   <div className="activity-dot" />
                   <span style={{ fontSize:14, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>System Status: Operational</span>
                </div>
             </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ padding:'16px 32px', borderRadius:16, fontSize:16, fontWeight:800 }}>+ Initialize Workspace</button>
        </div>

        {/* Intelligence Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap:24, marginBottom:48 }}>
          {[
            { icon:'🏢', label:'Active Workspaces', value:workspaces.length, color:'#3366ff' },
            { icon:'👥', label:'Global Members', value:workspaces.reduce((a,w) => a+(w.member_count||0), 0), color:'#8b5cf6' },
            { icon:'⚡', label:'Workflows Active', value:timeLogs.length, color:'#10b981' },
            { icon:'🛡️', label:'Security Level', value:'Tier 1', color:'#f59e0b' },
          ].map(s => (
            <div key={s.label} className="card glass" style={{ padding:32, borderTop:`4px solid ${s.color}` }}>
              <div style={{ fontSize:13, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:1.5, marginBottom:16 }}>{s.label}</div>
              <div style={{ fontSize:40, fontWeight:900, color:'var(--text)', lineHeight:1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Analytics & Pulse */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 24, marginBottom: 48 }}>
          <div className="card glass" style={{ padding: 40 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 32 }}>Recent Activity Pulse</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {timeLogs.length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--text3)', fontStyle:'italic' }}>Waiting for system telemetry...</div>}
              {timeLogs.slice(0, 4).map((log, i) => {
                const hrs = (log.duration_seconds / 3600).toFixed(1)
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{log.task_title}</span>
                      <span style={{ color: 'var(--brand)', fontWeight:800 }}>{hrs}h</span>
                    </div>
                    <div style={{ height:6, background: 'var(--bg2)', borderRadius:10, overflow:'hidden' }}>
                      <div className="progress-fill" style={{ height:'100%', width: `${Math.min((hrs/8)*100, 100)}%`, background: `linear-gradient(90deg, ${COLORS[i%COLORS.length]}, transparent)` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="card glass" style={{ padding: 40, display: 'flex', alignItems: 'center', gap:40 }}>
             <div style={{ position: 'relative', width: 160, height: 160, borderRadius: '50%', background: `conic-gradient(var(--brand) ${Math.min(timeLogs.length*12, 100)}%, var(--border) 0)`, flexShrink:0 }}>
                <div style={{ position: 'absolute', inset: 12, background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow:'inset 0 0 20px rgba(0,0,0,0.3)' }}>
                   <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)' }}>{timeLogs.length}</span>
                   <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight:800 }}>EVENTS</span>
                </div>
             </div>
             <div>
                <h4 style={{ fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:12 }}>Productivity Index</h4>
                <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6 }}>System performance is currently at peak capacity. Global synchronization is stable.</p>
             </div>
          </div>
        </div>

        {/* Workspaces Deployment */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
           <h2 style={{ fontSize:24, fontWeight:900, color:'var(--text)', letterSpacing:'-0.02em' }}>Deployed Workspaces</h2>
           <div style={{ fontSize:12, fontWeight:800, color:'var(--text3)' }}>{workspaces.length} ACTIVE CLUSTERS</div>
        </div>
        
        {loading ? (
          <div className="grid-responsive">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:200, borderRadius:24 }} />)}
          </div>
        ) : (
          <div className="grid-responsive">
            {workspaces.map((w, i) => (
              <div key={w.id} className="card glass scale-on-hover" onClick={() => navigate(`/workspaces/${w.id}`)}
                style={{ padding:40, cursor:'pointer', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:4, background:COLORS[i%COLORS.length] }} />
                <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
                  <div style={{ width:56, height:56, borderRadius:16, background:`${COLORS[i%COLORS.length]}15`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:COLORS[i%COLORS.length], fontSize:24 }}>{w.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:18, color:'var(--text)' }}>{w.name}</div>
                    <div style={{ fontSize:12, color:'var(--brand)', fontWeight:700 }}>{w.member_count} NODE{w.member_count!==1?'S':''} CONNECTED</div>
                  </div>
                </div>
                <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24, lineHeight:1.6, height:44, overflow:'hidden' }}>{w.description || 'No cluster description provided.'}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)', paddingTop:20 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:'var(--text3)' }}>ACTIVE SINCE {new Date(w.created_at).getFullYear()}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'var(--text)' }}>
                     <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981' }} /> ONLINE
                  </div>
                </div>
              </div>
            ))}
            
            {/* Create Card */}
            <div className="card glass scale-on-hover" onClick={() => setShowCreate(true)} style={{ padding:40, cursor:'pointer', border:'2px dashed var(--border)', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, minHeight:200 }}>
               <div style={{ fontSize:40 }}>➕</div>
               <div style={{ fontWeight:800, color:'var(--text3)' }}>NEW WORKSPACE</div>
            </div>
          </div>
        )}
      </div>

      {/* Initialize Modal */}
      {showCreate && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setShowCreate(false)} style={{ backdropFilter:'blur(40px)' }}>
          <div className="card glass fade-in" style={{ width:'100%', maxWidth:500, padding:48 }}>
            <h3 style={{ fontSize:28, fontWeight:900, color:'var(--text)', marginBottom:32, letterSpacing:'-0.03em' }}>Initialize Workspace</h3>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <div>
                <label className="label" style={{ fontWeight:800, color:'var(--text3)', fontSize:12 }}>WORKSPACE IDENTITY</label>
                <input className={`input ${errors.name?'error':''}`} placeholder="Enter workspace name..." value={form.name} onChange={e => { setForm({...form, name:e.target.value}); setErrors({}) }} style={{ padding:18, borderRadius:16, fontSize:16 }} />
              </div>
              <div>
                <label className="label" style={{ fontWeight:800, color:'var(--text3)', fontSize:12 }}>MISSION OBJECTIVE</label>
                <textarea className="input" rows={3} placeholder="Define workspace goals..." value={form.description} onChange={e => setForm({...form, description:e.target.value})} style={{ resize:'none', padding:18, borderRadius:16, fontSize:16 }} />
              </div>
              <div style={{ display:'flex', gap:16, marginTop:8 }}>
                <button type="button" className="btn btn-secondary" style={{ flex:1, padding:16, borderRadius:16 }} onClick={() => setShowCreate(false)}>Abort</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1, padding:16, borderRadius:16, fontWeight:800 }} disabled={saving}>{saving ? 'Activating...' : 'Activate Node ➜'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
