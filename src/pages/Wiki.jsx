import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { wiki, ws } from '../services/api'
import useAutosave from '../hooks/useAutosave'
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showSidebar, setShowSidebar] = useState(true)

  const { isDirty, hasSaved, clearSaved, loadSaved } = useAutosave('wiki-article', form, 1500)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setShowSidebar(true)
    }
    window.addEventListener('resize', handleResize)
    
    Promise.all([wiki.list(), ws.list()])
      .then(([aRes, wRes]) => {
        setArticles(aRes.data)
        setWorkspaces(wRes.data.data || wRes.data)
      })
      .catch(() => toast.error('Knowledge sync failed'))
      .finally(() => setLoading(false))
      
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      const res = await wiki.list(searchQ)
      setArticles(res.data)
    } catch { toast.error('Search failure') }
  }

  const selectArticle = (a) => {
    setSelected(a)
    setMode('view')
    if (isMobile) setShowSidebar(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.workspace) { toast.error('Link to a workspace'); return }
    try {
      if (selected) {
        const res = await wiki.update(selected.id, form)
        setArticles(prev => prev.map(a => a.id === selected.id ? res.data : a))
        setSelected(res.data)
        toast.success('Record updated')
      } else {
        const res = await wiki.create(form)
        setArticles(prev => [res.data, ...prev])
        setSelected(res.data)
        toast.success('Record initialized')
      }
      clearSaved()
      setMode('view')
      if (isMobile) setShowSidebar(false)
    } catch { toast.error('Record failure') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Purge this record?')) return
    try {
      await wiki.delete(id)
      setArticles(prev => prev.filter(a => a.id !== id))
      setMode('list')
      setSelected(null)
      setShowSidebar(true)
      toast.success('Record purged')
    } catch { toast.error('Purge failure') }
  }

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 72px)', position:'relative', overflow:'hidden' }}>
      <div style={{ display: 'flex', height: 'calc(100vh - 72px)' }}>
        
        {/* Sidebar */}
        <div style={{ 
          width: isMobile ? '100%' : 300, 
          borderRight: '1px solid var(--border)', 
          padding: '24px 16px', 
          background: 'var(--bg2)', 
          overflowY: 'auto', 
          flexShrink: 0,
          display: (isMobile && !showSidebar) ? 'none' : 'block',
          position: isMobile ? 'absolute' : 'relative',
          inset: 0, zIndex:10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'var(--brand-bg)', color:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📚</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', letterSpacing:'-0.02em' }}>Intelligence</h2>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <input className="input" style={{ flex: 1, padding: '12px 16px', borderRadius:12, background:'var(--bg)', border:'none' }} placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <button type="submit" className="btn btn-secondary" style={{ borderRadius:12, padding:12 }}>🔍</button>
          </form>

          <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24, padding:14, borderRadius:12, fontWeight:800 }} 
            onClick={() => { setSelected(null); setForm({ title: '', content: '', category: '', workspace: workspaces[0]?.id || '' }); setMode('edit'); if (isMobile) setShowSidebar(false) }}>
            + NEW RECORD
          </button>

          {loading ? (
             <div className="skeleton" style={{ height: 40, borderRadius: 12 }} />
          ) : articles.length === 0 ? (
             <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: 24 }}>No records detected.</div>
          ) : articles.map(a => (
            <div key={a.id} onClick={() => selectArticle(a)}
              style={{ padding: '14px 16px', borderRadius: 12, cursor: 'pointer', marginBottom: 6, background: selected?.id === a.id ? 'var(--brand)' : 'transparent', transition: '0.2s' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: selected?.id === a.id ? '#fff' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
              {a.category && <div style={{ fontSize: 11, color: selected?.id === a.id ? 'rgba(255,255,255,0.7)' : 'var(--text3)', marginTop: 4, fontWeight:700 }}>{a.category}</div>}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: isMobile ? 24 : 48,
          display: (isMobile && showSidebar) ? 'none' : 'block'
        }}>
          {isMobile && <button onClick={() => setShowSidebar(true)} style={{ background:'var(--bg2)', border:'none', padding:'8px 16px', borderRadius:10, color:'var(--text2)', fontWeight:800, marginBottom:24, cursor:'pointer' }}>⬅ BACK TO LIST</button>}

          {mode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', textAlign:'center' }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>🧠</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>Workspace Intelligence</h2>
              <p style={{ color: 'var(--text2)', marginTop: 12, maxWidth: 400, fontWeight:500 }}>Select a record to view details or initialize a new article to share knowledge with your team.</p>
            </div>
          )}

          {mode === 'view' && selected && (
            <div className="scale-in">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap:'wrap', gap:24 }}>
                <div style={{ flex:1 }}>
                  {selected.category && <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:8, background:'var(--brand-bg)', color:'var(--brand)', fontSize:11, fontWeight:900, textTransform:'uppercase', marginBottom:12 }}>{selected.category}</span>}
                  <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, letterSpacing:'-0.03em' }}>{selected.title}</h1>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 16, fontWeight:600 }}>By {selected.author_name} · Last sync {new Date(selected.updated_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-secondary" onClick={() => { setForm({ title: selected.title, content: selected.content, category: selected.category, workspace: selected.workspace }); setMode('edit') }}>✏️ EDIT</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>🗑 PURGE</button>
                </div>
              </div>
              <div className="card glass" style={{ padding: isMobile ? 24 : 48, whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text2)', fontSize: 16, fontWeight:500 }}>
                {selected.content}
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <div className="scale-in" style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{selected ? 'REVISE RECORD' : 'INITIALIZE RECORD'}</h2>
                <div style={{ fontSize: 11, fontWeight: 800, color: isDirty ? 'var(--text3)' : 'var(--brand)' }}>{isDirty ? 'DRAFTING...' : '✓ SYNCED'}</div>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label className="label">WORKSPACE NODE</label>
                  <select className="input" style={{ borderRadius:12, padding:14 }} value={form.workspace} onChange={e => setForm({...form, workspace: e.target.value})} required>
                    <option value="">Select Target...</option>
                    {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20 }}>
                  <div>
                    <label className="label">RECORD TITLE</label>
                    <input className="input" style={{ borderRadius:12, padding:14 }} placeholder="Article title..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                  </div>
                  <div>
                    <label className="label">CLASSIFICATION</label>
                    <input className="input" style={{ borderRadius:12, padding:14 }} placeholder="e.g. Onboarding, HR..." value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="label">INTELLIGENCE CONTENT</label>
                  <textarea className="input" rows={12} style={{ resize: 'vertical', borderRadius:12, padding:20, lineHeight: 1.7 }} placeholder="Compose documentation..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex:1, padding:16, borderRadius:12 }} onClick={() => setMode(selected ? 'view' : 'list')}>ABORT</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:2, padding:16, borderRadius:12, fontWeight:800 }}>DEPLOY RECORD</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
