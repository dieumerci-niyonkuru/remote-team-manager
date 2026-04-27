import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { setUser, theme, lang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = t.required
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.invalidEmail
    if (!form.password) e.password = t.required
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await auth.login(form)
      localStorage.setItem('rtm_access', res.data.data.access)
      localStorage.setItem('rtm_refresh', res.data.data.refresh)
      setUser(res.data.data.user)
      toast.success(`Welcome back, ${res.data.data.user.first_name}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className={theme} style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'stretch', background:'var(--bg)' }}>
      {/* Left */}
      <div style={{ flex:1, background:'linear-gradient(135deg,#060b18,#0f2043,#060b18)', display:'flex', flexDirection:'column', justifyContent:'center', padding:48, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(51,102,255,0.1)', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(139,92,246,0.08)', filter:'blur(40px)' }} />
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:48, marginBottom:8 }} className="float">🚀</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px, 3vw, 42px)', fontWeight:800, color:'#fff', marginBottom:14, lineHeight:1.2 }}>Collaborate<br />without borders</h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, lineHeight:1.7, maxWidth:340, marginBottom:36 }}>Manage your remote team, track tasks, and ship faster — all in one workspace.</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {[['70+','Tests'],['4','Roles'],['Live','API'],['3','Languages']].map(([v,l]) => (
              <div key={l} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 16px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#fff' }}>{v}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ width:'min(440px, 100%)', background:'var(--bg2)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 40px' }}>
        <div className="fade-in">
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>{t.welcomeBack} 👋</h2>
          <p style={{ color:'var(--text2)', fontSize:14, marginBottom:32 }}>Sign in to manage your remote team</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label className="label">{t.email}</label>
              <input className={`input ${errors.email?'error':''}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm({...form, email:e.target.value}); setErrors({...errors, email:''}) }} />
              {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
            </div>
            <div>
              <label className="label">{t.password}</label>
              <input className={`input ${errors.password?'error':''}`} type="password" placeholder="••••••••" value={form.password} onChange={e => { setForm({...form, password:e.target.value}); setErrors({...errors, password:''}) }} />
              {errors.password && <div className="error-msg">⚠ {errors.password}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding:13, fontSize:15, borderRadius:10, marginTop:4 }}>
              {loading ? <div className="spinner" style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff' }} /> : `${t.login} →`}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', marginTop:20 }}>
            {t.noAccount}{' '}
            <Link to="/register" style={{ color:'#3366ff', fontWeight:700, textDecoration:'none' }}>{t.signupFree}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
