import { useState, useEffect } from 'react'
import { notifications } from '../../services/api'
export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [list, setList] = useState([])
  const fetchUnread = async () => { try { const res = await notifications.countUnread(); setUnread(res.data.data?.count || 0) } catch {} }
  const fetchList = async () => { try { const res = await notifications.list(); setList(res.data.data || []) } catch {} }
  useEffect(() => { fetchUnread(); fetchList(); const interval = setInterval(fetchUnread, 30000); return () => clearInterval(interval) }, [])
  const markRead = async (id) => { try { await notifications.markRead(id); fetchUnread(); fetchList() } catch {} }
  return <div style={{ position: 'relative' }}>
    <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', position: 'relative' }}>🔔{unread > 0 && <span style={{ position: 'absolute', top: -5, right: -8, background: '#ef4444', color: 'white', borderRadius: '50%', padding: '0 5px', fontSize: '10px' }}>{unread}</span>}</button>
    {open && <div style={{ position: 'absolute', right: 0, top: 30, width: 260, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 200, maxHeight: 300, overflowY: 'auto' }}>
      <div style={{ padding: '6px 10px', fontWeight: 'bold', borderBottom: '1px solid var(--border)' }}>Notifications</div>
      {list.length === 0 && <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text2)' }}>None</div>}
      {list.map(n => <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'rgba(51,102,255,0.1)', cursor: 'pointer' }}>
        <div style={{ fontSize: 12 }}>{n.verb}: {n.target_ct}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{new Date(n.created_at).toLocaleString()}</div>
      </div>)}
    </div>}
  </div>
}
