import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'

export default function Header() {
  const { isAuth, user, logout, theme, setTheme } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout(); toast.success('Goodbye! 👋'); navigate('/login')
  }

  const NAV_GROUPS = [
    {
      label: 'Product',
      items: [
        { to: '/#features', label: 'Features', desc: 'Everything you need to scale' },
        { to: '/automations', label: 'Automations', desc: 'Work smarter, not harder' },
        { to: '/integrations', label: 'Integrations', desc: 'Connect your favorite tools' },
      ]
    },
    {
      label: 'Solutions',
      items: [
        { to: '/hr', label: 'HR & People', desc: 'Manage your global workforce' },
        { to: '/wiki', label: 'Knowledge Base', desc: 'Organize team intelligence' },
        { to: '/files', label: 'File Management', desc: 'Secure cloud storage' },
      ]
    },
    {
      label: 'Enterprise',
      items: [
        { to: '/pricing', label: 'Plans', desc: 'Flexible pricing for any size' },
        { to: '/ai', label: 'AI Power', desc: 'Next-gen productivity tools' },
        { to: '/search', label: 'Deep Search', desc: 'Find anything in seconds' },
      ]
    },
    {
      label: 'Platform',
      items: [
        { to: '/dashboard', label: 'Dashboard', desc: 'Your central mission control' },
        { to: '/workspaces', label: 'Workspaces', desc: 'Isolated team environments' },
        { to: '/chat', label: 'Real-time Chat', desc: 'Instant team communication' },
      ]
    }
  ]

  const isActive = to => to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <header style={{ position:'sticky', top:0, zIndex:1000, background:'rgba(var(--bg-rgb), 0.8)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
      <div className="container" style={{ height:72, display:'flex', alignItems:'center', gap:32 }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, boxShadow:'0 4px 12px rgba(51,102,255,0.3)' }}>R</div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'var(--text)', letterSpacing:'-0.03em' }}>Nexus<span style={{ color:'var(--brand)' }}>Teams</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hide-tablet" style={{ display:'flex', gap:8, flex:1 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="nav-item" style={{ position:'relative', padding:'10px 0' }}>
              <button style={{ background:'none', border:'none', color:'var(--text2)', fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4, padding:'8px 12px', borderRadius:8, transition:'var(--transition)' }} className="btn-ghost">
                {group.label} <span style={{ fontSize:10, opacity:0.5 }}>▼</span>
              </button>
              
              <div className="dropdown-menu">
                <div style={{ padding:8, display:'flex', flexDirection:'column', gap:4 }}>
                  {group.items.map(item => (
                    <Link key={item.label} to={item.to} className="dropdown-item">
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, color:'var(--text)', marginBottom:2 }}>{item.label}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          {/* Theme */}
          <button className="btn-icon" onClick={() => setTheme(theme==='dark'?'light':'dark')} title="Toggle theme">
            {theme==='dark' ? '☀️' : '🌙'}
          </button>

          {isAuth ? (
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <Link to="/notifications" className="btn-icon" style={{ position:'relative' }}>
                🔔
                <div style={{ position:'absolute', top:8, right:8, width:8, height:8, borderRadius:'50%', background:'#dc2626', border:'2px solid var(--bg)' }} />
              </Link>
              
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', border:'2px solid var(--border)' }} onClick={() => navigate('/settings')}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              
              <button className="btn btn-ghost hide-mobile" onClick={handleLogout} style={{ fontSize:13 }}>Logout</button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:10 }}>
              <Link to="/login" className="btn btn-ghost" style={{ padding:'10px 18px' }}>Log in</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding:'10px 20px' }}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
