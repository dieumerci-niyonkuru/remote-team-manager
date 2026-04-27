import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

const getStrength = (pass) => {
  let s = 0
  if (!pass) return { score: 0, text: '', color: '' }
  if (pass.length >= 8) s++
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) s++
  if (/\d/.test(pass)) s++
  if (/[^a-zA-Z0-9]/.test(pass)) s++
  if (s === 1) return { score: 1, text: 'Weak', color: '#ef4444' }
  if (s === 2) return { score: 2, text: 'Medium', color: '#f59e0b' }
  if (s >= 3) return { score: 3, text: 'Strong', color: '#10b981' }
  return { score: 0, text: 'Very weak', color: '#ef4444' }
}

export default function Register() {
  const { setUser, theme, lang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', password2: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const strength = getStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.first_name) e.first_name = t.required
    if (!form.last_name) e.last_name = t.required
    if (!form.email) e.email = t.required
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.invalidEmail
    if (!form.password) e.password = t.required
    else if (form.password.length < 8) e.password = t.passMin
    if (form.password !== form.password2) e.password2 = t.passMismatch
    if (strength.score < 2) e.password = 'Password is too weak. Use 8+ chars, mixed case, numbers, symbols.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await auth.register(form)
      // The backend returns { data: { user, access, refresh }, message }
      const { user, access, refresh } = res.data.data
      localStorage.setItem('rtm_access', access)
      localStorage.setItem('rtm_refresh', refresh)
      setUser(user)
      toast.success('Account created successfully! 🎉 Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(typeof msg === 'object' ? Object.values(msg).flat()[0] : msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={theme} style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1.5rem' }}>
      <div className="card fade-in-up" style={{ maxWidth: 480, width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 48, height: 48, margin: '0 auto 1rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>R</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create your account</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Start collaborating with your team today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">{t.firstName}</label>
              <input className={`input ${errors.first_name ? 'error' : ''}`} placeholder="John" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              {errors.first_name && <div className="error-msg">⚠ {errors.first_name}</div>}
            </div>
            <div>
              <label className="label">{t.lastName}</label>
              <input className={`input ${errors.last_name ? 'error' : ''}`} placeholder="Doe" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              {errors.last_name && <div className="error-msg">⚠ {errors.last_name}</div>}
            </div>
          </div>
          <div>
            <label className="label">{t.email}</label>
            <input className={`input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
          </div>
          <div>
            <label className="label">{t.password}</label>
            <input className={`input ${errors.password ? 'error' : ''}`} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {form.password && (
              <>
                <div className="progress-bar" style={{ marginTop: '0.5rem', height: '4px', background: 'var(--border)', borderRadius: '4px' }}>
                  <div className="progress-fill" style={{ width: `${strength.score * 33}%`, background: strength.color, height: '100%', borderRadius: '4px', transition: 'width 0.2s' }} />
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: strength.color }}>{strength.text}</div>
              </>
            )}
            {errors.password && <div className="error-msg">⚠ {errors.password}</div>}
          </div>
          <div>
            <label className="label">{t.confirmPass}</label>
            <input className={`input ${errors.password2 ? 'error' : ''}`} type="password" placeholder="Repeat password" value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} />
            {errors.password2 && <div className="error-msg">⚠ {errors.password2}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: '0.75rem' }}>
            {loading ? <div className="spinner" style={{ width: '1rem', height: '1rem' }} /> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text2)', marginTop: '1.5rem' }}>
          {t.hasAccount} <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>{t.login}</Link>
        </p>
      </div>
    </div>
  )
}
