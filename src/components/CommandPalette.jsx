import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'

const COMMANDS = [
  { group: 'Navigate', icon: '🏠', label: 'Dashboard', action: 'nav', to: '/dashboard' },
  { group: 'Navigate', icon: '💬', label: 'Chat', action: 'nav', to: '/chat' },
  { group: 'Navigate', icon: '📅', label: 'Calendar', action: 'nav', to: '/calendar' },
  { group: 'Navigate', icon: '🧠', label: 'AI Assistant', action: 'nav', to: '/ai' },
  { group: 'Navigate', icon: '📚', label: 'Knowledge Base', action: 'nav', to: '/wiki' },
  { group: 'Navigate', icon: '⚡', label: 'Automations', action: 'nav', to: '/automations' },
  { group: 'Navigate', icon: '🔗', label: 'Integrations', action: 'nav', to: '/integrations' },
  { group: 'Navigate', icon: '👥', label: 'HR & Recruiting', action: 'nav', to: '/hr' },
  { group: 'Navigate', icon: '📁', label: 'Files & Resources', action: 'nav', to: '/files' },
  { group: 'Navigate', icon: '💎', label: 'Pricing & Plans', action: 'nav', to: '/pricing' },
  { group: 'Navigate', icon: '⚙️', label: 'Settings', action: 'nav', to: '/settings' },
  { group: 'Navigate', icon: '🔔', label: 'Notifications', action: 'nav', to: '/notifications' },
  { group: 'Navigate', icon: '🔍', label: 'Search Everything', action: 'nav', to: '/search' },
  { group: 'Actions', icon: '➕', label: 'New Workspace', action: 'nav', to: '/workspaces' },
  { group: 'Actions', icon: '📋', label: 'Create Task', action: 'nav', to: '/workspaces' },
  { group: 'Actions', icon: '🤖', label: 'Ask AI to Breakdown Goal', action: 'nav', to: '/ai' },
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
    <div className={theme} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12vh 24px 24px' }}
      onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div className="card scale-in" style={{ width: '100%', maxWidth: 600, overflow: 'hidden' }}>
        {/* Search input */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            ref={inputRef}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: 'var(--text)', fontFamily: 'var(--font-body)' }}
            placeholder="Search commands, pages, actions..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
          />
          <kbd style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'var(--text3)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px' }}>
          {flat.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No commands found for "{query}"</div>
          )}
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px 4px' }}>{group}</div>
              {cmds.map((cmd) => {
                const idx = flat.indexOf(cmd)
                const isSelected = idx === selected
                return (
                  <div key={cmd.label}
                    onClick={() => { navigate(cmd.to); setOpen(false) }}
                    onMouseEnter={() => setSelected(idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: isSelected ? 'var(--brand-bg)' : 'transparent', transition: 'background 0.1s' }}>
                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{cmd.icon}</span>
                    <span style={{ fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--brand)' : 'var(--text)', fontSize: 14 }}>{cmd.label}</span>
                    {isSelected && <kbd style={{ marginLeft: 'auto', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 11, color: 'var(--text3)' }}>↵</kbd>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 11, color: 'var(--text3)' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
          <span style={{ marginLeft: 'auto' }}>Press <kbd style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 6px' }}>Ctrl K</kbd> to open</span>
        </div>
      </div>
    </div>
  )
}
