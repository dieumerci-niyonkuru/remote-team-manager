import { useState, useEffect } from 'react'
import { useStore } from '../store'
import api from '../services/api'
import toast from 'react-hot-toast'

const EVENT_TYPES = {
  task_created: { icon: '📋', color: '#3366ff', label: 'Task Created' },
  task_updated: { icon: '🔄', color: '#f59e0b', label: 'Task Updated' },
  task_completed: { icon: '✅', color: '#10b981', label: 'Task Completed' },
  message_sent: { icon: '💬', color: '#8b5cf6', label: 'Message Sent' },
  file_uploaded: { icon: '📁', color: '#06b6d4', label: 'File Uploaded' },
  member_joined: { icon: '👥', color: '#ec4899', label: 'Member Joined' },
}

// Mock activity data - in production, this comes from /api/activity/
const MOCK_ACTIVITY = [
  { id: 1, type: 'task_completed', user: 'Sarah Connor', detail: 'Marked "Build login system" as Done', time: '2 mins ago' },
  { id: 2, type: 'message_sent', user: 'John Doe', detail: 'Sent a message in #engineering', time: '10 mins ago' },
  { id: 3, type: 'task_created', user: 'Alex Murphy', detail: 'Created task "Setup database migrations"', time: '45 mins ago' },
  { id: 4, type: 'file_uploaded', user: 'James Bond', detail: 'Uploaded "Q3_Report.pdf" (v2)', time: '1 hr ago' },
  { id: 5, type: 'task_updated', user: 'Sarah Connor', detail: 'Changed priority of "API Documentation" to High', time: '3 hrs ago' },
  { id: 6, type: 'member_joined', user: 'Ellen Ripley', detail: 'Joined the workspace', time: '5 hrs ago' },
  { id: 7, type: 'task_completed', user: 'John Doe', detail: 'Marked "Setup CI/CD" as Done', time: '1 day ago' },
]

export default function Activity() {
  const { theme } = useStore()
  const [activities, setActivities] = useState(MOCK_ACTIVITY)
  const [loading, setLoading] = useState(false)

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Activity Timeline</h1>
            <p style={{ color: 'var(--text2)', marginTop: 4 }}>Real-time feed of everything happening in your workspace.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => toast.success('Feed refreshed')}>Refresh Feed</button>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'var(--border)', zIndex: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', zIndex: 1 }}>
            {activities.map((act) => {
              const meta = EVENT_TYPES[act.type] || EVENT_TYPES.task_updated
              return (
                <div key={act.id} style={{ display: 'flex', gap: 20 }}>
                  <div style={{ 
                    width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-card)', border: `2px solid ${meta.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                    boxShadow: '0 0 15px ' + meta.color + '33'
                  }}>
                    {meta.icon}
                  </div>
                  <div className="card" style={{ flex: 1, padding: '16px 20px', background: 'var(--bg-card)', borderLeft: `4px solid ${meta.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{act.user}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{act.time}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>
                      {act.detail}
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>{meta.label}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn btn-ghost" style={{ color: 'var(--text3)' }}>Load older activity...</button>
        </div>
      </div>
    </div>
  )
}
