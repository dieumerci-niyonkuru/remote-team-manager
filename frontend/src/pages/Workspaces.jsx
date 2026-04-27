import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws } from '../services/api'

export default function Workspaces() {
  const { theme } = useStore()
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ws.list().then(r => { setWorkspaces(r.data.data); setLoading(false) })
  }, [])

  const COLORS = ['#3366ff','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444']

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)', padding:'32px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:4 }}>🏢 Workspaces</h1>
            <p style={{ color:'var(--text2)', fontSize:14 }}>All your workspaces in one place</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>+ New Workspace</button>
        </div>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:160, borderRadius:14 }} />)}
          </div>
        ) : workspaces.length===0 ? (
          <div className="card empty-state">
            <div className="empty-icon">🏢</div>
            <div className="empty-title">No workspaces yet</div>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Create First Workspace</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
            {workspaces.map((w,i) => (
              <div key={w.id} className="card card-hover" onClick={() => navigate(`/workspaces/${w.id}`)} style={{ padding:24, cursor:'pointer', borderTop:`3px solid ${COLORS[i%COLORS.length]}` }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:`${COLORS[i%COLORS.length]}18`, display:'flex', alignItems:'center', justifyContent:'center', color:COLORS[i%COLORS.length], fontFamily:'var(--font-display)', fontWeight:800, fontSize:18 }}>{w.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{w.name}</div>
                    <div style={{ fontSize:12, color:'var(--text2)' }}>{w.member_count} members</div>
                  </div>
                </div>
                {w.description && <p style={{ fontSize:13, color:'var(--text2)', marginBottom:12, lineHeight:1.5 }}>{w.description}</p>}
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span className="badge badge-blue">👤 {w.owner?.first_name}</span>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{new Date(w.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
