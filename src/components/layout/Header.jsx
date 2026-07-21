import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { auth } from '../../services/api'
import { getT } from '../../i18n'
import toast from 'react-hot-toast'
import NotificationBadge from './NotificationBadge'
import ThemeSwitcher from './ThemeSwitcher'
import { Button } from '../common/Button'
import { Globe, ChevronDown } from 'lucide-react'

const LANGS = [
  { code: 'en', label: 'EN', flag: '\u{1F1EC}\u{1F1E7}', name: 'English' },
  { code: 'fr', label: 'FR', flag: '\u{1F1EB}\u{1F1F7}', name: 'Fran\u00e7ais' },
  { code: 'rw', label: 'RW', flag: '\u{1F1F7}\u{1F1FC}', name: 'Kinyarwanda' },
]

const PRODUCT_MENU = [
  { label: 'Dashboard', to: '/dashboard', desc: 'Overview of all your work' },
  { label: 'Projects', to: '/projects', desc: 'Manage boards and milestones' },
  { label: 'Tasks', to: '/tasks', desc: 'Track and assign work items' },
  { label: 'Chat', to: '/chat', desc: 'Real-time team messaging' },
  { label: 'Wiki', to: '/wiki', desc: 'Knowledge base and docs' },
]

const SOLUTIONS_MENU = [
  { label: 'Analytics', to: '/analytics', desc: 'Insights and productivity data' },
  { label: 'Calendar', to: '/calendar', desc: 'Plan sprints and deadlines' },
  { label: 'OKRs', to: '/okr', desc: 'Track goals and objectives' },
  { label: 'Automations', to: '/automations', desc: 'Workflow automation rules' },
]

const ENTERPRISE_MENU = [
  { label: 'Workspaces', to: '/workspaces', desc: 'Isolated project environments' },
  { label: 'Team', to: '/team', desc: 'Manage members and roles' },
  { label: 'HR', to: '/hr', desc: 'Team management and onboarding' },
  { label: 'Settings', to: '/settings', desc: 'Security, SSO, and preferences' },
]

const PLATFORM_MENU = [
  { label: 'Integrations', to: '/integrations', desc: 'Connect your favourite tools' },
  { label: 'AI Assistant', to: '/ai', desc: 'AI-powered task insights' },
  { label: 'Files', to: '/files', desc: 'Store and share team assets' },
]

