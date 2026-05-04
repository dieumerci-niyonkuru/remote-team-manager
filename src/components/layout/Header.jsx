import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

export default function Header() {
  const { isAuth, user, logout, theme, setTheme } = useStore()
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

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))
  }

  const PRODUCT_MENU = [
    { label: 'Workspaces', to: '/dashboard', desc: 'Secure nodes for team collaboration', icon: '📊' },
    { label: 'Communications', to: '/chat', desc: 'Unified secure frequency', icon: '💬' },
    { label: 'Knowledge Base', to: '/wiki', desc: 'Intelligence repository', icon: '📚' },
  ]

  const OPERATIONS_MENU = [
    { label: 'Mission Timeline', to: '/calendar', desc: 'Global synchronization', icon: '📅' },
    { label: 'Asset Library', to: '/files', desc: 'Encrypted cloud storage', icon: '📁' },
    { label: 'Resource Health', to: '/health', desc: 'System telemetry', icon: '🏥' },
  ]

  const RESOURCES_MENU = [
    { label: 'API Documentation', to: '/api', desc: 'Developer neural link', icon: '🔌' },
    { label: 'Community Hub', to: '/community', desc: 'Innovator network', icon: '👥' },
    { label: 'Support Center', to: '/support', desc: '24/7 technical access', icon: '🛰️' },
  ]

  const COMPANY_MENU = [
    { label: 'Our Mission', to: '/about', desc: 'The vision for Rwanda', icon: '💎' },
    { label: 'Global Nodes', to: '/nodes', desc: 'Regional HQ map', icon: '🌍' },
    { label: 'Careers', to: '/careers', desc: 'Join the revolution', icon: '🚀' },
  ]

  const ALL_ITEMS = [...PRODUCT_MENU, ...OPERATIONS_MENU, ...RESOURCES_MENU, ...COMPANY_MENU]

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
            fontSize:13, fontWeight:800, padding:'8px 12px', borderRadius:10, transition:'0.2s',
            background: pathname === to ? 'var(--brand-bg)' : 'transparent'
          }} className="nav-link-hover">{label}</Link>
        ) : (
          <button style={{ 
            background:'none', border:'none', color: activeDropdown === label ? 'var(--brand)' : 'var(--text2)', 
            fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:4, padding:'8px 12px'
          }} className="nav-link-hover">
            {label} <span style={{ fontSize:10, opacity:0.5 }}>▼</span>
          </button>
        )}

        {hasItems && activeDropdown === label && (
          <div className="glass fade-in" style={{ 
            position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:280, padding:12, borderRadius:20, 
            boxShadow:'0 30px 60px rgba(0,0,0,0.3)', zIndex:100, border:'1px solid var(--border)', background:'var(--bg-card)'
          }}>
            {items.map(item => (
              <Link key={item.label} to={item.to} style={{ 
                display:'flex', alignItems:'center', gap:12, padding:10, borderRadius:12, textDecoration:'none', transition:'0.2s'
              }} className="dropdown-item-hover">
                <span style={{ fontSize:20 }}>{item.icon}</span>
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
      background: scrolled ? 'rgba(var(--bg-rgb), 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      height: scrolled ? 72 : 88, transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="container" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        
        {/* Brand */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
           <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 10px 20px -5px rgba(51,102,255,0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
           </div>
           <span className="logo-font" style={{ fontSize:22, letterSpacing:'-0.03em' }}>NexusTeams</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hide-tablet" style={{ display:'flex', alignItems:'center', gap:2, height:'100%' }}>
           <NavItem label="Home" to="/" />
           <NavItem label="Platform" items={PRODUCT_MENU} />
           <NavItem label="Operations" items={OPERATIONS_MENU} />
           <NavItem label="Resources" items={RESOURCES_MENU} />
           <NavItem label="Company" items={COMPANY_MENU} />
           <NavItem label="About" to="/about" />
        </nav>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button className="btn-icon" onClick={() => setTheme(theme==='dark'?'light':'dark')} style={{ background:'var(--bg2)', borderRadius:14 }}>
             {theme==='dark' ? '☀️' : '🌙'}
          </button>

          {isAuth ? (
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
               <div style={{ textAlign:'right' }} className="hide-tablet">
                  <div style={{ fontSize:13, fontWeight:900, color:'var(--text)' }}>{user?.first_name}</div>
                  <div style={{ fontSize:10, color:'#10b981', fontWeight:900 }}>NODE ONLINE</div>
               </div>
               <button className="btn btn-secondary" onClick={handleLogout} style={{ borderRadius:14, padding:'12px 24px', fontWeight:800 }}>Logout</button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:12 }}>
               <Link to="/login" className="btn btn-secondary" style={{ borderRadius:14, padding:'12px 24px', fontWeight:800 }}>Login</Link>
               <Link to="/register" className="btn btn-primary" style={{ borderRadius:14, padding:'12px 28px', fontWeight:800 }}>Initialize</Link>
            </div>
          )}

          <button className="hide-desktop btn-icon" onClick={() => setShowMenu(!showMenu)} style={{ fontSize:24 }}>
             {showMenu ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fade-in" style={{ position:'fixed', top:scrolled ? 72 : 96, inset:'0 0 0 0', background:'var(--bg)', zIndex:1001, padding:24, display:'flex', flexDirection:'column', gap:12, overflowY:'auto' }}>
           {isAuth && <button onClick={() => { openCommandPalette(); setShowMenu(false); }} className="mobile-nav-link" style={{ background:'var(--brand-bg)', color:'var(--brand)', border:'1px solid var(--brand)' }}>🔍 Open Command Bridge</button>}
           {[...PRODUCT_MENU, ...SOLUTIONS_MENU].map(i => (
             <Link key={i.to} to={i.to} className="mobile-nav-link" style={{ display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:24 }}>{i.icon}</span>
                <span>{i.label}</span>
             </Link>
           ))}
           {isAuth ? (
             <button onClick={handleLogout} className="btn btn-primary" style={{ padding:20, borderRadius:20, marginTop:24 }}>Secure Logout</button>
           ) : (
             <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:24 }}>
               <Link to="/login" className="btn btn-secondary" style={{ padding:20, textAlign:'center', textDecoration:'none', borderRadius:20 }}>Login</Link>
               <Link to="/register" className="btn btn-primary" style={{ padding:20, textAlign:'center', textDecoration:'none', borderRadius:20 }}>Initialize</Link>
             </div>
           )}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) { .hide-tablet { display: none !important; } }
        @media (min-width: 1025px) { .hide-desktop { display: none !important; } }
        .nav-link-hover:hover { color: var(--brand) !important; background: var(--brand-bg) !important; }
        .dropdown-item-hover:hover { background: var(--brand-bg); transform: translateX(4px); }
        .mobile-nav-link {
          padding: 20px; font-size: 18px; font-weight: 800; color: var(--text); text-decoration: none;
          border-radius: 20px; background: var(--bg2); transition: 0.2s;
        }
      `}</style>
    </header>
  )
}
