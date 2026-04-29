import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'
import NotificationBell from '../notifications/NotificationBell'
import AIAssistant from '../common/AIAssistant'

export default function Header() {
  const { isAuth, user, logout, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const publicLinks = [
    { to: '/', label: t.home },
    { to: '/#features', label: t.features },
    { to: '/about', label: t.about },
  ]
  const privateLinks = [
    { to: '/dashboard', label: t.dashboard, icon: '⊞' },
    { to: '/workspaces', label: t.workspaces, icon: '🏢' },
    { to: '/chat', label: t.chat, icon: '💬' },
    { to: '/knowledge', label: t.knowledge, icon: '🧠' },
    { to: '/employees', label: t.employees, icon: '👥' },
    { to: '/performance', label: t.performance, icon: '📊' },
    { to: '/calendar', label: t.calendar, icon: '📅' },
    { to: '/files', label: t.files, icon: '📁' },
    { to: '/analytics', label: t.analytics, icon: '📈' },
    { to: '/support', label: t.support, icon: '❓' },
  ]
  const links = isAuth ? privateLinks : publicLinks

  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to)

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout(); toast.success('Goodbye! 👋'); navigate('/login')
  }

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 1024) setMobileMenuOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  ]

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          <Link to={isAuth ? '/dashboard' : '/'} className="logo">
            <div className="logo-icon">R</div>
            <span className="logo-text">Remote<span>Team</span></span>
          </Link>

          <nav className="desktop-nav">
            {links.map(link => (
              <Link key={link.to} to={link.to} className={`nav-link ${isActive(link.to) ? 'active' : ''}`}>
                {link.icon && <span style={{ marginRight: 5 }}>{link.icon}</span>}{link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            {isAuth && (
              <>
                <div style={{ position: 'relative' }}><NotificationBell /></div>
                <form onSubmit={e => { e.preventDefault(); alert('Search coming soon') }}><input type="text" placeholder={t.search} className="search-input" /></form>
              </>
            )}
            <select value={lang} onChange={e => setLang(e.target.value)} className="lang-select">
              {languages.map(l => <option key={l.code} value={l.code}>{l.flag}</option>)}
            </select>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="theme-btn">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isAuth ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar" onClick={() => navigate('/dashboard')}>{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
                <button className="logout-btn" onClick={handleLogout}>{t.logout}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn-secondary btn-sm">{t.login}</Link>
                <Link to="/register" className="btn-primary btn-sm">{t.register}</Link>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu-container">
            <div className="mobile-menu-header"><span>Menu</span><button onClick={() => setMobileMenuOpen(false)}>✕</button></div>
            <div className="mobile-nav-list">
              {links.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                  {link.icon && <span style={{ marginRight: 8 }}>{link.icon}</span>}{link.label}
                </Link>
              ))}
              <div className="mobile-actions">
                <div className="mobile-action-group"><span>Language</span><select value={lang} onChange={e => setLang(e.target.value)}>{languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}</select></div>
                <div className="mobile-action-group"><span>Theme</span><button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light' : 'Dark'}</button></div>
                {!isAuth && <div className="mobile-auth-buttons"><Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary">Login</Link><Link to="/register" className="btn-primary">Register</Link></div>}
                {isAuth && <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="mobile-logout">Logout</button>}
              </div>
            </div>
          </div>
        )}
      </header>
      <AIAssistant />
      <style>{`
        .site-header { position: sticky; top: 0; z-index: 1000; background: rgba(0,0,0,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); }
        .header-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon { width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #4338ca); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; }
        .logo-text { font-weight: 700; font-size: 1.2rem; color: white; }
        .logo-text span { color: #4f46e5; }
        .desktop-nav { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
        .nav-link { padding: 6px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: #ccc; text-decoration: none; white-space: nowrap; }
        .nav-link.active { color: #4f46e5; background: rgba(79,70,229,0.12); }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .search-input { background: #2d3748; border: none; border-radius: 20px; padding: 6px 12px; color: white; width: 160px; outline: none; }
        .lang-select, .theme-btn { background: #2d3748; border: none; border-radius: 8px; padding: 5px 10px; color: white; cursor: pointer; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: pointer; }
        .logout-btn { background: rgba(239,68,68,0.1); color: #ef4444; border: none; border-radius: 8px; padding: 6px 12px; cursor: pointer; }
        .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.8rem; color: white; cursor: pointer; }
        .mobile-menu-container { position: fixed; top: 70px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(16px); z-index: 999; padding: 20px; overflow-y: auto; }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #2d3748; margin-bottom: 16px; font-weight: bold; color: white; }
        .mobile-nav-list { display: flex; flex-direction: column; gap: 12px; }
        .mobile-nav-link { display: flex; align-items: center; gap: 10px; padding: 12px; background: #1e293b; border-radius: 12px; color: white; text-decoration: none; font-weight: 600; }
        .mobile-actions { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
        .mobile-action-group { display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 12px; border-radius: 12px; color: white; }
        .mobile-auth-buttons { display: flex; gap: 10px; margin-top: 10px; }
        .mobile-logout { background: #ef4444; padding: 12px; border-radius: 12px; color: white; border: none; width: 100%; font-weight: bold; margin-top: 10px; }
        @media (max-width: 1024px) { .desktop-nav, .header-actions { display: none; } .mobile-menu-btn { display: block; } }
      `}</style>
    </>
  )
}
