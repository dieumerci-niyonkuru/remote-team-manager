import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { setUser, theme } = useStore()
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
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24, position:'relative', overflow:'hidden' }}>
      <div className="moving-code-bg" />
      
      <div className="card fade-in" style={{ width:'100%', maxWidth:440, padding:56, background:'rgba(var(--bg-card-rgb), 0.7)', backdropFilter:'blur(40px)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 40px 100px -20px rgba(0,0,0,0.5)', borderRadius:32 }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <Link to="/" style={{ display:'inline-flex', width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', alignItems:'center', justifyContent:'center', color:'#fff', margin:'0 auto 24px', boxShadow:'0 10px 25px -5px rgba(51,102,255,0.5)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </Link>
          <h2 style={{ fontSize:32, fontWeight:900, color:'var(--text)', marginBottom:12, letterSpacing:'-0.03em' }}>Welcome Back</h2>
          <p style={{ color:'var(--text2)', fontSize:16, fontWeight:500 }}>Enter your credentials to access NexusTeams</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:24 }}>
            <label className="label" style={{ marginBottom:10, fontSize:13, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:1 }}>Professional Email</label>
            <input className="input" type="email" placeholder="john@company.com" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} style={{ padding:'18px 24px', fontSize:16, borderRadius:16 }} />
          </div>
          
          <div style={{ marginBottom:40 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <label className="label" style={{ marginBottom:0, fontSize:13, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:1 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize:13, color:'var(--brand)', textDecoration:'none', fontWeight:700 }}>Forgot Password?</Link>
            </div>
            <input className="input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({...form, password:e.target.value})} style={{ padding:'18px 24px', fontSize:16, borderRadius:16 }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:'20px', fontSize:18, borderRadius:18, fontWeight:800 }}>
            {loading ? <div className="spinner" style={{ width:24, height:24, border:'3px solid rgba(255,255,255,0.3)', borderTop:'3px solid #fff' }} /> : 'Sign In to Workspace ➜'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:15, color:'var(--text2)', marginTop:40, fontWeight:500 }}>
          New to NexusTeams? <Link to="/register" style={{ color:'var(--brand)', fontWeight:800, textDecoration:'none' }}>Create Account</Link>
        </p>
      </div>
    </div>
  )
}
