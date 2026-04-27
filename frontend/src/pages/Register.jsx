import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth, theme } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await authApi.register(form)
      localStorage.setItem('access_token', res.data.data.access)
      localStorage.setItem('refresh_token', res.data.data.refresh)
      setAuth(res.data.data.user)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(', ') : msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={theme} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div className="card animate-fade" style={{ width: '100%', maxWidth: 460, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #3366ff, #6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>R</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Create your account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Start collaborating with your team today</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>First name</label>
              <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="John" required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Last name</label>
              <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Doe" required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email address</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Confirm password</label>
            <input type="password" value={form.password2} onChange={e => setForm({...form, password2: e.target.value})} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, padding: 12, fontSize: 15, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} className="spinner" /> : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3366ff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
