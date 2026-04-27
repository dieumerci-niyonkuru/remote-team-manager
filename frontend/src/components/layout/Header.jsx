import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'
import AIAssistantModal from '../common/AIAssistantModal'

export default function Header() {
  const { isAuth, user, logout, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [search, setSearch] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout()
    toast.success('Goodbye! 👋')
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!search.trim()) return
    if (pathname === '/dashboard' || pathname === '/workspaces')
      navigate(`/dashboard?search=${encodeURIComponent(search)}`)
    else if (pathname.startsWith('/workspaces/'))
      navigate(`${pathname}?search=${encodeURIComponent(search)}`)
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    const demoEmail = 'demo@remoteteam.com'
    const demoPassword = 'Demo1234!'
    try {
      // Try to login first
      const res = await auth.login({ email: demoEmail, password: demoPassword })
      localStorage.setItem('rtm_access', res.data.data.access)
      localStorage.setItem('rtm_refresh', res.data.data.refresh)
      useStore.getState().setUser(res.data.data.user)
      toast.success('Demo mode activated! Enjoy exploring 🎉')
      navigate('/dashboard')
    } catch (err) {
      // If login fails, try to register demo user
      try {
        const registerRes = await auth.register({
          email: demoEmail,
          first_name: 'Demo',
          last_name: 'User',
          password: demoPassword,
          password2: demoPassword
        })
        localStorage.setItem('rtm_access', registerRes.data.data.access)
        localStorage.setItem('rtm_refresh', registerRes.data.data.refresh)
        useStore.getState().setUser(registerRes.data.data.user)
        toast.success('Demo account created! You are now logged in 🎉')
        navigate('/dashboard')
      } catch (regErr) {
        toast.error('Demo login unavailable. Please register manually.')
      }
    } finally {
      setDemoLoading(false)
    }
  }

  const solutionItems = [
    { label: t.solTeamMgmt, path: '/solutions/team-management' },
    { label: t.solTaskTracking, path: '/solutions/task-tracking' },
    { label: t.solTimeLogging, path: '/solutions/time-logging' },
    { label: t.solActivityFeed, path: '/solutions/activity-feed' },
  ]
  const resourceItems = [
    { label: t.resApiDocs, href: 'https://remote-team-manager-production.up.railway.app/api/docs/', external: true },
    { label: t.resGitHub, href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager', external: true },
    { label: t.resHealth, href: 'https://remote-team-manager-production.up.railway.app/api/health/', external: true },
    { label: t.resSupport, href: '/support' },
  ]

  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to)

  const handleDropdownClick = (href, external) => {
    setOpenDropdown(null)
    if (external) window.open(href, '_blank')
    else navigate(href)
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  ]

  const navLinkStyle = {
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: 'clamp(13px, 1.8vw, 15px)',
    fontWeight: 500,
    color: 'var(--text2)',
    textDecoration: 'none',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  }

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(var(--bg-rgb, 6,11,24),0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: 'auto', minHeight: 64, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Logo */}
          <Link to={isAuth ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--brand),var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>R</div>
            <span style={{ fontWeight: 700, fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--text)' }}>Remote<span style={{ color: 'var(--brand)' }}>Team</span></span>
          </Link>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', position: 'relative' }} ref={dropdownRef}>
            {!isAuth ? (
              <>
                <Link to="/" className="nav-link" style={navLinkStyle}>{t.home}</Link>
                <Link to="/#features" className="nav-link" style={navLinkStyle}>{t.features}</Link>
                <div onMouseEnter={() => setOpenDropdown('solutions')} onMouseLeave={() => setOpenDropdown(null)} style={{ position: 'relative' }}>
                  <button className="nav-dropdown-btn" style={{ ...navLinkStyle, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    {t.solutions} <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: openDropdown === 'solutions' ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </button>
                  {openDropdown === 'solutions' && (
                    <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 180, zIndex: 200, padding: '8px 0', marginTop: 4 }}>
                      {solutionItems.map(item => (
                        <div key={item.label} onClick={() => handleDropdownClick(item.path, false)} className="dropdown-item" style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)} style={{ position: 'relative' }}>
                  <button className="nav-dropdown-btn" style={{ ...navLinkStyle, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    {t.resources} <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: openDropdown === 'resources' ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </button>
                  {openDropdown === 'resources' && (
                    <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 180, zIndex: 200, padding: '8px 0', marginTop: 4 }}>
                      {resourceItems.map(item => (
                        <div key={item.label} onClick={() => handleDropdownClick(item.href, item.external)} className="dropdown-item" style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/about" className="nav-link" style={navLinkStyle}>{t.about}</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link" style={navLinkStyle}>{t.dashboard}</Link>
                <Link to="/workspaces" className="nav-link" style={navLinkStyle}>{t.workspaces}</Link>
                <Link to="/team" className="nav-link" style={navLinkStyle}>{t.team}</Link>
                <Link to="/activity" className="nav-link" style={navLinkStyle}>{t.activity}</Link>
              </>
            )}
          </div>

          {/* Search */}
          {isAuth && (
            <form onSubmit={handleSearch} style={{ flexShrink: 0, minWidth: 160 }}>
              <input type="text" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} className="search-input" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 12px', fontSize: 'clamp(12px, 1.5vw, 13px)', width: '100%', outline: 'none' }} />
            </form>
          )}

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 'auto' }}>
            {/* AI Button - prominent */}
            <button
              onClick={() => setAiModalOpen(true)}
              style={{ background: 'linear-gradient(135deg,var(--brand),var(--brand-dark))', border: 'none', borderRadius: 20, padding: '5px 12px', fontSize: 'clamp(12px, 1.5vw, 13px)', fontWeight: 600, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              🤖 AI
            </button>

            {/* Demo button for non-authenticated users */}
            {!isAuth && (
              <button onClick={handleDemoLogin} disabled={demoLoading} style={{ background: 'transparent', border: '1px solid var(--brand)', borderRadius: 20, padding: '5px 12px', fontSize: 'clamp(12px, 1.5vw, 13px)', fontWeight: 600, color: 'var(--brand)', cursor: 'pointer' }}>
                {demoLoading ? '...' : '🎭 Demo'}
              </button>
            )}

            <select value={lang} onChange={e => setLang(e.target.value)} className="lang-select" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', fontSize: 12 }}>
              {languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
            <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 14, cursor: 'pointer' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isAuth ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar-small" onClick={() => navigate('/dashboard')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand),var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <button className="logout-btn" onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t.logout}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="auth-btn login" style={{ background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 13, textDecoration: 'none' }}>{t.login}</Link>
                <Link to="/register" className="auth-btn register" style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{t.register}</Link>
              </div>
            )}
          </div>
        </div>
        <style>{`
          .nav-link.active { color: var(--brand); background: rgba(79,70,229,0.12); }
          .nav-link:hover:not(.active) { color: var(--text); background: rgba(79,70,229,0.08); }
          .dropdown-item:hover { background: rgba(79,70,229,0.1); color: var(--brand); padding-left: 20px; }
          .search-input:focus { border-color: var(--brand); box-shadow: 0 0 0 2px rgba(79,70,229,0.2); }
          @media (max-width: 768px) {
            header > div { padding: 10px 16px; }
            .nav-link, .nav-dropdown-btn { padding: 6px 10px !important; font-size: 12px !important; }
          }
        `}</style>
      </header>
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  )
}
