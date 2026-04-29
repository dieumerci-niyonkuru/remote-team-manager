import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'
import AIAssistant from '../common/AIAssistant'

export default function Layout() {
  const { isAuth, user, logout, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Navigation items (shown for all users, but dashboard links only when logged in)
  const navItems = [
    { to: '/', label: t.home, icon: '🏠', public: true },
    { to: '/#features', label: t.features, icon: '✨', public: true },
    { to: '/about', label: t.about, icon: 'ℹ️', public: true },
  ]
  const authNavItems = [
    { to: '/dashboard', label: t.dashboard, icon: '📊' },
    { to: '/workspaces', label: t.workspaces, icon: '🏢' },
    { to: '/chat', label: '💬 Chat', icon: '💬' },
    { to: '/jobs', label: '💼 Jobs', icon: '💼' },
    { to: '/calendar', label: '📅 Calendar', icon: '📅' },
    { to: '/team', label: t.team, icon: '👥' },
    { to: '/activity', label: t.activity, icon: '⚡' },
  ]
  const allNavItems = isAuth ? [...navItems, ...authNavItems] : navItems

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
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

  const isActive = (to) => {
    if (to === '/') return pathname === '/'
    if (to === '/#features') return false
    return pathname.startsWith(to)
  }

  return (
    <div className={theme} style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: collapsed ? 70 : 260,
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
          <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            {!collapsed && (
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 16 }}>R</div>
                <span style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--text)' }}>Remote<span style={{ color: '#4f46e5' }}>Team</span></span>
              </Link>
            )}
            {collapsed && (
              <Link to="/" style={{ margin: '0 auto' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 16 }}>R</div>
              </Link>
            )}
            <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text2)' }}>
              {collapsed ? '→' : '←'}
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {allNavItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  background: isActive(item.to) ? 'var(--brand-bg)' : 'transparent',
                  color: isActive(item.to) ? '#4f46e5' : 'var(--text2)',
                  transition: '0.15s',
                  fontSize: '14px',
                  fontWeight: isActive(item.to) ? 600 : 500
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom section: Language, Theme, User */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!collapsed && (
              <>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', fontSize: 12, color: 'var(--text2)', flex: 1 }}>
                    {languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                  </select>
                  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 14, cursor: 'pointer', color: 'var(--text2)' }}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </button>
                </div>
                {isAuth ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.first_name} {user?.last_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{user?.email}</div>
                      </div>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 13, fontWeight: 500, width: '100%' }}>
                      Logout
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <Link to="/login" style={{ background: 'transparent', border: '1px solid #4f46e5', borderRadius: 8, padding: '8px', textAlign: 'center', textDecoration: 'none', color: '#4f46e5', fontSize: 13, fontWeight: 500 }}>Login</Link>
                    <Link to="/register" style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '8px', textAlign: 'center', textDecoration: 'none', color: 'white', fontSize: 13, fontWeight: 500 }}>Register</Link>
                  </div>
                )}
              </>
            )}
            {collapsed && (
              <>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', fontSize: 14, cursor: 'pointer', color: 'var(--text2)' }}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                {isAuth && <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '8px', fontSize: 14, cursor: 'pointer' }}>🚪</button>}
                {!isAuth && <Link to="/login" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', textAlign: 'center', display: 'block', color: 'var(--text2)', textDecoration: 'none' }}>🔑</Link>}
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, marginLeft: collapsed ? 70 : 260, transition: 'margin-left 0.2s', minHeight: '100vh' }}>
          <Outlet />
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
      </div>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        padding: '24px 20px',
        marginLeft: collapsed ? 70 : 260,
        transition: 'margin-left 0.2s'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            © 2026 Remote Team Manager | Built with Django + React
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 18 }}>💼</a>
            <a href="https://x.com/dieumercin21" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 18 }}>🐦</a>
            <a href="https://github.com/dieumerci-niyonkuru" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 18 }}>🐙</a>
          </div>
        </div>
      </footer>

      <AIAssistant />

      <style>{`
        @media (max-width: 768px) {
          aside {
            transform: translateX(${mobileOpen ? '0' : '-100%'});
            transition: transform 0.2s;
            position: fixed !important;
            width: 260px !important;
            z-index: 200;
          }
          main, footer {
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
