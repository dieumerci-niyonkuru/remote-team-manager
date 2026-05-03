import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { wiki, ws } from '../services/api'
import toast from 'react-hot-toast'

export default function Wiki() {
  const { theme } = useStore()
  const [articles, setArticles] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('list') // 'list' | 'view' | 'edit'
  const [searchQ, setSearchQ] = useState('')
  const [form, setForm] = useState({ title: '', content: '', category: '', workspace: '' })

  useEffect(() => {
    Promise.all([wiki.list(), ws.list()])
      .then(([aRes, wRes]) => {
        setArticles(aRes.data)
        setWorkspaces(wRes.data.data || wRes.data)
      })
      .catch(() => toast.error('Failed to load wiki'))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      const res = await wiki.list(searchQ)
      setArticles(res.data)
    } catch { toast.error('Search failed') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.workspace) { toast.error('Select a workspace'); return }
    try {
      if (selected) {
        const res = await wiki.update(selected.id, form)
        setArticles(prev => prev.map(a => a.id === selected.id ? res.data : a))
        setSelected(res.data)
        toast.success('Article updated!')
      } else {
        const res = await wiki.create(form)
        setArticles(prev => [res.data, ...prev])
        setSelected(res.data)
        toast.success('Article created!')
      }
      setMode('view')
    } catch { toast.error('Failed to save article') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return
    try {
      await wiki.delete(id)
      setArticles(prev => prev.filter(a => a.id !== id))
      setMode('list')
      setSelected(null)
      toast.success('Article deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <div style={{ width: 280, borderRight: '1px solid var(--border)', padding: '24px 16px', background: 'var(--bg-card)', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>📚</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Knowledge Base</h2>
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <input className="input" style={{ flex: 1, padding: '8px 12px', fontSize: 12 }} placeholder="Search articles..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 10px', fontSize: 12 }}>🔍</button>
          </form>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16, fontSize: 13 }} onClick={() => { setSelected(null); setForm({ title: '', content: '', category: '', workspace: workspaces[0]?.id || '' }); setMode('edit') }}>
            + New Article
          </button>
          {loading ? (
            <div className="skeleton" style={{ height: 40, borderRadius: 8 }} />
          ) : articles.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>No articles yet</div>
          ) : articles.map(a => (
            <div key={a.id} onClick={() => { setSelected(a); setMode('view') }}
              style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: selected?.id === a.id ? 'var(--brand-bg)' : 'transparent', transition: 'var(--transition)' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: selected?.id === a.id ? 'var(--brand)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
              {a.category && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{a.category}</div>}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {mode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Team Knowledge Base</h2>
              <p style={{ color: 'var(--text2)', textAlign: 'center', maxWidth: 400 }}>Store guides, onboarding materials, and team documentation. Searchable and always up-to-date.</p>
            </div>
          )}

          {mode === 'view' && selected && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  {selected.category && <span className="badge badge-gray" style={{ marginBottom: 8 }}>{selected.category}</span>}
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{selected.title}</h1>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>By {selected.author_name} · Last updated {new Date(selected.updated_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => { setForm({ title: selected.title, content: selected.content, category: selected.category, workspace: selected.workspace }); setMode('edit') }}>✏️ Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>🗑 Delete</button>
                </div>
              </div>
              <div className="card" style={{ padding: 32, whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text)', fontSize: 15 }}>
                {selected.content}
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>{selected ? 'Edit Article' : 'New Article'}</h2>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label className="label">Workspace</label>
                  <select className="input" value={form.workspace} onChange={e => setForm({...form, workspace: e.target.value})} required>
                    <option value="">Select Workspace</option>
                    {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Title</label>
                  <input className="input" placeholder="Article title..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input className="input" placeholder="e.g. Onboarding, Engineering, HR..." value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>
                <div>
                  <label className="label">Content</label>
                  <textarea className="input" rows={16} style={{ resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }} placeholder="Write your documentation here..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setMode(selected ? 'view' : 'list')}>Cancel</button>
                  <button type="submit" className="btn btn-primary">💾 Save Article</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
