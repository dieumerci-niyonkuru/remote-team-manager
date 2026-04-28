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
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log('Login attempt with:', form.email)
      const response = await auth.login(form)
      console.log('Login response:', response.data)
      const { access, refresh, user } = response.data.data
      localStorage.setItem('rtm_access', access)
      localStorage.setItem('rtm_refresh', refresh)
      setUser(user)
      toast.success(`Welcome back, ${user.first_name}!`)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      let errorMsg = 'Invalid email or password'
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Please check your internet.'
      }
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={theme} style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div className="card fade-in-up" style={{ maxWidth: 440, width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>R</div>
          <h2>Welcome Back 👋</h2>
          <p style={{ color: 'var(--text2)', marginTop: '0.25rem' }}>Sign in to manage your team</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div style={{ marginTop: '1rem' }}><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1.5rem', padding: '0.8rem' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>Don't have an account? <Link to="/register" style={{ color: '#4f46e5' }}>Sign up</Link></p>
      </div>
    </div>
  )
}
