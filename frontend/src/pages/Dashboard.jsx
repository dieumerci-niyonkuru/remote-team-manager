import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { ws } from '../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export default function Dashboard() {
  const { user, lang, theme } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const location = useLocation()
  const searchQuery = new URLSearchParams(location.search).get('search') || ''
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await ws.list()
        setWorkspaces(response.data.data || [])
      } catch (err) {
        console.error('Workspace fetch error:', err)
        const msg = err.response?.data?.message || err.message || 'Failed to load workspaces'
        setError(msg)
        toast.error(msg)
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchWorkspaces()
  }, [navigate])

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error(t.required)
      return
    }
    setSaving(true)
    try {
      const response = await ws.create(form)
      const newWorkspace = response.data.data
      setWorkspaces([...workspaces, newWorkspace])
      setShowCreate(false)
      setForm({ name: '', description: '' })
      toast.success('Workspace created! 🎉')
      navigate(`/workspaces/${newWorkspace.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workspace')
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { icon: '🏢', label: t.statsWorkspaces, value: workspaces.length, color: COLORS[0] },
    { icon: '👥', label: t.statsMembers, value: workspaces.reduce((a, w) => a + (w.member_count || 0), 0), color: COLORS[1] },
    { icon: '📁', label: 'Projects', value: '—', color: COLORS[2] },
    { icon: '✅', label: 'Tasks', value: '—', color: COLORS[3] },
  ]

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)', padding: '2rem 1rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1>Good day, {user?.first_name}! 👋</h1>
            <p style={{ color: 'var(--text2)' }}>Here's what's happening with your workspaces.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t.createWs}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <h2>Your Workspaces</h2>
        {loading && <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading workspaces...</div>}
        {error && !loading && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' }}>
            <p>❌ {error}</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Please check your connection or try logging out and back in.</p>
            <button className="btn btn-secondary mt-3" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No workspaces yet. Create your first workspace!</p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((w, i) => (
              <div key={w.id} className="card card-hover" onClick={() => navigate(`/workspaces/${w.id}`)} style={{ padding: '1.25rem', cursor: 'pointer', borderTop: `3px solid ${COLORS[i % COLORS.length]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: `${COLORS[i % COLORS.length]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: COLORS[i % COLORS.length] }}>{w.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{w.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{w.member_count} member{w.member_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {w.description && <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>{w.description}</p>}
                <span className="badge badge-brand">👤 {w.owner?.first_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-content">
            <h3>Create Workspace</h3>
            <input className="input" placeholder="Workspace name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <textarea className="input-textarea" placeholder="Description" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
