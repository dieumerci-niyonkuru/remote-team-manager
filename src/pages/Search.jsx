import { useState, useRef } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Search() {
  const { theme } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ tasks: [], projects: [], wikis: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef(null)

  const doSearch = async (q) => {
    if (!q.trim()) { setResults({ tasks: [], projects: [], wikis: [] }); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      // Search across tasks, projects, and wiki articles in parallel
      const [taskRes, projRes, wikiRes] = await Promise.all([
        api.get('/tasks/', { params: { search: q } }).catch(() => ({ data: [] })),
        api.get('/projects/', { params: { search: q } }).catch(() => ({ data: [] })),
        api.get('/wiki/articles/', { params: { q } }).catch(() => ({ data: [] })),
      ])
      setResults({
        tasks: Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data?.data || []),
        projects: Array.isArray(projRes.data) ? projRes.data : (projRes.data?.data || []),
        wikis: Array.isArray(wikiRes.data) ? wikiRes.data : [],
      })
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 400)
  }

  const totalResults = results.tasks.length + results.projects.length + results.wikis.length

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Search bar */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>🔍 Global Search</h1>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Search across tasks, projects, and knowledge base articles.</p>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              autoFocus
              style={{ width: '100%', padding: '16px 24px', fontSize: 18, borderRadius: 16, paddingLeft: 56 }}
              placeholder="Search anything..."
              value={query}
              onChange={handleChange}
            />
            <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 20 }}>🔍</span>
          </div>
          {searched && !loading && (
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 10 }}>
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div className="spinner" style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', margin: '0 auto' }} />
            <div style={{ marginTop: 16, color: 'var(--text2)', fontSize: 14 }}>Searching...</div>
          </div>
        )}

        {!loading && searched && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Tasks */}
            {results.tasks.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 700, color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>📋 Tasks ({results.tasks.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.tasks.map(t => (
                    <div key={t.id} className="card card-hover" style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{t.title}</div>
                        {t.description && <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{t.description.slice(0, 80)}...</div>}
                      </div>
                      <span className={`badge ${t.status === 'done' ? 'badge-green' : t.status === 'in_progress' ? 'badge-yellow' : 'badge-gray'}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {results.projects.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 700, color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>📁 Projects ({results.projects.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.projects.map(p => (
                    <div key={p.id} className="card card-hover" style={{ padding: '14px 20px', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{p.name}</div>
                      {p.description && <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{p.description.slice(0, 80)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wiki Articles */}
            {results.wikis.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 700, color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>📚 Knowledge Base ({results.wikis.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.wikis.map(a => (
                    <div key={a.id} onClick={() => navigate('/wiki')} className="card card-hover" style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{a.title}</div>
                        {a.content && <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{a.content.slice(0, 80)}...</div>}
                      </div>
                      {a.category && <span className="badge badge-gray">{a.category}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="card empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No results found</div>
                <div className="empty-desc">Try searching for tasks, project names, or wiki articles.</div>
              </div>
            )}
          </div>
        )}

        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', color: 'var(--text2)', fontSize: 14 }}>
              {['📋 Tasks', '📁 Projects', '📚 Wiki Articles'].map(s => (
                <div key={s} className="card" style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => { setQuery(s.replace(/^.*? /, '')); doSearch(s.replace(/^.*? /, '')) }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
