import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV = isAuth ? [
    { to:'/dashboard', label:'Dashboard', icon:'⊞' },
    { to:'/workspaces', label:'Workspaces', icon:'🏢' },
    { to:'/chat', label:'Chat', icon:'💬' },
    { to:'/knowledge', label:'Knowledge', icon:'🧠' },
    { to:'/employees', label:'Employees', icon:'👥' },
    { to:'/performance', label:'Performance', icon:'📊' },
  ] : [
    { to:'/', label:'Home', icon:'' },
    { to:'/#features', label:'Features', icon:'' },
  ]

  const isActive = to => to==='/' ? pathname==='/' : pathname.startsWith(to)

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout(); toast.success('Goodbye! 👋'); navigate('/login')
  }

  return (
    <header style={{ position:'sticky', top:0, zIndex:100, background:theme==='dark'?'rgba(6,11,24,0.9)':'rgba(240,244,255,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)' }}>
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 20px', height:64, display:'flex', alignItems:'center', gap:12 }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#3366ff,#6699ff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontWeight:800, fontSize:16 }}>R</div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>Remote<span style={{ color:'#3366ff' }}>Team</span></span>
        </Link>

        {/* Nav — desktop */}
        <nav style={{ display:'flex', gap:2, flex:1, justifyContent:'center', overflowX:'auto' }}>
          {NAV.map(l => (
            <Link key={l.to} to={l.to} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:isActive(l.to)?600:500, color:isActive(l.to)?'#3366ff':'var(--text2)', background:isActive(l.to)?'var(--brand-bg)':'transparent', textDecoration:'none', transition:'all 0.15s', whiteSpace:'nowrap' }}>
              {l.icon && <span style={{ fontSize:14 }}>{l.icon}</span>}
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 8px', fontSize:12, color:'var(--text2)', cursor:'pointer', outline:'none' }}>
            <option value="en">🇬🇧</option>
            <option value="fr">🇫🇷</option>
            <option value="rw">🇷🇼</option>
          </select>
          <button style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 10px', fontSize:14, cursor:'pointer', color:'var(--text)' }} onClick={() => setTheme(theme==='dark'?'light':'dark')}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          {isAuth ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }} onClick={() => navigate('/dashboard')}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <button style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'5px 10px', fontSize:12, color:'var(--text2)', cursor:'pointer' }} onClick={handleLogout}>{t.logout}</button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:6 }}>
              <Link to="/login" style={{ padding:'7px 14px', borderRadius:8, fontSize:13, color:'var(--text2)', textDecoration:'none', border:'1px solid var(--border)', fontWeight:500 }}>{t.login}</Link>
              <Link to="/register" style={{ padding:'7px 14px', borderRadius:8, fontSize:13, color:'#fff', textDecoration:'none', background:'#3366ff', fontWeight:600 }}>{t.register}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
