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

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(var(--bg-rgb, 6,11,24),0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3366ff,#6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, transition: 'transform 0.2s' }} className="hover-glow">R</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.02em' }}>Remote<span style={{ color: '#3366ff' }}>Team</span></span>
          </Link>

          {/* Navigation + Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }} ref={dropdownRef}>
            <NavLink to="/" active={isActive('/')}>{t.home}</NavLink>
            <NavLink to="/#features" active={false}>{t.features}</NavLink>

            {/* Solutions Dropdown */}
            <div onMouseEnter={() => setOpenDropdown('solutions')} onMouseLeave={() => setOpenDropdown(null)} style={{ position: 'relative' }}>
              <button className="nav-dropdown-btn" style={{ background: 'transparent', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: openDropdown === 'solutions' ? '#3366ff' : 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
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

            {/* Resources Dropdown */}
            <div onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)} style={{ position: 'relative' }}>
              <button className="nav-dropdown-btn" style={{ background: 'transparent', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: openDropdown === 'resources' ? '#3366ff' : 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
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

            <NavLink to="/about" active={isActive('/about')}>{t.about}</NavLink>

            {isAuth && (
              <>
                <NavLink to="/dashboard" active={isActive('/dashboard')}>{t.dashboard}</NavLink>
                <NavLink to="/workspaces" active={isActive('/workspaces')}>{t.workspaces}</NavLink>
                <NavLink to="/team" active={isActive('/team')}>{t.team}</NavLink>
                <NavLink to="/activity" active={isActive('/activity')}>{t.activity}</NavLink>
              </>
            )}
          </div>

          {/* Search */}
          {isAuth && (
            <form onSubmit={handleSearch} style={{ flexShrink: 0, minWidth: 180 }}>
              <input type="text" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} className="search-input" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 12px', fontSize: 13, width: '100%', outline: 'none' }} />
            </form>
          )}

          {/* Right controls (including AI button) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* AI Assistant Button - always visible in header */}
            <button
              onClick={() => setAiModalOpen(true)}
              style={{ background: 'linear-gradient(135deg,#3366ff,#6699ff)', border: 'none', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: '0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🤖 AI
            </button>

            <select value={lang} onChange={e => setLang(e.target.value)} className="lang-select" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
              {languages.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
            <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 14, cursor: 'pointer' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isAuth ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar-small" onClick={() => navigate('/dashboard')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <button className="logout-btn" onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t.logout}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/login" className="auth-btn login" style={{ background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 16px', fontSize: 13, textDecoration: 'none' }}>{t.login}</Link>
                <Link to="/register" className="auth-btn register" style={{ background: '#3366ff', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{t.register}</Link>
              </div>
            )}
          </div>
        </div>
        <style>{`
          .nav-link { padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--text2); text-decoration: none; transition: 0.2s; }
          .nav-link.active { color: #3366ff; background: rgba(51,102,255,0.12); }
          .nav-link:hover:not(.active) { color: var(--text); background: rgba(51,102,255,0.08); }
          .dropdown-item:hover { background: rgba(51,102,255,0.1); color: #3366ff; padding-left: 20px; }
          .search-input:focus { border-color: #3366ff; box-shadow: 0 0 0 2px rgba(51,102,255,0.2); }
        `}</style>
      </header>
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  )
}

function NavLink({ to, children, active }) {
  return <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>{children}</Link>
}
