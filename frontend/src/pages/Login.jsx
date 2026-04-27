import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { useStore } from '../store'; import { useT } from '../i18n'; import { auth } from '../services/api'; import toast from 'react-hot-toast'
export default function Login() {
  const { setUser, theme, lang } = useStore(); const t = useT(lang); const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' }); const [errors, setErrors] = useState({}); const [loading, setLoading] = useState(false)
  const validate = () => { const e = {}; if (!form.email) e.email = t.required; else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.invalidEmail; if (!form.password) e.password = t.required; setErrors(e); return !Object.keys(e).length }
  const handleSubmit = async ev => { ev.preventDefault(); if (!validate()) return; setLoading(true); try { const res = await auth.login(form); localStorage.setItem('rtm_access', res.data.data.access); localStorage.setItem('rtm_refresh', res.data.data.refresh); setUser(res.data.data.user); toast.success(`Welcome back, ${res.data.data.user.first_name}! 🎉`); navigate('/dashboard') } catch (err) { toast.error(err.response?.data?.message || 'Invalid credentials') } finally { setLoading(false) } }
  return (
    <div className={theme} style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 440, padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}><div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#3366ff,#6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>R</div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{t.welcomeBack} 👋</h2><p style={{ color: 'var(--text2)', fontSize: 14 }}>Sign in to manage your remote team</p></div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div><label className="label">{t.email}</label><input className={`input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }} />{errors.email && <div className="error-msg">⚠ {errors.email}</div>}</div>
          <div><label className="label">{t.password}</label><input className={`input ${errors.password ? 'error' : ''}`} type="password" placeholder="••••••••" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }} />{errors.password && <div className="error-msg">⚠ {errors.password}</div>}</div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 13, fontSize: 15, borderRadius: 10 }}>{loading ? <div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff' }} /> : `${t.login} →`}</button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 24 }}>{t.noAccount} <Link to="/register" style={{ color: '#3366ff', fontWeight: 700, textDecoration: 'none' }}>{t.signupFree}</Link></p>
      </div>
    </div>
  )
}
