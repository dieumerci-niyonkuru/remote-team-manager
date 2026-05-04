import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { auth } from '../../services/api'
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
    logout(); toast.success('Goodbye! 👋'); navigate('/login')
  }

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
            fontSize:14, fontWeight:700, padding:'8px 16px', borderRadius:10, transition:'0.2s',
            background: pathname === to ? 'var(--brand-bg)' : 'transparent'
          }} className="nav-link-hover">{label}</Link>
        ) : (
          <button style={{ 
            background:'none', border:'none', color: activeDropdown === label ? 'var(--brand)' : 'var(--text2)', 
            fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, padding:'8px 16px'
          }} className="nav-link-hover">
            {label} <span style={{ fontSize:10, opacity:0.5, transform: activeDropdown === label ? 'rotate(180deg)' : 'none', transition:'0.2s' }}>▼</span>
          </button>
        )}

        {hasItems && activeDropdown === label && (
          <div className="glass fade-in" style={{ 
            position:'absolute', top:'100%', left:0, width:260, padding:12, borderRadius:20, 
            boxShadow:'0 20px 40px rgba(0,0,0,0.2)', zIndex:100, border:'1px solid var(--border)'
          }}>
            {items.map(item => (
              <Link key={item.label} to={item.to} style={{ 
                display:'flex', flexDirection:'column', padding:12, borderRadius:12, textDecoration:'none', transition:'0.2s'
              }} className="dropdown-item-hover">
                <span style={{ fontSize:14, fontWeight:800, color:'var(--text)' }}>{item.label}</span>
                <span style={{ fontSize:11, color:'var(--text3)', marginTop:4, lineHeight:1.3 }}>{item.desc}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const PRODUCT_MENU = [
    { label: 'Workspaces', to: '/dashboard', desc: 'Secure nodes for team collaboration' },
    { label: 'Automations', to: '/automations', desc: 'Work smarter with AI workflows' },
    { label: 'Security', to: '/security', desc: 'Enterprise-grade bank security' },
    { label: 'Integrations', to: '/integrations', desc: 'Connect your favorite toolkits' },
  ]

  const SOLUTIONS_MENU = [
    { label: 'Remote Teams', to: '/remote', desc: 'Bridge the gap between borders' },
    { label: 'Enterprise HQ', to: '/enterprise', desc: 'Scalable infrastructure for growth' },
    { label: 'Startup Hub', to: '/startups', desc: 'Launch and scale with precision' },
    { label: 'Rwanda Connect', to: '/rwanda', desc: 'Specialized nodes for regional growth' },
  ]

  const RESOURCES_MENU = [
    { label: 'Documentation', to: '/wiki', desc: 'Full API and platform guides' },
    { label: 'Timeline', to: '/calendar', desc: 'Track every mission milestone' },
    { label: 'Asset Library', to: '/files', desc: 'Secure cloud-based storage' },
    { label: 'Community', to: '/community', desc: 'Connect with global innovators' },
  ]

  const COMPANY_MENU = [
    { label: 'About Us', to: '/about', desc: 'Our mission to unify teams' },
    { label: 'Careers', to: '/careers', desc: 'Join the NexusTeams revolution' },
    { label: 'Global Map', to: '/#footer', desc: 'Our presence in Kigali and beyond' },
    { label: 'Contact', to: '/contact', desc: '24/7 technical support access' },
  ]

  return (
    <header style={{ 
      position:'sticky', top:0, zIndex:1000, 
      background: scrolled ? 'rgba(var(--bg-rgb), 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      height: 80, transition: '0.3s'
    }}>
      <div className="container" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        
        {/* Brand */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none', flexShrink:0 }}>
           <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 10px 20px -5px rgba(51,102,255,0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
           </div>
           <span className="logo-font" style={{ fontSize:24 }}>NexusTeams</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hide-tablet" style={{ display:'flex', alignItems:'center', gap:4, height:'100%' }}>
           <NavItem label="Home" to="/" />
           <NavItem label="Product" items={PRODUCT_MENU} />
           <NavItem label="Solutions" items={SOLUTIONS_MENU} />
           <NavItem label="Resources" items={RESOURCES_MENU} />
           <NavItem label="Company" items={COMPANY_MENU} />
        </nav>

        {/* Controls */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
           <button className="btn-icon" onClick={() => setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark' ? '☀️' : '🌙'}
           </button>

           <div className="hide-tablet">
              {isAuth ? (
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                   <div style={{ width:40, height:40, borderRadius:12, overflow:'hidden', border:'2px solid var(--border)', cursor:'pointer' }} onClick={() => navigate('/settings')}>
                      {user?.avatar ? <img src={user.avatar} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>👤</div>}
                   </div>
                   <button className="btn btn-secondary" onClick={handleLogout} style={{ padding:'10px 20px', fontSize:14 }}>Sign Out</button>
                </div>
              ) : (
                <div style={{ display:'flex', gap:12 }}>
                   <Link to="/login" className="btn btn-secondary" style={{ padding:'12px 24px', textDecoration:'none', fontSize:14 }}>Log in</Link>
                   <Link to="/register" className="btn btn-primary" style={{ padding:'12px 28px', textDecoration:'none', fontSize:14 }}>Get Started</Link>
                </div>
              )}
           </div>

           {/* Burger Toggle */}
           <button className="hide-desktop btn-icon" onClick={() => setShowMenu(!showMenu)} style={{ fontSize:24 }}>
              {showMenu ? '✕' : '☰'}
           </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMenu && (
        <div className="glass" style={{ 
          position:'fixed', top:80, inset: '80px 0 0 0', zIndex: 1001, padding:24, display:'flex', flexDirection:'column', gap:12,
          animation: 'slideInLeft 0.3s ease-out', background: 'var(--bg)', overflowY:'auto'
        }}>
           <Link to="/" className="mobile-nav-link">Home</Link>
           <div style={{ padding:'10px 18px', fontSize:12, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Platform</div>
           {PRODUCT_MENU.map(i => <Link key={i.to} to={i.to} className="mobile-nav-link">{i.label}</Link>)}
           <div style={{ padding:'10px 18px', fontSize:12, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginTop:20 }}>Organization</div>
           {COMPANY_MENU.map(i => <Link key={i.to} to={i.to} className="mobile-nav-link">{i.label}</Link>)}
           
           {isAuth ? (
             <button onClick={handleLogout} className="btn btn-primary" style={{ marginTop:24, padding:18 }}>Sign Out</button>
           ) : (
             <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:24 }}>
               <Link to="/login" className="btn btn-secondary" style={{ padding:18, textAlign:'center', textDecoration:'none' }}>Log In</Link>
               <Link to="/register" className="btn btn-primary" style={{ padding:18, textAlign:'center', textDecoration:'none' }}>Get Started</Link>
             </div>
           )}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) { .hide-tablet { display: none !important; } }
        @media (min-width: 1025px) { .hide-desktop { display: none !important; } }
        .nav-link-hover:hover { color: var(--brand) !important; }
        .dropdown-item-hover:hover { background: var(--brand-bg); }
        .mobile-nav-link {
          padding: 18px;
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          text-decoration: none;
          border-radius: 16px;
          background: var(--bg2);
          transition: 0.2s;
        }
        .mobile-nav-link:active { transform: scale(0.98); background: var(--border); }
      `}</style>
    </header>
  )
}
