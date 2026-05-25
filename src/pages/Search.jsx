import { useState, useRef, useCallback } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Search as SearchIcon, FileText, FolderKanban, Users, X, Loader } from 'lucide-react'

export default function Search() {
  const { theme } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ tasks: [], projects: [], members: [], wikis: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef(null)

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults({ tasks: [], projects: [], members: [], wikis: [] }); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      const [globalRes, wikiRes] = await Promise.all([
        api.get('/search/', { params: { q } }).catch(() => ({ data: {} })),
        api.get('/wiki-articles/', { params: { q } }).catch(() => ({ data: [] })),
      ])
      const g = globalRes.data?.data || {}
      setResults({
        tasks:    Array.isArray(g.tasks)    ? g.tasks    : [],
        projects: Array.isArray(g.projects) ? g.projects : [],
        members:  Array.isArray(g.members)  ? g.members  : [],
        wikis:    Array.isArray(wikiRes.data) ? wikiRes.data : (wikiRes.data?.data || []),
      })
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 400)
  }

  const totalResults = results.tasks.length + results.projects.length + results.members.length + results.wikis.length

  const Section = ({ icon, label, items, renderItem }) => items.length === 0 ? null : (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 4px' }}>
        <span style={{ color: 'var(--brand)' }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {label} ({items.length})
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(renderItem)}
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '40px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.03em' }}>
            Global Search
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Search across tasks, projects, members, and knowledge base.</p>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            autoFocus
            value={query}
            onChange={handleChange}
            placeholder="Search anything..."
            style={{
              width: '100%', padding: '16px 48px 16px 48px',
              fontSize: 16, borderRadius: 14, background: 'var(--bg3)',
              border: '1px solid var(--border)', color: 'var(--text)',
              outline: 'none', transition: '0.2s', fontFamily: 'var(--font-body)',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {loading && <Loader size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', animation: 'spin 0.8s linear infinite' }} />}
          {query && !loading && (
            <button onClick={() => { setQuery(''); setResults({ tasks: [], projects: [], members: [], wikis: [] }); setSearched(false); }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        {searched && !loading && (
          <div>
            {totalResults === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
                <SearchIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }} />
                <p style={{ fontWeight: 700 }}>No results for "{query}"</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Try a different search term.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24, fontWeight: 700 }}>
                  {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                </p>

                <Section icon={<FileText size={14} />} label="Tasks" items={results.tasks}
                  renderItem={t => (
                    <div key={t.id} onClick={() => navigate('/tasks')}
                      style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{t.title}</p>
                      {t.status && <span style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, display: 'block' }}>{t.status}</span>}
                    </div>
                  )}
                />

                <Section icon={<FolderKanban size={14} />} label="Projects" items={results.projects}
                  renderItem={p => (
                    <div key={p.id} onClick={() => navigate('/projects')}
                      style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{p.name}</p>
                    </div>
                  )}
                />

                <Section icon={<Users size={14} />} label="Members" items={results.members}
                  renderItem={m => (
                    <div key={m.id} style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{m.username}</p>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{m.email}</span>
                    </div>
                  )}
                />

                <Section icon={<FileText size={14} />} label="Knowledge Base" items={results.wikis}
                  renderItem={w => (
                    <div key={w.id} onClick={() => navigate('/wiki')}
                      style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{w.title}</p>
                    </div>
                  )}
                />
              </>
            )}
          </div>
        )}

        {!searched && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 60 }}>
            <SearchIcon size={40} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
            <p style={{ fontSize: 14 }}>Start typing to search across your workspace.</p>
          </div>
        )}
      </div>
    </div>
  )
}
