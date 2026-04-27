import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'
import UserDropdown from '../common/UserDropdown'

export default function Header() {
  const { isAuth, user, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    localStorage.removeItem('rtm_access')
    localStorage.removeItem('rtm_refresh')
    toast.success('Goodbye! 👋')
    navigate('/login')
  }

  const isActive = (path) => pathname === path

  // Navigation items (always visible on desktop, on mobile inside hamburger)
  const navItems = [
    { to: '/', label: 'Home', public: true },
    { type: 'dropdown', label: 'Features', items: [
        { label: 'Workspaces', to: '/features/workspaces' },
        { label: 'Task Management', to: '/features/tasks' },
        { label: 'Team Collaboration', to: '/features/team' },
        { label: 'Time Tracking', to: '/features/time' },
      ], public: true },
    { to: '/pricing', label: 'Pricing', public: true },
    { type: 'dropdown', label: 'Resources', items: [
        { label: 'API Docs', href: 'https://remote-team-manager-production.up.railway.app/api/docs/', external: true },
        { label: 'GitHub', href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager', external: true },
        { label: 'Support', to: '/support' },
      ], public: true },
    { to: '/about', label: 'About', public: true },
    ...(isAuth ? [
      { to: '/dashboard', label: t.dashboard, public: false },
      { to: '/workspaces', label: t.workspaces, public: false },
      { to: '/team', label: t.team, public: false },
      { to: '/activity', label: t.activity, public: false },
    ] : []),
  ]

  const renderNavItem = (item) => {
    if (item.to) {
      return (
        <Link
          key={item.to}
          to={item.to}
          className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
          onClick={() => setMobileOpen(false)}
        >
          {item.label}
        </Link>
      )
    }
    if (item.type === 'dropdown') {
      return (
        <div
          key={item.label}
          className="dropdown-container"
          onMouseEnter={() => setOpenDropdown(item.label)}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <button className="nav-dropdown-btn">{item.label} ▾</button>
          {openDropdown === item.label && (
            <div className="dropdown-menu">
              {item.items.map(sub => (
                <div
                  key={sub.label}
                  className="dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null)
                    setMobileOpen(false)
                    if (sub.external) window.open(sub.href, '_blank')
                    else if (sub.to) navigate(sub.to)
                  }}
                >
                  {sub.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const renderMobileItem = (item) => {
    if (item.to) {
      return (
        <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="mobile-nav-link">
          {item.label}
        </Link>
      )
    }
    if (item.type === 'dropdown') {
      return (
        <div key={item.label} className="mobile-dropdown">
          <div className="mobile-dropdown-label">{item.label}</div>
          <div className="mobile-dropdown-items">
            {item.items.map(sub => (
              <div key={sub.label} className="mobile-dropdown-item" onClick={() => {
                setMobileOpen(false)
                if (sub.external) window.open(sub.href, '_blank')
                else if (sub.to) navigate(sub.to)
              }}>
                {sub.label}
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  ]

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          {/* Logo */}
          <Link to={isAuth ? '/dashboard' : '/'} className="logo">
            <div className="logo-icon">R</div>
            <span className="logo-text">Remote<span>Team</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navItems.map(renderNavItem)}
          </nav>

          {/* Desktop Right Controls */}
          <div className="header-actions">
            <select value={lang} onChange={e => setLang(e.target.value)} className="lang-select">
              {languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="theme-btn">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isAuth ? (
              <UserDropdown user={user} />
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-secondary btn-sm">{t.login}</Link>
                <Link to="/register" className="btn-primary btn-sm">{t.register}</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
        </div>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="mobile-menu-container">
            <div className="mobile-menu-header">
              <span>Menu</span>
              <button onClick={() => setMobileOpen(false)}>✕</button>
            </div>
            <div className="mobile-nav-list">
              {navItems.map(renderMobileItem)}
              <div className="mobile-actions">
                <div className="mobile-action-group">
                  <span>Language</span>
                  <select value={lang} onChange={e => setLang(e.target.value)}>
                    {languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                  </select>
                </div>
                <div className="mobile-action-group">
                  <span>Theme</span>
                  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                </div>
                {!isAuth && (
                  <div className="mobile-auth-buttons">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary">Login</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary">Register</Link>
                  </div>
                )}
                {isAuth && (
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="mobile-logout">
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon { width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #4338ca); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; }
        .logo-text { font-weight: 700; font-size: 1.2rem; color: white; }
        .logo-text span { color: #4f46e5; }

        .desktop-nav { display: flex; gap: 1.2rem; align-items: center; }
        .nav-link, .nav-dropdown-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #ccc;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-link.active, .nav-dropdown-btn.active { color: #4f46e5; background: rgba(79,70,229,0.12); }
        .nav-link:hover, .nav-dropdown-btn:hover { color: white; background: rgba(79,70,229,0.08); }

        .dropdown-container { position: relative; }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          min-width: 180px;
          padding: 8px 0;
          z-index: 200;
          backdrop-filter: blur(8px);
        }
        .dropdown-item { padding: 8px 16px; font-size: 0.9rem; cursor: pointer; }
        .dropdown-item:hover { background: var(--brand-bg); color: var(--brand); }

        .header-actions { display: flex; gap: 1rem; align-items: center; }
        .lang-select, .theme-btn {
          background: #2d3748;
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          color: white;
          cursor: pointer;
        }
        .auth-buttons { display: flex; gap: 10px; }
        .mobile-menu-btn { display: none; background: none; border: none; font-size: 2rem; color: white; cursor: pointer; }

        /* Mobile menu styles */
        .mobile-menu-container {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.95);
          backdrop-filter: blur(16px);
          z-index: 999;
          padding: 1.5rem;
          overflow-y: auto;
        }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid #2d3748; margin-bottom: 1rem; font-weight: bold; font-size: 1.2rem; color: white; }
        .mobile-nav-list { display: flex; flex-direction: column; gap: 12px; }
        .mobile-nav-link { display: block; padding: 12px; background: #1e293b; border-radius: 12px; color: white; text-decoration: none; font-weight: 600; text-align: center; }
        .mobile-dropdown { background: #1e293b; border-radius: 12px; overflow: hidden; }
        .mobile-dropdown-label { padding: 12px; font-weight: bold; background: #0f172a; color: white; }
        .mobile-dropdown-items { display: flex; flex-direction: column; }
        .mobile-dropdown-item { padding: 10px 16px; color: #ccc; cursor: pointer; border-top: 1px solid #2d3748; }
        .mobile-actions { margin-top: 1rem; display: flex; flex-direction: column; gap: 12px; }
        .mobile-action-group { display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px; border-radius: 8px; }
        .mobile-auth-buttons { display: flex; gap: 10px; margin-top: 10px; }
        .mobile-logout { background: #ef4444; padding: 12px; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; width: 100%; }

        @media (max-width: 1024px) {
          .desktop-nav, .header-actions { display: none; }
          .mobile-menu-btn { display: block; }
        }
      `}</style>
    </>
  )
}
