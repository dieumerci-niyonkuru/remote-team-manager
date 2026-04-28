import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws } from '../services/api'
import api from '../services/api'

export default function Performance() {
  const { theme, user } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ws.list().then(async r => {
      setWorkspaces(r.data.data)
      if (r.data.data.length) {
        setActiveWs(r.data.data[0])
        await loadStats(r.data.data[0].id)
      }
      setLoading(false)
    })
  }, [])

  const loadStats = async wid => {
    try {
      const [members, projects] = await Promise.all([
        api.get(`/workspaces/${wid}/members/`),
        api.get(`/workspaces/${wid}/projects/`),
      ])
      setStats({ members: members.data.data, projects: projects.data.data })
    } catch { setStats({ members:[], projects:[] }) }
  }

  const METRICS = [
    { icon:'📋', label:'Total Projects', value: stats?.projects?.length || 0, color:'#3366ff', trend:'+2 this month' },
    { icon:'👥', label:'Team Members', value: stats?.members?.length || 0, color:'#8b5cf6', trend:'Active' },
    { icon:'✅', label:'Completion Rate', value: '—', color:'#22c55e', trend:'Based on tasks' },
    { icon:'⏱️', label:'Avg Response Time', value: '< 2h', color:'#f59e0b', trend:'Last 7 days' },
  ]

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)', padding:'32px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:4 }}>📊 Performance</h1>
            <p style={{ color:'var(--text2)', fontSize:14 }}>Track team productivity without micromanaging</p>
          </div>
          <select value={activeWs?.id||''} onChange={e => { const w=workspaces.find(x=>x.id===e.target.value); setActiveWs(w); loadStats(w.id) }}
            style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--text)', outline:'none' }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        {/* Metric cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14, marginBottom:28 }}>
          {METRICS.map(m => (
            <div key={m.label} className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${m.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{m.icon}</div>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:'var(--text)' }}>{m.value}</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{m.label}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:'#22c55e' }}>↑ {m.trend}</div>
            </div>
          ))}
        </div>

        {/* Team overview */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <div className="card" style={{ padding:24 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:16 }}>👥 Team Overview</h3>
            {stats?.members?.length===0 ? (
              <div style={{ textAlign:'center', padding:20, color:'var(--text3)', fontSize:13 }}>No team members yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {stats?.members?.slice(0,6).map(m => (
                  <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                      {m.user.first_name[0]}{m.user.last_name[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{m.user.first_name} {m.user.last_name}</div>
                      <div style={{ fontSize:11, color:'var(--text2)' }}>{m.role}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }} />
                      <span style={{ fontSize:11, color:'var(--text3)' }}>Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card" style={{ padding:24 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:16 }}>📁 Projects Status</h3>
            {stats?.projects?.length===0 ? (
              <div style={{ textAlign:'center', padding:20, color:'var(--text3)', fontSize:13 }}>No projects yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {stats?.projects?.slice(0,6).map(p => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:4 }}>{p.name}</div>
                      <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                        <div style={{ width:'60%', height:'100%', background:'#3366ff', borderRadius:2 }} />
                      </div>
                    </div>
                    <span className={`badge ${p.status==='active'?'badge-green':p.status==='completed'?'badge-blue':'badge-gray'}`} style={{ fontSize:10 }}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coming soon features */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:16 }}>🚀 Advanced Analytics — Coming Soon</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:10 }}>
            {['Task completion trends','Time tracking reports','Individual OKRs','Burndown charts','Velocity metrics','Sprint analytics'].map(f => (
              <div key={f} style={{ padding:'10px 14px', background:'var(--bg2)', borderRadius:10, fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'#3366ff' }}>◎</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
