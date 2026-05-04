import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TYPES = {
  task_done:    { icon: '✅', color: '#10b981', label: 'Task Completed' },
  task_created: { icon: '📋', color: '#3366ff', label: 'New Task' },
  mention:      { icon: '@',  color: '#8b5cf6', label: 'Mention' },
  deadline:     { icon: '⏰', color: '#f59e0b', label: 'Deadline Alert' },
  ai_insight:   { icon: '🧠', color: '#ec4899', label: 'AI Insight' },
  invite:       { icon: '👥', color: '#06b6d4', label: 'Team Invite' },
}

// Mock notifications — in production, fetch from /api/notifications/
const MOCK = [
  { id:1, type:'ai_insight', title:'Burnout Risk Detected', body:'Sarah has completed 9 tasks today — consider redistributing workload.', time:'2 min ago', read:false, priority:'high', url:'/ai' },
  { id:2, type:'deadline', title:'Deadline in 2 hours', body:'"Finalize API Design" is due at 5:00 PM today.', time:'10 min ago', read:false, priority:'high', url:'/calendar' },
  { id:3, type:'task_done', title:'Task Completed', body:'Alex marked "Setup CI/CD Pipeline" as Done.', time:'1 hr ago', read:false, priority:'medium', url:'/dashboard' },
  { id:4, type:'mention', title:'You were mentioned', body:'John mentioned you in #engineering: "@you can you review the PR?"', time:'2 hrs ago', read:false, priority:'medium', url:'/chat' },
  { id:5, type:'task_created', title:'New Task Assigned', body:'You have been assigned "Write unit tests for auth".', time:'3 hrs ago', read:true, priority:'low', url:'/dashboard' },
  { id:6, type:'invite', title:'Workspace Invitation', body:'You have been invited to join "Design Team" workspace.', time:'5 hrs ago', read:true, priority:'low', url:'/workspaces' },
  { id:7, type:'ai_insight', title:'Project At Risk', body:'AI predicts "Mobile App" project will be delayed by 3 days based on current velocity.', time:'1 day ago', read:true, priority:'high', url:'/ai' },
]

export default function Notifications() {
  const { theme } = useStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(MOCK)
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'high'

  const unreadCount = notifications.filter(n => !n.read).length

  const handleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))
  }

  const handleReadAll = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})))
  }

  const handleClick = (n) => {
    handleRead(n.id)
    navigate(n.url)
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'high') return n.priority === 'high'
    return true
  })

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12 }}>
              🔔 Notifications
              {unreadCount > 0 && <span style={{ background: '#dc2626', color: '#fff', borderRadius: 50, padding: '2px 10px', fontSize: 13, fontWeight: 700 }}>{unreadCount}</span>}
            </h1>
            <p style={{ color: 'var(--text2)', marginTop: 4 }}>Priority-filtered alerts from across your workspaces.</p>
          </div>
          {unreadCount > 0 && <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={handleReadAll}>Mark all as read</button>}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['all','All'], ['unread','Unread'], ['high','🔴 High Priority']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid', borderColor: filter === val ? 'var(--brand)' : 'var(--border)', background: filter === val ? 'var(--brand-bg)' : 'transparent', color: filter === val ? 'var(--brand)' : 'var(--text2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'var(--transition)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div className="card empty-state">
              <div className="empty-icon">🔔</div>
              <div className="empty-title">All caught up!</div>
              <div className="empty-desc">No notifications matching this filter.</div>
            </div>
          )}
          {filtered.map(n => {
            const meta = TYPES[n.type] || TYPES.task_created
            return (
              <div key={n.id} onClick={() => handleClick(n)}
                className="card card-hover"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  gap: 16,
                  cursor: 'pointer',
                  opacity: n.read ? 0.7 : 1,
                  borderLeft: !n.read ? `3px solid ${meta.color}` : '3px solid transparent',
                  background: !n.read ? `${meta.color}08` : 'var(--bg-card)',
                  transition: 'var(--transition)',
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, fontWeight: 800 }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{n.title}</span>
                    {n.priority === 'high' && <span style={{ background: '#dc2626', color: '#fff', borderRadius: 50, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>HIGH</span>}
                    {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, marginLeft: 'auto', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 4 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', gap: 8 }}>
                    <span>{meta.label}</span>
                    <span>·</span>
                    <span>{n.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
