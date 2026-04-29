import { useState } from 'react'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>🔔</button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 30, width: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
          No new notifications
        </div>
      )}
    </div>
  )
}
