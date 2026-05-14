import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import { useT } from '../i18n'
import toast from 'react-hot-toast'

export default function Login() {
  const { setUser, theme, lang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async ev => {
    ev.preventDefault()
    setLoading(true)
    try {
      const { data } = await auth.login(form)
      localStorage.setItem('rtm_access', data.data.access)
      localStorage.setItem('rtm_refresh', data.data.refresh)
      setUser(data.data.user)
      toast.success(t.welcomeBack || 'Secure Connection Established')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      let msg = t.enterCreds || 'Unauthorized: Check Credentials'
      if (data) {
        if (data.message) msg = data.message
        else if (data.detail) msg = data.detail
        else if (typeof data === 'object') {
          const errors = Object.values(data).flat()
          if (errors.length > 0) msg = errors[0]
        }
      }
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'100px 24px', position:'relative', overflow:'hidden' }}>
      <div className="moving-code-bg" />
      
      <div className="card glass-premium fade-in" style={{ width:'100%', maxWidth:500, padding:56, borderRadius:40, boxShadow:'0 50px 100px -20px rgba(0,0,0,0.5)', position:'relative', zIndex:10 }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <Link to="/" style={{ display:'inline-flex', width:72, height:72, borderRadius:20, background:'linear-gradient(135deg, var(--brand), #8b5cf6)', alignItems:'center', justifyContent:'center', color:'#fff', margin:'0 auto 24px', boxShadow:'0 15px 30px -5px rgba(51,102,255,0.4)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
          </Link>
          <h2 style={{ fontSize:36, fontWeight:900, color:'var(--text)', marginBottom:12, letterSpacing:'-0.03em' }}>{t.welcomeBack}</h2>
          <p style={{ color:'var(--text2)', fontSize:16, fontWeight:500 }}>{t.enterCreds}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:28 }}>
          <div>
            <label className="label" style={{ marginBottom:12, fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1.5 }}>{t.neuralId}</label>
            <input className="input" type="email" placeholder="email@company.com" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} style={{ padding:'18px 24px', fontSize:16, borderRadius:16 }} />
          </div>
          
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <label className="label" style={{ marginBottom:0, fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1.5 }}>{t.accessKey}</label>
              <Link to="/forgot-password" style={{ fontSize:12, color:'var(--brand)', textDecoration:'none', fontWeight:800 }}>{t.recoverKey}</Link>
            </div>
            <input className="input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({...form, password:e.target.value})} style={{ padding:'18px 24px', fontSize:16, borderRadius:16 }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:'20px', fontSize:18, borderRadius:20, fontWeight:900, marginTop:12 }}>
            {loading ? t.authorizing : t.establishConn}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:15, color:'var(--text2)', marginTop:48, fontWeight:600 }}>
          {t.newToWs} <Link to="/register" style={{ color:'var(--brand)', fontWeight:800, textDecoration:'none' }}>{t.joinMission}</Link>
        </p>
      </div>

      <style>{`
        .glass-premium { background: rgba(var(--bg-card-rgb), 0.7); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.05); }
      `}</style>
    </div>
  )
}
