import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { ws } from '../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#4f46e5','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16']

export default function Dashboard() {
  const { user, lang, theme } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const location = useLocation()
  const searchQuery = new URLSearchParams(location.search).get('search') || ''
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await ws.list()
        setWorkspaces(res.data.data)
      } catch (err) {
        toast.error('Failed to load workspaces')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkspaces()
  }, [])

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = t.required
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const res = await ws.create(form)
      setWorkspaces([...workspaces, res.data.data])
      setShowCreate(false)
      setForm({ name: '', description: '' })
      toast.success('Workspace created! 🎉')
      navigate(`/workspaces/${res.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workspace')
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { icon: '🏢', label: t.statsWorkspaces, value: workspaces.length, color: COLORS[0] },
    { icon: '👥', label: t.statsMembers, value: workspaces.reduce((a,w) => a + (w.member_count || 0), 0), color: COLORS[1] },
    { icon: '📁', label: t.statsProjects, value: '—', color: COLORS[2] },
    { icon: '✅', label: t.statsTasks, value: '—', color: COLORS[3] },
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <h2>Your Workspaces</h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: '0.75rem' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem' }}>🏢</div>
            <h3>{t.noWorkspaces}</h3>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ {t.createWs}</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((w, i) => (
              <div key={w.id} className="card card-hover" onClick={() => navigate(`/workspaces/${w.id}`)} style={{ padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: `${COLORS[i % COLORS.length]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: COLORS[i % COLORS.length] }}>{w.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{w.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{w.member_count} member{w.member_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {w.description && <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>{w.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-brand">👤 {w.owner?.first_name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{new Date(w.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-content">
            <h3>🏢 {t.createWs}</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">{t.wsName} *</label>
                <input className={`input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({}) }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">{t.wsDesc}</label>
                <textarea className="input-textarea" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? t.saving : t.create}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
