import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/workspaces', icon: '🏢', label: 'Workspaces' },
  { to: '/activity', icon: '⚡', label: 'Activity' },
]

export default function Layout() {
  const { user, logout, theme, setTheme, language, setLanguage } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout(localStorage.getItem('refresh_token')) } catch {}
    logout()
    toast.success('Goodbye! 👋')
    navigate('/login')
  }

  return (
    <div className={theme} style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 64 : 220, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', overflow: 'hidden', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3366ff, #6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)', flexShrink: 0 }}>R</div>
          {!collapsed && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap' }}>Remote Team</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10,
              background: isActive ? 'var(--brand-light)' : 'transparent',
              color: isActive ? '#3366ff' : 'var(--text-muted)',
              textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 500,
              transition: 'var(--transition)', whiteSpace: 'nowrap', overflow: 'hidden',
            })}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Language */}
          {!collapsed && (
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8 }}>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="rw">🇷🇼 Kinyarwanda</option>
            </select>
          )}
          {/* Theme */}
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {theme === 'dark' ? '☀️' : '🌙'}{!collapsed && (theme === 'dark' ? ' Light mode' : ' Dark mode')}
          </button>
          {/* Toggle */}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: 'var(--text)' }}>
            {collapsed ? '→' : '← Collapse'}
          </button>
          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', borderRadius: 10, background: 'var(--bg)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #3366ff, #6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              </div>
            )}
            <button onClick={handleLogout} style={{ background: 'none', color: '#ef4444', fontSize: 14, padding: 4, flexShrink: 0 }} title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}
