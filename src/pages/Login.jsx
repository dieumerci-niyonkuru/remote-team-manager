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
    <div className={theme} style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <div className="card fade-in" style={{ width:'100%', maxWidth:440, padding:48, background:'var(--bg-card)', backdropFilter:'blur(20px)' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:26, fontWeight:800, color:'#fff', boxShadow:'0 8px 20px rgba(51,102,255,0.3)' }}>R</div>
          <h2 style={{ fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:8 }}>Welcome Back</h2>
          <p style={{ color:'var(--text2)', fontSize:15 }}>Access your workspace to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:20 }}>
            <label className="label" style={{ marginBottom:8, fontSize:13 }}>Professional Email</label>
            <input className="input" type="email" placeholder="john@company.com" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
          </div>
          
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <label className="label" style={{ marginBottom:0, fontSize:13 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize:12, color:'var(--brand)', textDecoration:'none', fontWeight:600 }}>Forgot?</Link>
            </div>
            <input className="input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:16, fontSize:16, borderRadius:14 }}>
            {loading ? <div className="spinner" style={{ width:20, height:20, border:'3px solid rgba(255,255,255,0.3)', borderTop:'3px solid #fff' }} /> : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:14, color:'var(--text2)', marginTop:32 }}>
          New to NexusTeams? <Link to="/register" style={{ color:'var(--brand)', fontWeight:700, textDecoration:'none' }}>Create Account</Link>
        </p>
      </div>
    </div>
  )
}
