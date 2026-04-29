import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'
import AIAssistant from '../common/AIAssistant'
import Footer from './Footer'
import NotificationBell from '../NotificationBell'

export default function Layout() {
  const { isAuth, user, logout, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { to: '/dashboard', icon: '📊', label: t.dashboard },
    { to: '/workspaces', icon: '🏢', label: t.workspaces },
    { to: '/chat', icon: '💬', label: 'Chat' },
    { to: '/jobs', icon: '💼', label: 'Jobs' },
    { to: '/calendar', icon: '📅', label: 'Calendar' },
    { to: '/team', icon: '👥', label: t.team },
    { to: '/activity', icon: '⚡', label: t.activity },
  ]

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout()
    toast.success('Goodbye! 👋')
    navigate('/login')
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Public layout (no sidebar, but has footer)
  if (!isAuth) {
    return (
      <div className={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    )
  }

  // Authenticated layout with left sidebar
  return (
    <div className={theme} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 70 : 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          {!collapsed && (
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>R</div>
              <span style={{ fontWeight: 'bold', color: 'var(--text)', fontSize: '0.9rem' }}>RemoteTeam</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" style={{ margin: '0 auto' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>R</div>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text2)' }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                background: pathname === item.to ? 'var(--brand-bg)' : 'transparent',
                color: pathname === item.to ? '#4f46e5' : 'var(--text2)',
                transition: '0.15s',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom section with user, notifications, theme, logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!collapsed && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{user?.first_name} {user?.last_name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{user?.email}</div>
                  </div>
                </div>
                <NotificationBell />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4 }}>
                <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: '0.7rem', color: 'var(--text2)', flex: 1 }}>
                  <option value="en">🇬🇧 EN</option>
                  <option value="fr">🇫🇷 FR</option>
                  <option value="rw">🇷🇼 RW</option>
                </select>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text2)' }}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 500 }}>
                  Logout
                </button>
              </div>
            </>
          )}
          {collapsed && (
            <>
              <NotificationBell />
              <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: '1rem' }}>
                🚪
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: collapsed ? 70 : 240, transition: 'margin-left 0.2s', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          display: 'none',
          zIndex: 200,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
        className="mobile-menu-fab"
      >
        ☰
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 150,
            display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      <AIAssistant />

      <style>{`
        @media (max-width: 768px) {
          aside {
            transform: translateX(${mobileOpen ? '0' : '-100%'});
            transition: transform 0.2s;
            position: fixed !important;
            width: 240px !important;
            z-index: 200;
          }
          main {
            margin-left: 0 !important;
          }
          .mobile-menu-fab, .mobile-overlay {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
