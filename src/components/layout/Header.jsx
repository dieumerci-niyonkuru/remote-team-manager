import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { auth } from '../../services/api'
import { useT } from '../../i18n'
import toast from 'react-hot-toast'
import NotificationBadge from './NotificationBadge'

export default function Header() {
  const { isAuth, user, logout, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setShowMenu(false), [pathname])

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout(); toast.success('Secure Disconnection Successful'); navigate('/login')
  }

  const PRODUCT_MENU = [
    { label: t.navWorkspaces, to: '/dashboard', desc: t.navWorkspacesDesc, icon: '01' },
    { label: t.navComm, to: '/chat', desc: t.navCommDesc, icon: '02' },
    { label: t.navWiki, to: '/wiki', desc: t.navWikiDesc, icon: '03' },
  ]

  const SOLUTIONS_MENU = [
    { label: t.navTimeline, to: '/calendar', desc: t.navTimelineDesc, icon: '04' },
    { label: t.navAssets, to: '/files', desc: t.navAssetsDesc, icon: '05' },
    { label: t.navHealth, to: '/health', desc: t.navHealthDesc, icon: '06' },
  ]

  const ENTERPRISE_MENU = [
    { label: t.navSecurity, to: '/security', desc: t.navSecurityDesc, icon: '07' },
    { label: t.navCompliance, to: '/compliance', desc: t.navComplianceDesc, icon: '08' },
    { label: t.navMultiTenant, to: '/multi-tenant', desc: t.navMultiTenantDesc, icon: '09' },
  ]

  const PLATFORM_MENU = [
    { label: t.navApi, to: '/api', desc: t.navApiDesc, icon: '10' },
    { label: t.navAuto, to: '/automations', desc: t.navAutoDesc, icon: '11' },
    { label: t.navIntegrations, to: '/integrations', desc: t.navIntegrationsDesc, icon: '12' },
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
      background: scrolled ? 'rgba(var(--bg-rgb), 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(30px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      height: scrolled ? 80 : 100, transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="container" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:1400 }}>
        
        {/* Brand */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
           <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg, var(--brand), #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 10px 20px -5px rgba(51,102,255,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
           </div>
           <span className="logo-font" style={{ fontSize:22, letterSpacing:'-0.03em', lineHeight: 1.1 }}>
             RemoteTeam
           </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-only" style={{ display:'flex', alignItems:'center', gap:2, height:'100%' }}>
           <NavItem label={t.home} to="/" />
           <NavItem label={t.aboutUs} to="/about" />
           <NavItem label={t.product} items={PRODUCT_MENU} />
           <NavItem label={t.solutions} items={SOLUTIONS_MENU} />
           <NavItem label={t.enterprise} items={ENTERPRISE_MENU} />
           <NavItem label={t.platform} items={PLATFORM_MENU} />
           <NavItem label={t.pricing} to="/pricing" />
        </nav>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="btn-icon desktop-only" onClick={() => setLang(lang === 'en' ? 'rw' : lang === 'rw' ? 'fr' : 'en')} style={{ background:'var(--bg3)', borderRadius:14, fontSize:13, fontWeight:800, textTransform: 'uppercase' }}>
             {lang}
          </button>
          
          <NotificationBadge />
          
          <button className="btn-icon desktop-only" onClick={() => setTheme(theme==='dark'?'light':'dark')} style={{ background:'var(--bg3)', borderRadius:14 }}>
             {theme==='dark' ? '☀️' : '🌙'}
          </button>

          {isAuth ? (
            <button className="btn btn-secondary" onClick={handleLogout} style={{ borderRadius:14, padding:'10px 20px', fontWeight:800 }}>{t.exit}</button>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
               <Link to="/login" className="btn btn-secondary desktop-only" style={{ borderRadius:14, padding:'10px 20px', fontWeight:800 }}>{t.login}</Link>
               <Link to="/register" className="btn btn-primary" style={{ borderRadius:14, padding:'10px 24px', fontWeight:800 }}>{t.initialize || t.register}</Link>
            </div>
          )}

          <button className="mobile-only btn-icon" onClick={() => setShowMenu(!showMenu)} style={{ fontSize:24, background:'var(--bg3)', borderRadius:12 }}>
             {showMenu ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Mega Menu */}
      {showMenu && (
        <div className="fade-in" style={{ position:'fixed', top:scrolled ? 80 : 100, inset:'0 0 0 0', background:'rgba(10, 15, 30, 0.98)', backdropFilter:'blur(40px)', zIndex:1001, padding:24, overflowY:'auto' }}>
           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32 }}>
              <Link to="/" onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ textAlign:'center' }}>{t.home}</Link>
              <Link to="/about" onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ textAlign:'center' }}>{t.aboutUs}</Link>
           </div>
           
           {[
             { l: t.product, i:PRODUCT_MENU }, { l: t.solutions, i:SOLUTIONS_MENU },
             { l: t.enterprise, i:ENTERPRISE_MENU }, { l: t.platform, i:PLATFORM_MENU }
           ].map(cat => (
             <div key={cat.l} style={{ marginBottom:24 }}>
                <div style={{ fontSize:12, fontWeight:900, color:'var(--brand)', textTransform:'uppercase', letterSpacing:2, marginBottom:12, paddingLeft:12 }}>{cat.l}</div>
                <div style={{ display:'grid', gap:8 }}>
                  {cat.i.map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ display:'flex', alignItems:'center', gap:12 }}>
                       <span style={{ fontSize:12, fontWeight:900, opacity:0.5 }}>{item.icon}</span>
                       <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
             </div>
           ))}

           <div style={{ marginTop:32, display:'grid', gap:12 }}>
              <Link to="/pricing" onClick={() => setShowMenu(false)} className="mobile-nav-link" style={{ textAlign:'center' }}>{t.pricing}</Link>
             {!isAuth && <Link to="/login" onClick={() => setShowMenu(false)} className="btn btn-secondary" style={{ padding:20, textAlign:'center', borderRadius:20 }}>{t.login}</Link>}
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
               <button onClick={() => { setLang(lang === 'en' ? 'rw' : 'en'); setShowMenu(false); }} className="btn btn-secondary" style={{ padding:16, borderRadius:20, textTransform: 'uppercase', fontWeight: 800 }}>Lang: {lang}</button>
               <button onClick={() => { setTheme(theme==='dark'?'light':'dark'); setShowMenu(false); }} className="btn btn-secondary" style={{ padding:16, borderRadius:20 }}>{t.toggleTheme}</button>
             </div>
           </div>
        </div>
      )}

      <style>{`
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        @media (max-width: 1200px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        .nav-link-hover:hover { color: var(--brand) !important; background: var(--brand-bg) !important; }
        .dropdown-item-hover:hover { background: rgba(255,255,255,0.05); transform: translateX(8px); }
        .mobile-nav-link {
          padding: 16px 20px; font-size: 15px; font-weight: 800; color: var(--text); text-decoration: none;
          border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: 0.2s;
        }
        .mobile-nav-link:active { transform: scale(0.98); }
      `}</style>
    </header>
  )
}
