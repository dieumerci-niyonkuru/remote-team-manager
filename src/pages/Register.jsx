import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const { setUser, theme, lang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', first_name:'', last_name:'', password:'', password2:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(p => ({...p,[k]:v})); setErrors(p => ({...p,[k]:''})) }

  const validate = () => {
    const e = {}
    if (!form.first_name) e.first_name = t.required
    if (!form.last_name) e.last_name = t.required
    if (!form.email) e.email = t.required
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.invalidEmail
    if (!form.password) e.password = t.required
    else if (form.password.length < 8) e.password = t.passMin
    if (form.password !== form.password2) e.password2 = t.passMismatch
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await auth.register(form)
      localStorage.setItem('rtm_access', res.data.data.access)
      localStorage.setItem('rtm_refresh', res.data.data.refresh)
      setUser(res.data.data.user)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(typeof msg === 'object' ? Object.values(msg).flat()[0] : msg || 'Registration failed')
    } finally { setLoading(false) }
  }

  const F = ({ name, label, type='text', placeholder }) => (
    <div>
      <label className="label">{label}</label>
      <input className={`input ${errors[name]?'error':''}`} type={type} placeholder={placeholder} value={form[name]} onChange={e => set(name, e.target.value)} />
      {errors[name] && <div className="error-msg">⚠ {errors[name]}</div>}
    </div>
  )

  return (
    <div className={theme} style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <div className="card fade-in" style={{ width:'100%', maxWidth:480, padding:40 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#3366ff,#6699ff)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:22, fontWeight:800, color:'#fff', fontFamily:'var(--font-display)' }}>R</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:'var(--text)', marginBottom:6 }}>Create your account</h2>
          <p style={{ color:'var(--text2)', fontSize:14 }}>Start collaborating with your team today</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <F name="first_name" label={t.firstName} placeholder="John" />
            <F name="last_name" label={t.lastName} placeholder="Doe" />
          </div>
          <F name="email" label={t.email} type="email" placeholder="you@example.com" />
          <F name="password" label={t.password} type="password" placeholder="Min 8 characters" />
          <F name="password2" label={t.confirmPass} type="password" placeholder="Repeat password" />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding:13, fontSize:15, borderRadius:10, marginTop:6, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading ? <div className="spinner" style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff' }} /> : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', marginTop:20 }}>
          {t.hasAccount}{' '}<Link to="/login" style={{ color:'#3366ff', fontWeight:700, textDecoration:'none' }}>{t.login}</Link>
        </p>
      </div>
    </div>
  )
}
