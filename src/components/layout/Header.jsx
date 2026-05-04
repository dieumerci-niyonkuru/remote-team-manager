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

  const NavLink = ({ to, label }) => (
    <Link to={to} style={{ 
      textDecoration:'none', color: pathname === to ? 'var(--brand)' : 'var(--text2)', 
      fontSize:15, fontWeight:700, padding:'8px 16px', borderRadius:10, transition:'0.2s',
      background: pathname === to ? 'var(--brand-bg)' : 'transparent'
    }} onMouseEnter={e => !pathname.includes(to) && (e.target.style.color = 'var(--brand)')}
       onMouseLeave={e => !pathname.includes(to) && (e.target.style.color = 'var(--text2)')}>
      {label}
    </Link>
  )

  return (
    <header style={{ 
      position:'sticky', top:0, zIndex:1000, 
      background: scrolled ? 'rgba(var(--bg-rgb), 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      height: 72, transition: '0.3s'
    }}>
      <div className="container" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        
        {/* Brand */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
           <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 8px 16px -4px rgba(51,102,255,0.4)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
           </div>
           <span className="logo-font" style={{ fontSize:22 }}>NexusTeams</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hide-tablet" style={{ display:'flex', alignItems:'center', gap:4 }}>
           <NavLink to="/" label="Home" />
           {isAuth ? (
             <>
               <NavLink to="/dashboard" label="Workspaces" />
               <NavLink to="/chat" label="Communication" />
               <NavLink to="/calendar" label="Timeline" />
               <NavLink to="/wiki" label="Knowledge" />
               <NavLink to="/files" label="Resources" />
             </>
           ) : (
             <NavLink to="/about" label="About Us" />
           )}
        </nav>

        {/* Controls */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
           <button className="btn-icon" onClick={() => setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark' ? '☀️' : '🌙'}
           </button>

           <div className="hide-tablet">
              {isAuth ? (
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                   <div style={{ width:36, height:36, borderRadius:10, overflow:'hidden', border:'2px solid var(--border)', cursor:'pointer' }} onClick={() => navigate('/settings')}>
                      {user?.avatar ? <img src={user.avatar} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>👤</div>}
                   </div>
                   <button className="btn btn-secondary" onClick={handleLogout} style={{ padding:'8px 16px', fontSize:13 }}>Sign Out</button>
                </div>
              ) : (
                <div style={{ display:'flex', gap:10 }}>
                   <Link to="/login" className="btn btn-secondary" style={{ padding:'10px 18px', textDecoration:'none', fontSize:14 }}>Log in</Link>
                   <Link to="/register" className="btn btn-primary" style={{ padding:'10px 20px', textDecoration:'none', fontSize:14 }}>Get Started</Link>
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
          position:'fixed', top:72, inset: '72px 0 0 0', zIndex: 1001, padding:24, display:'flex', flexDirection:'column', gap:12,
          animation: 'slideInLeft 0.3s ease-out', background: 'var(--bg)'
        }}>
           <Link to="/" className="mobile-nav-link">Home</Link>
           {isAuth ? (
             <>
               <Link to="/dashboard" className="mobile-nav-link">Workspaces</Link>
               <Link to="/chat" className="mobile-nav-link">Communication</Link>
               <Link to="/calendar" className="mobile-nav-link">Timeline</Link>
               <Link to="/wiki" className="mobile-nav-link">Knowledge</Link>
               <Link to="/files" className="mobile-nav-link">Resources</Link>
               <button onClick={handleLogout} className="btn btn-primary" style={{ marginTop:24, padding:16 }}>Sign Out</button>
             </>
           ) : (
             <>
               <Link to="/about" className="mobile-nav-link">About Us</Link>
               <Link to="/login" className="btn btn-secondary" style={{ marginTop:24, padding:16, textAlign:'center', textDecoration:'none' }}>Log In</Link>
               <Link to="/register" className="btn btn-primary" style={{ padding:16, textAlign:'center', textDecoration:'none' }}>Get Started</Link>
             </>
           )}
        </div>
      )}

      <style>{`
        @media (max-width: 992px) { .hide-tablet { display: none !important; } }
        @media (min-width: 993px) { .hide-desktop { display: none !important; } }
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
