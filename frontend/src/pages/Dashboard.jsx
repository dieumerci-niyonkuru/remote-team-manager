import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspaceApi } from '../services/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newWs, setNewWs] = useState({ name: '', description: '' })
  const navigate = useNavigate()

  useEffect(() => {
    workspaceApi.list().then(res => {
      setWorkspaces(res.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleCreate = async e => {
    e.preventDefault()
    try {
      const res = await workspaceApi.create(newWs)
      setWorkspaces([...workspaces, res.data.data])
      setShowCreate(false)
      setNewWs({ name: '', description: '' })
      toast.success('Workspace created! 🎉')
    } catch { toast.error('Failed to create workspace') }
  }

  const colors = ['#3366ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div style={{ padding: 32, animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
          Good day, {user?.first_name}! 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Here's what's happening with your workspaces.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Workspaces', value: workspaces.length, icon: '🏢', color: '#3366ff' },
          { label: 'Total Members', value: workspaces.reduce((a, w) => a + (w.member_count || 0), 0), icon: '👥', color: '#8b5cf6' },
          { label: 'Projects', value: '—', icon: '📁', color: '#10b981' },
          { label: 'Active Tasks', value: '—', icon: '✅', color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{stat.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Workspaces */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Your Workspaces</h2>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ padding: '8px 16px', fontSize: 13 }}>+ New Workspace</button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />)}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: 8 }}>No workspaces yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Create your first workspace to get started</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Workspace</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {workspaces.map((ws, i) => (
            <div key={ws.id} className="card" onClick={() => navigate(`/workspaces/${ws.id}`)}
              style={{ cursor: 'pointer', transition: 'var(--transition)', borderTop: `3px solid ${colors[i % colors.length]}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: colors[i % colors.length] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: colors[i % colors.length], fontSize: 16 }}>
                  {ws.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{ws.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ws.member_count} member{ws.member_count !== 1 ? 's' : ''}</div>
                </div>
              </div>
              {ws.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{ws.description}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-blue">Owner: {ws.owner?.first_name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(ws.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card animate-fade" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Create Workspace</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Workspace name *</label>
                <input value={newWs.name} onChange={e => setNewWs({...newWs, name: e.target.value})} placeholder="My Team Workspace" required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={newWs.description} onChange={e => setNewWs({...newWs, description: e.target.value})} placeholder="What is this workspace for?" rows={3} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
