import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { auth } from '../../services/api'
import { getT } from '../../i18n'
import toast from 'react-hot-toast'
import NotificationBadge from './NotificationBadge'
import ThemeSwitcher from './ThemeSwitcher'
import { Button } from '../common/Button'
import { Globe, ChevronDown, Video } from 'lucide-react'

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'rw', label: 'RW', flag: '🇷🇼', name: 'Kinyarwanda' },
]

export default function Header() {
  const { isAuth, user, logout, theme, setTheme, lang = 'en', setLang } = useStore()
  const t = getT(lang || 'en')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showMenu, setShowMenu] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState(null)
  const [showLangMenu, setShowLangMenu] = React.useState(false)
  const langRef = useRef(null)

  // Close lang menu when clicking outside
  React.useEffect(() => {
    const handler = e => { if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => setShowMenu(false), [pathname])

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout(); toast.success('Signed out successfully'); navigate('/login')
  }

  const PRODUCT_MENU = [
    { label: t('nav.dashboard',    'Workspaces'),     to: '/dashboard',    desc: 'Manage your team workspaces',      icon: '01' },
    { label: t('nav.chat',         'Chat & Channels'), to: '/chat',        desc: 'Real-time team communication',     icon: '02' },
    { label: t('nav.wiki',         'Knowledge Base'),  to: '/wiki',        desc: 'Document and share knowledge',     icon: '03' },
  ]

  const SOLUTIONS_MENU = [
    { label: t('nav.calendar',     'Timeline'),        to: '/calendar',    desc: 'Plan sprints and milestones',      icon: '04' },
    { label: t('nav.files',        'Assets'),          to: '/files',       desc: 'Store and share team assets',      icon: '05' },
    { label: t('nav.analytics',    'Analytics'),       to: '/analytics',   desc: 'Insights and productivity data',   icon: '11' },
  ]

  const ENTERPRISE_MENU = [
    { label: 'Security',           to: '/settings',    desc: 'SSO, 2FA, and access control',     icon: '07' },
    { label: t('nav.workspaces',   'Multi-workspace'), to: '/workspaces',  desc: 'Isolated project environments',   icon: '09' },
  ]

  const PLATFORM_MENU = [
    { label: 'API',                to: '/integrations', desc: 'REST API and webhooks',             icon: '10' },
    { label: t('nav.integrations', 'Integrations'),    to: '/integrations', desc: 'Connect your favourite tools',   icon: '11' },
    { label: t('nav.ai_assistant', 'AI Assistant'),    to: '/ai',          desc: 'AI-powered task intelligence',    icon: '12' },
  ]

  const NavItem = ({ label, items, to }) => {
    const hasItems = items && items.length > 0
    return (
      <div 
        style={{ position:'relative', height:'100%', display:'flex', alignItems:'center' }}
        onMouseEnter={() => hasItems && setActiveDropdown(label)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        {to ? (
          <Link to={to} style={{ 
            textDecoration:'none', color: pathname === to ? 'var(--brand)' : 'var(--text2)', 
            fontSize:13, fontWeight:800, padding:'8px 16px', borderRadius:12, transition:'0.2s',
            background: pathname === to ? 'var(--brand-bg)' : 'transparent'
          }} className="nav-link-hover">{label}</Link>
        ) : (
          <button style={{ 
            background:'none', border:'none', color: activeDropdown === label ? 'var(--brand)' : 'var(--text2)', 
            fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:6, padding:'8px 16px'
          }} className="nav-link-hover">
            {label} <span style={{ fontSize:10, opacity:0.5 }}>▼</span>
          </button>
        )}

        {hasItems && activeDropdown === label && (
          <div className="glass fade-in" style={{ 
            position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:300, padding:14, borderRadius:24, 
            boxShadow:'0 40px 80px -10px rgba(0,0,0,0.5)', zIndex:100, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(10, 15, 30, 0.95)', backdropFilter:'blur(40px)'
          }}>
            {items.map(item => (
              <Link key={item.label} to={item.to} style={{ 
                display:'flex', alignItems:'center', gap:14, padding:12, borderRadius:16, textDecoration:'none', transition:'0.3s'
              }} className="dropdown-item-hover">
                <span style={{ fontSize:12, fontWeight:900, color:'var(--brand)', opacity:0.7, background:'var(--brand-bg)', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>{item.label}</div>
                  <div style={{ fontSize:10, color:'var(--text3)', marginTop:2, lineHeight:1.3 }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <header style={{ 
      position:'fixed', top:0, left:0, right:0, zIndex:1000, 
      background: scrolled ? 'rgba(var(--bg-rgb), 0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(30px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      height: scrolled ? 72 : 88, transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="container" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:1400, padding:'0 24px' }}>
        
        {/* Brand */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
           <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg, var(--brand), var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 10px 20px -5px rgba(51,102,255,0.4)', overflow:'hidden', padding:8 }}>
              <img src="/logo.png" alt="RemoteTeam" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
           </div>
           <span style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.03em', color:'var(--text)' }}>
             Remote<span style={{ color:'var(--brand)' }}>Team</span>
           </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-only" style={{ display:'flex', alignItems:'center', gap:2, height:'100%' }}>
           <NavItem label={t('nav.home', 'Home')} to="/" />
           <NavItem label={t('nav.about', 'About Us')} to="/about" />
           <NavItem label={t('nav.product', 'Product')} items={PRODUCT_MENU} />
           <NavItem label={t('nav.solutions', 'Solutions')} items={SOLUTIONS_MENU} />
           <NavItem label={t('nav.enterprise', 'Enterprise')} items={ENTERPRISE_MENU} />
           <NavItem label={t('nav.platform', 'Platform')} items={PLATFORM_MENU} />
           {isAuth && <NavItem label={t('nav.pricing', 'Pricing')} to="/dashboard" />}
        </nav>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          
          {/* Language Switcher Dropdown */}
          <div className="desktop-only" style={{ position:'relative' }} ref={langRef}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background: showLangMenu ? 'var(--brand-bg)' : 'var(--bg3)',
                border:`1px solid ${showLangMenu ? 'var(--brand)' : 'var(--border)'}`,
                color: showLangMenu ? 'var(--brand)' : 'var(--text2)',
                borderRadius:10, padding:'7px 12px', fontSize:12, fontWeight:800, cursor:'pointer', transition:'0.2s'
              }}
            >
              <Globe size={13} />
              {LANGS.find(l => l.code === (lang||'en'))?.flag} {LANGS.find(l => l.code === (lang||'en'))?.label}
              <ChevronDown size={11} style={{ opacity:0.6, transform: showLangMenu ? 'rotate(180deg)' : 'none', transition:'0.2s' }} />
            </button>
            {showLangMenu && (
              <div style={{
                position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:160,
                background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14,
                padding:6, boxShadow:'0 20px 50px rgba(0,0,0,0.4)', zIndex:500,
                animation:'fadeIn 0.15s ease'
              }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang && setLang(l.code); setShowLangMenu(false); }}
                    style={{
                      display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px',
                      borderRadius:10, background: (lang||'en')===l.code ? 'var(--brand-bg)' : 'transparent',
                      border:'none', color:(lang||'en')===l.code ? 'var(--brand)' : 'var(--text2)',
                      fontSize:13, fontWeight:700, cursor:'pointer', transition:'0.15s', textAlign:'left'
                    }}>
                    <span style={{ fontSize:16 }}>{l.flag}</span>
                    <span>{l.name}</span>
                    {(lang||'en')===l.code && <span style={{ marginLeft:'auto', fontSize:10, color:'var(--brand)' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuth && (
            <button
              onClick={() => navigate('/call?room=' + Math.random().toString(36).slice(2, 8).toUpperCase())}
              title="Start Video Call"
              style={{ background: 'rgba(51,102,255,0.1)', border: '1px solid rgba(51,102,255,0.2)', borderRadius: 10, padding: '8px', cursor: 'pointer', color: 'var(--brand)', display: 'flex', alignItems: 'center' }}
            >
              <Video size={18} />
            </button>
          )}
          {isAuth && <NotificationBadge />}
          
          <div className="desktop-only">
            <ThemeSwitcher />
          </div>

          {isAuth ? (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <Button variant="secondary" onClick={() => navigate('/dashboard')} size="sm" className="font-black desktop-only">{t('nav.dashboard', 'Dashboard')}</Button>
              <Button variant="ghost" onClick={handleLogout} size="sm" className="font-black">{t('auth.logout', 'Sign Out')}</Button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
               <Button variant="secondary" size="sm" className="desktop-only font-black" onClick={() => navigate('/login')}>{t('auth.login.submit', 'Sign In')}</Button>
               <Button variant="primary" size="sm" className="font-black" onClick={() => navigate('/register')}>{t('auth.register.submit', 'Sign Up')}</Button>
            </div>
          )}

          <button className="mobile-only btn-icon" onClick={() => setShowMenu(!showMenu)} style={{ fontSize:22, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'8px 12px', color:'var(--text)', cursor:'pointer' }}>
             {showMenu ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fade-in" style={{ position:'fixed', top: scrolled ? 72 : 88, inset:'0 0 0 0', background:'rgba(6, 11, 24, 0.98)', backdropFilter:'blur(40px)', zIndex:1001, padding:24, overflowY:'auto' }}>
           {/* Language selector mobile */}
           <div style={{ display:'flex', gap:8, marginBottom:24, justifyContent:'center' }}>
             {LANGS.map(l => (
               <button key={l.code} onClick={() => { setLang && setLang(l.code); }}
                 style={{ background: (lang||'en')===l.code ? 'var(--brand)' : 'var(--bg3)', color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:800, cursor:'pointer' }}>
                 {l.flag} {l.label}
               </button>
             ))}
           </div>

           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
              <Link to="/" onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ textAlign:'center' }}>{t('nav.home', 'Home')}</Link>
              <Link to="/about" onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ textAlign:'center' }}>{t('nav.about', 'About Us')}</Link>
           </div>
           
           {[
             { l: t('nav.product', 'Product'), i:PRODUCT_MENU }, { l: t('nav.solutions', 'Solutions'), i:SOLUTIONS_MENU },
             { l: t('nav.enterprise', 'Enterprise'), i:ENTERPRISE_MENU }, { l: t('nav.platform', 'Platform'), i:PLATFORM_MENU }
           ].map(cat => (
             <div key={cat.l} style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:900, color:'var(--brand)', textTransform:'uppercase', letterSpacing:2, marginBottom:10, paddingLeft:12 }}>{cat.l}</div>
                <div style={{ display:'grid', gap:8 }}>
                  {cat.i.map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ display:'flex', alignItems:'center', gap:12 }}>
                       <span style={{ fontSize:11, fontWeight:900, opacity:0.5 }}>{item.icon}</span>
                       <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
             </div>
           ))}

           <div style={{ marginTop:24, display:'grid', gap:10 }}>
             {!isAuth ? (
               <>
                 <Link to="/login" onClick={() => setShowMenu(false)} className="btn btn-secondary" style={{ padding:18, textAlign:'center', borderRadius:16 }}>{t('auth.login.submit', 'Sign In')}</Link>
                 <Link to="/register" onClick={() => setShowMenu(false)} className="btn btn-primary" style={{ padding:18, textAlign:'center', borderRadius:16 }}>{t('auth.register.submit', 'Sign Up')}</Link>
               </>
             ) : (
               <button onClick={handleLogout} className="btn btn-secondary" style={{ padding:18, borderRadius:16 }}>{t('auth.logout', 'Sign Out')}</button>
             )}
             <button onClick={() => { setTheme(theme==='dark'?'light':'dark'); }} className="btn btn-secondary" style={{ padding:16, borderRadius:16 }}>{t('common.toggle_theme', 'Toggle Theme')}</button>
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
        .nav-link-hover:hover { color: var(--brand) !important; background: var(--brand-bg) !important; }
        .dropdown-item-hover:hover { background: rgba(255,255,255,0.05); transform: translateX(6px); }
        .mobile-nav-link {
          padding: 14px 18px; font-size: 14px; font-weight: 800; color: var(--text); text-decoration: none;
          border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: 0.2s; display: block;
        }
        .mobile-nav-link:hover { background: rgba(255,255,255,0.06); }
      `}</style>
    </header>
  )
}
