import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ws } from '../services/api'

const ROLE_BADGE = { owner:'badge-purple', manager:'badge-blue', developer:'badge-green', viewer:'badge-gray' }

export default function Team() {
  const { theme } = useStore()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ws.list().then(async r => {
      const all = r.data.data
      const withMembers = await Promise.all(all.map(async w => {
        const m = await ws.members(w.id).then(r => r.data.data).catch(() => [])
        return { ...w, memberList: m }
      }))
      setData(withMembers)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)', padding:'32px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:8 }}>👥 Team</h1>
        <p style={{ color:'var(--text2)', fontSize:14, marginBottom:28 }}>All members across your workspaces</p>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:200, borderRadius:14 }} />)}
          </div>
        ) : data.length===0 ? (
          <div className="card empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">No workspaces yet</div>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {data.map(w => (
              <div key={w.id} className="card" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => navigate(`/workspaces/${w.id}`)}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14 }}>{w.name[0]}</div>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text)' }}>{w.name}</div>
                    <div style={{ fontSize:12, color:'var(--text2)' }}>{w.memberList.length} members</div>
                  </div>
                </div>
                <div style={{ padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12 }}>
                  {w.memberList.map(m => (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--bg2)', borderRadius:10 }}>
                      <div className="avatar" style={{ width:36, height:36, fontSize:12 }}>{m.user.first_name[0]}{m.user.last_name[0]}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{m.user.first_name} {m.user.last_name}</div>
                        <div style={{ fontSize:11, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.user.email}</div>
                      </div>
                      <span className={`badge ${ROLE_BADGE[m.role]}`} style={{ fontSize:10 }}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
