import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'

export default function Layout() {
  const { isAuth, user, logout, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = isAuth ? [
    { to: '/dashboard', icon: '⊞', label: t.dashboard },
    { to: '/workspaces', icon: '🏢', label: t.workspaces },
    { to: '/chat', icon: '💬', label: 'Chat' },
    { to: '/knowledge', icon: '🧠', label: t.knowledge },
    { to: '/employees', icon: '👥', label: t.employees },
    { to: '/performance', icon: '📊', label: t.performance },
    { to: '/jobs', icon: '💼', label: 'Jobs' },
    { to: '/calendar', icon: '📅', label: 'Calendar' },
    { to: '/team', icon: '👥', label: t.team },
    { to: '/activity', icon: '⚡', label: t.activity },
  ] : [
    { to: '/', icon: '🏠', label: t.home },
    { to: '/about', icon: 'ℹ️', label: t.about },
  ]

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout()
    toast.success('Goodbye! 👋')
    navigate('/login')
  }

  return (
    <div className={theme} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 70 : 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)', transition: 'width 0.2s', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          {!collapsed && <span style={{ fontWeight: 'bold', fontSize: 18 }}>RemoteTeam</span>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>{collapsed ? '→' : '←'}</button>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: pathname === item.to ? '#3366ff' : 'var(--text2)', background: pathname === item.to ? 'var(--brand-bg)' : 'transparent', transition: '0.2s' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <select value={lang} onChange={e => setLang(e.target.value)} className="input" style={{ padding: '6px', fontSize: 12 }}>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="rw">🇷🇼 RW</option>
            </select>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px', cursor: 'pointer' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>
          {isAuth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
              {!collapsed && <span style={{ flex: 1 }}>{user?.first_name} {user?.last_name}</span>}
              <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>🚪</button>
            </div>
          )}
        </div>
      </aside>
      {/* Main content */}
      <main style={{ flex: 1, marginLeft: collapsed ? 70 : 240, transition: 'margin-left 0.2s', minHeight: '100vh' }}>
        <Outlet />
      </main>
      <style>{`
        .sidebar-link:hover {
          background: var(--brand-bg);
          color: #3366ff;
        }
      `}</style>
    </div>
  )
}
