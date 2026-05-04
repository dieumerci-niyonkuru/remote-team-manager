import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

const COMMANDS = [
  { group: 'Intelligence', icon: '📊', label: 'Command Center', action: 'nav', to: '/dashboard', desc: 'Real-time platform analytics' },
  { group: 'Intelligence', icon: '💬', label: 'Communications', action: 'nav', to: '/chat', desc: 'Secure team frequency' },
  { group: 'Intelligence', icon: '📚', label: 'Knowledge Base', action: 'nav', to: '/wiki', desc: 'Intelligence repository' },
  { group: 'Operations', icon: '📅', label: 'Mission Timeline', action: 'nav', to: '/calendar', desc: 'Global synchronization' },
  { group: 'Operations', icon: '📁', label: 'Resource Library', action: 'nav', to: '/files', desc: 'Encrypted asset storage' },
  { group: 'Operations', icon: '🏥', label: 'Force Readiness', action: 'nav', to: '/health', desc: 'Team health metrics' },
  { group: 'Network', icon: '🌍', label: 'Global Nodes', action: 'nav', to: '/nodes', desc: 'Workforce distribution' },
  { group: 'Network', icon: '🔌', label: 'API Bridge', action: 'nav', to: '/api', desc: 'Enterprise integrations' },
  { group: 'System', icon: '⚙️', label: 'Settings', action: 'nav', to: '/settings', desc: 'Node configuration' },
  { group: 'System', icon: '🔔', label: 'Notifications', action: 'nav', to: '/notifications', desc: 'Mission alerts' },
]

export default function CommandPalette() {
  const { isAuth, theme } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  if (!isAuth) return null

  const filtered = query.trim()
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.group.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  const flat = filtered

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flat.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && flat[selected]) { navigate(flat[selected].to); setOpen(false) }
  }

  if (!open) return null

  return (
    <div className={theme} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12vh 24px 24px' }}
      onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div className="card scale-in" style={{ 
        width: '100%', maxWidth: 640, overflow: 'hidden', background: 'var(--bg-card)', borderRadius: 28, border: '1px solid var(--border)', boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg2)' }}>
          <span style={{ fontSize: 24 }}>🔍</span>
          <input
            ref={inputRef}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'inherit' }}
            placeholder="Command Bridge: Search nodes..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
          />
          <kbd style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 900, color: 'var(--text3)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: '16px' }}>
          {flat.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text3)', fontSize: 16, fontWeight: 600 }}>No intelligence nodes found for "{query}"</div>
          )}
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: 2, padding: '8px 16px 8px' }}>{group}</div>
              {cmds.map((cmd) => {
                const idx = flat.indexOf(cmd)
                const isSelected = idx === selected
                return (
                  <div key={cmd.label}
                    onClick={() => { navigate(cmd.to); setOpen(false) }}
                    onMouseEnter={() => setSelected(idx)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 16, cursor: 'pointer', 
                      background: isSelected ? 'var(--brand-bg)' : 'transparent', transition: '0.2s',
                      transform: isSelected ? 'translateX(4px)' : 'none'
                    }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isSelected ? 'var(--brand)' : 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, transition: '0.2s', color: isSelected ? '#fff' : 'inherit' }}>
                      {cmd.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: isSelected ? 'var(--brand)' : 'var(--text)', fontSize: 15 }}>{cmd.label}</div>
                      <div style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 600 }}>{cmd.desc}</div>
                    </div>
                    {isSelected && <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--brand)', textTransform: 'uppercase' }}>Execute ↵</div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 11, fontWeight: 800, color: 'var(--text3)', background: 'rgba(0,0,0,0.02)', letterSpacing: 1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ border:'1px solid var(--border)', padding:'2px 4px', borderRadius:4 }}>↑↓</span> Navigate</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ border:'1px solid var(--border)', padding:'2px 4px', borderRadius:4 }}>↵</span> Open Node</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ border:'1px solid var(--border)', padding:'2px 4px', borderRadius:4 }}>ESC</span> Abort</div>
          <div style={{ marginLeft: 'auto', color: 'var(--brand)' }}>NEXUS MISSION BRIDGE v1.0.4</div>
        </div>
      </div>
      <style>{`
        .scale-in { animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