export default function Header() {
  const { isAuth, user, logout, theme, setTheme, lang = 'en', setLang } = useStore()
  const t = getT(lang || 'en')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const langRef = useRef(null)
  const navRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false)
      if (navRef.current && !navRef.current.contains(e.target)) setActiveDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setShowMenu(false); setActiveDropdown(null) }, [pathname])

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout(); toast.success('Signed out successfully'); navigate('/login')
  }

  const NavDropdown = ({ label, items }) => {
    const isActive = activeDropdown === label
    return (
      <div
        style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
        onMouseEnter={() => setActiveDropdown(label)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <button style={{
          background: isActive ? 'var(--brand-bg)' : 'none', border: 'none',
          color: isActive ? 'var(--brand)' : 'var(--text2)',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
          borderRadius: 10, transition: '0.2s', fontFamily: 'inherit',
        }}>
          {label}
          <ChevronDown size={12} style={{ opacity: 0.5, transform: isActive ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>

        {isActive && (
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 280, padding: 8, borderRadius: 16,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            boxShadow: '0 24px 60px -8px rgba(0,0,0,0.5)',
            zIndex: 100, animation: 'dropdownIn 0.15s ease',
          }}>
            {items.map(item => (
              <Link key={item.to} to={item.to} style={{
                display: 'block', padding: '12px 14px', borderRadius: 12,
                textDecoration: 'none', transition: '0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(var(--bg-rgb), 0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(30px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      height: scrolled ? 72 : 88, transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1300, padding: '0 clamp(16px,3vw,24px)' }}>

        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px -4px rgba(51,102,255,0.4)', overflow: 'hidden', padding: 6 }}>
            <img src="/logo.png" alt="RemoteTeam" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            Remote<span style={{ color: 'var(--brand)' }}>Team</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav ref={navRef} className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
          <Link to="/about" style={{
            fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 10,
            textDecoration: 'none', color: pathname === '/about' ? 'var(--brand)' : 'var(--text2)',
            background: pathname === '/about' ? 'var(--brand-bg)' : 'transparent',
            transition: '0.2s', height: '100%', display: 'flex', alignItems: 'center',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.background = 'var(--brand-bg)'; }}
            onMouseLeave={e => {
              e.currentTarget.style.color = pathname === '/about' ? 'var(--brand)' : 'var(--text2)';
              e.currentTarget.style.background = pathname === '/about' ? 'var(--brand-bg)' : 'transparent';
            }}
          >
            {t('nav.about', 'About Us')}
          </Link>
          <NavDropdown label="Product" items={PRODUCT_MENU} />
          <NavDropdown label="Solutions" items={SOLUTIONS_MENU} />
          <NavDropdown label="Enterprise" items={ENTERPRISE_MENU} />
          <NavDropdown label="Platform" items={PLATFORM_MENU} />
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Language Switcher */}
          <div className="desktop-only" style={{ position: 'relative' }} ref={langRef}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: showLangMenu ? 'var(--brand-bg)' : 'var(--bg3)',
                border: `1px solid ${showLangMenu ? 'var(--brand)' : 'var(--border)'}`,
                color: showLangMenu ? 'var(--brand)' : 'var(--text2)',
                borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: '0.2s'
              }}
            >
              <Globe size={13} />
              {LANGS.find(l => l.code === (lang || 'en'))?.flag} {LANGS.find(l => l.code === (lang || 'en'))?.label}
              <ChevronDown size={11} style={{ opacity: 0.6, transform: showLangMenu ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
            {showLangMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 160,
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
                padding: 6, boxShadow: '0 20px 50px rgba(0,0,0,0.4)', zIndex: 500,
              }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang && setLang(l.code); setShowLangMenu(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px',
                      borderRadius: 10, background: (lang || 'en') === l.code ? 'var(--brand-bg)' : 'transparent',
                      border: 'none', color: (lang || 'en') === l.code ? 'var(--brand)' : 'var(--text2)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '0.15s', textAlign: 'left'
                    }}>
                    <span style={{ fontSize: 16 }}>{l.flag}</span>
                    <span>{l.name}</span>
                    {(lang || 'en') === l.code && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--brand)' }}>\u2713</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuth && <NotificationBadge />}

          <div className="desktop-only">
            <ThemeSwitcher />
          </div>

          {isAuth ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button variant="secondary" onClick={() => navigate('/dashboard')} size="sm" className="font-black desktop-only">{t('nav.dashboard', 'Dashboard')}</Button>
              <Button variant="ghost" onClick={handleLogout} size="sm" className="font-black">{t('auth.logout', 'Sign Out')}</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" className="desktop-only font-black" onClick={() => navigate('/login')}>{t('auth.login.submit', 'Sign In')}</Button>
              <Button variant="primary" size="sm" className="font-black" onClick={() => navigate('/register')}>{t('auth.register.submit', 'Sign Up')}</Button>
            </div>
          )}

          <button className="mobile-only btn-icon" onClick={() => setShowMenu(!showMenu)} style={{ fontSize: 22, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 12px', color: 'var(--text)', cursor: 'pointer' }}>
            {showMenu ? '\u2715' : '\u2630'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="mobile-menu-overlay fade-in" style={{ position: 'fixed', top: scrolled ? 72 : 88, left: 0, right: 0, bottom: 0, background: 'var(--bg)', backdropFilter: 'blur(40px)', zIndex: 1001, padding: 'clamp(16px,3vw,24px)', overflowY: 'auto' }}>
          {/* Language selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => { setLang && setLang(l.code); }}
                style={{ background: (lang || 'en') === l.code ? 'var(--brand)' : 'var(--bg3)', color: (lang || 'en') === l.code ? '#fff' : 'var(--text)', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* Simple links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <Link to="/" onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ textAlign: 'center' }}>{t('nav.home', 'Home')}</Link>
            <Link to="/about" onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ textAlign: 'center' }}>{t('nav.about', 'About Us')}</Link>
          </div>

          {/* Dropdown sections */}
          {[
            { label: 'Product', items: PRODUCT_MENU },
            { label: 'Solutions', items: SOLUTIONS_MENU },
            { label: 'Enterprise', items: ENTERPRISE_MENU },
            { label: 'Platform', items: PLATFORM_MENU },
          ].map(cat => (
            <div key={cat.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>{cat.label}</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {cat.items.map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setShowMenu(false)} className="mobile-nav-link"
                    style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 14px' }}>
                    <span style={{ fontSize: 13 }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
            {!isAuth ? (
              <>
                <Link to="/login" onClick={() => setShowMenu(false)} className="btn btn-secondary" style={{ padding: 16, textAlign: 'center', borderRadius: 14 }}>{t('auth.login.submit', 'Sign In')}</Link>
                <Link to="/register" onClick={() => setShowMenu(false)} className="btn btn-primary" style={{ padding: 16, textAlign: 'center', borderRadius: 14 }}>{t('auth.register.submit', 'Sign Up')}</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setShowMenu(false)} className="btn btn-primary" style={{ padding: 16, textAlign: 'center', borderRadius: 14 }}>{t('nav.dashboard', 'Dashboard')}</Link>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: 16, borderRadius: 14 }}>{t('auth.logout', 'Sign Out')}</button>
              </>
            )}
            <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} className="btn btn-secondary" style={{ padding: 14, borderRadius: 14 }}>{t('common.toggle_theme', 'Toggle Theme')}</button>
          </div>
        </div>
      )}

      <style>{`
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        .mobile-nav-link {
          padding: 12px 16px; font-size: 13px; font-weight: 700; color: var(--text); text-decoration: none;
          border-radius: 12px; background: var(--bg3); border: 1px solid var(--border); transition: 0.2s; display: block;
        }
        .mobile-nav-link:hover { background: var(--bg2); border-color: var(--brand); }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </header>
  )
}
