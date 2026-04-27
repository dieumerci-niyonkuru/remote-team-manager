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
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = t.required
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.invalidEmail
    if (!form.password) e.password = t.required
    setErrors(e)
    return Object.keys(e).length === 0
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={theme} style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div className="card fade-in-up" style={{ maxWidth: 440, width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 1rem', borderRadius: '16px', background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>R</div>
          <h2>{t.welcomeBack} 👋</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Sign in to manage your remote team</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label className="label">{t.email}</label>
            <input className={`input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }} />
          </div>
          <div>
            <label className="label">{t.password}</label>
            <input className={`input ${errors.password ? 'error' : ''}`} type="password" placeholder="••••••••" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: '0.8rem' }}>
            {loading ? <div className="spinner" style={{ width: '1rem', height: '1rem' }} /> : `${t.login} →`}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          {t.noAccount} <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600 }}>{t.signupFree}</Link>
        </p>
      </div>
    </div>
  )
}
