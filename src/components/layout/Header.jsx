import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'

export default function Header() {
  const { isAuth, user, logout, theme, setTheme, lang, setLang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout(); toast.success('Goodbye! 👋'); navigate('/login')
  }

  const navLinks = [
    { to: '/', label: t.home },
    { to: '/#features', label: t.features },
    ...(isAuth ? [
      { to: '/dashboard', label: t.dashboard },
      { to: '/workspaces', label: t.workspaces },
      { to: '/team', label: t.team },
      { to: '/activity', label: t.activity },
      { to: '/chat', label: 'Chat' },
      { to: '/calendar', label: 'Calendar' },
      { to: '/hr', label: 'HR' },
      { to: '/files', label: 'Files' },
      { to: '/ai', label: '🧠 AI' },
      { to: '/automations', label: '⚡ Automations' },
    ] : []),
  ]

  const isActive = to => to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(var(--bg-rgb, 6,11,24),0.85)', backdropFilter:'blur(16px)', borderBottom:`1px solid var(--border)` }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', gap:16 }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#3366ff,#6699ff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontWeight:800, fontSize:16 }}>R</div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text)', letterSpacing:'-0.02em' }}>Remote<span style={{ color:'#3366ff' }}>Team</span></span>
        </Link>

        {/* Nav */}
        <nav style={{ display:'flex', gap:2, flex:1, justifyContent:'center' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{ padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:isActive(l.to) ? 600 : 500, color:isActive(l.to) ? '#3366ff' : 'var(--text2)', background:isActive(l.to) ? 'var(--brand-bg)' : 'transparent', textDecoration:'none', transition:'var(--transition)', whiteSpace:'nowrap' }}
              onMouseEnter={e => { if (!isActive(l.to)) { e.target.style.color='var(--text)'; e.target.style.background='var(--brand-bg)' }}}
              onMouseLeave={e => { if (!isActive(l.to)) { e.target.style.color='var(--text2)'; e.target.style.background='transparent' }}}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          {/* Language */}
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 8px', fontSize:12, color:'var(--text2)', cursor:'pointer', outline:'none' }}>
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="rw">🇷🇼 RW</option>
          </select>

          {/* Theme */}
          <button className="btn-icon" onClick={() => setTheme(theme==='dark'?'light':'dark')} title="Toggle theme">
            {theme==='dark' ? '☀️' : '🌙'}
          </button>

          {isAuth ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }} onClick={() => navigate('/dashboard')}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <button className="btn-ghost" onClick={handleLogout} style={{ fontSize:12, padding:'6px 12px' }}>{t.logout}</button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize:13, padding:'8px 16px' }}>{t.login}</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize:13, padding:'8px 16px' }}>{t.register}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
