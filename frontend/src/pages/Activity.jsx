import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws } from '../services/api'

export default function Activity() {
  const { theme } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ws.list().then(async r => {
      const all = r.data.data
      setWorkspaces(all)
      const acts = await Promise.all(all.map(w => ws.activity(w.id).then(a => a.data.data).catch(() => [])))
      setActivities(acts.flat().sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const ACTION_COLOR = { created:'badge-green', updated:'badge-amber', deleted:'badge-red' }

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)', padding:'32px 24px' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:8 }}>⚡ Activity Feed</h1>
        <p style={{ color:'var(--text2)', fontSize:14, marginBottom:28 }}>All actions across your workspaces</p>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:64, borderRadius:12 }} />)}
          </div>
        ) : activities.length===0 ? (
          <div className="card empty-state">
            <div className="empty-icon">⚡</div>
            <div className="empty-title">No activity yet</div>
            <div className="empty-desc">Start working in your workspaces to see activity here</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {activities.map(a => (
              <div key={a.id} className="card fade-in" style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
                <div className="avatar" style={{ width:38, height:38, fontSize:13 }}>{a.actor?.first_name?.[0]}{a.actor?.last_name?.[0]}</div>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:'var(--text)' }}>{a.actor?.first_name} {a.actor?.last_name} </span>
                  <span className={`badge ${ACTION_COLOR[a.action]||'badge-gray'}`}>{a.action}</span>
                  <span style={{ fontSize:13, color:'var(--text2)', marginLeft:6 }}>{a.object_type}: <strong style={{ color:'var(--text)' }}>{a.object_name}</strong></span>
                </div>
                <span style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap' }}>{new Date(a.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
