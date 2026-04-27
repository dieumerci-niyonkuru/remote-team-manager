import { useState } from 'react'
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

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    localStorage.removeItem('rtm_access')
    localStorage.removeItem('rtm_refresh')
    toast.success('Goodbye! 👋')
    navigate('/login')
  }

  const isActive = (to) => pathname === to

  const navLinks = isAuth
    ? [
        { to: '/dashboard', label: t.dashboard },
        { to: '/workspaces', label: t.workspaces },
        { to: '/team', label: t.team },
        { to: '/activity', label: t.activity },
      ]
    : [
        { to: '/', label: t.home },
        { to: '/about', label: t.about },
      ]

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to={isAuth ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>R</div>
            <span style={{ fontWeight: 'bold', color: 'white', fontSize: '16px' }}>Remote<span style={{ color: '#4f46e5' }}>Team</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{ color: isActive(link.to) ? '#4f46e5' : '#ccc', textDecoration: 'none', fontWeight: '500' }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Controls */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuth && <span style={{ color: '#ccc' }}>🔍 {t.search}</span>}
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: '#2d3748', border: 'none', borderRadius: '8px', padding: '5px 8px', color: 'white' }}>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="rw">🇷🇼 RW</option>
            </select>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: '#2d3748', border: 'none', borderRadius: '8px', padding: '5px 12px', color: 'white' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isAuth ? (
              <UserDropdown user={user} />
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" style={{ background: 'transparent', border: '1px solid #4f46e5', padding: '6px 16px', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>{t.login}</Link>
                <Link to="/register" style={{ background: '#4f46e5', padding: '6px 16px', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>{t.register}</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="hamburger" style={{ display: 'none', background: 'none', border: 'none', fontSize: '28px', color: 'white', cursor: 'pointer' }}>☰</button>
        </div>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)', zIndex: 999, padding: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px', background: '#1e293b', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center' }}>
                  {link.label}
                </Link>
              ))}
              <div style={{ padding: '12px', background: '#1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white' }}>Language</span>
                <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: '#0f172a', border: 'none', borderRadius: '8px', padding: '5px 8px', color: 'white' }}>
                  <option value="en">🇬🇧 EN</option>
                  <option value="fr">🇫🇷 FR</option>
                  <option value="rw">🇷🇼 RW</option>
                </select>
              </div>
              <div style={{ padding: '12px', background: '#1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white' }}>Theme</span>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: '#0f172a', border: 'none', borderRadius: '8px', padding: '5px 12px', color: 'white' }}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
              </div>
              {!isAuth && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', background: 'transparent', border: '1px solid #4f46e5', padding: '12px', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>{t.login}</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', background: '#4f46e5', padding: '12px', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>{t.register}</Link>
                </div>
              )}
              {isAuth && (
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ background: '#ef4444', padding: '12px', borderRadius: '8px', color: 'white', border: 'none', fontWeight: 'bold' }}>
                  {t.logout}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .header-actions {
            display: none !important;
          }
          .hamburger {
            display: block !important;
          }
        }
      `}</style>
    </>
  )
}
