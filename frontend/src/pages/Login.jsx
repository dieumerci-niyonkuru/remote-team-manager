import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

const LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'rw', flag: '🇷🇼', label: 'RW' },
]

const T = {
  en: { title: 'Welcome back', sub: 'Sign in to manage your remote team', email: 'Email address', pass: 'Password', btn: 'Sign In', noAcc: "Don't have an account?", signup: 'Sign up free' },
  fr: { title: 'Bon retour', sub: 'Connectez-vous pour gérer votre équipe', email: 'Adresse e-mail', pass: 'Mot de passe', btn: 'Se connecter', noAcc: 'Pas de compte?', signup: 'Créer un compte' },
  rw: { title: 'Murakaza neza', sub: 'Injira kugira ngo uyobore itsinda', email: 'Imeyili', pass: 'Ijambobanga', btn: 'Injira', noAcc: 'Nta konti?', signup: 'Iyandikishe' },
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('en')
  const { setAuth, theme, setTheme } = useAuthStore()
  const navigate = useNavigate()
  const t = T[lang]

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      localStorage.setItem('access_token', res.data.data.access)
      localStorage.setItem('refresh_token', res.data.data.refresh)
      setAuth(res.data.data.user)
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={theme} style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f3a 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(51,102,255,0.1)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(51,102,255,0.07)', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #3366ff, #6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>R</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>Collaborate<br />without borders</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>Manage your remote team, track tasks, and ship faster — all in one beautiful workspace.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            {[['10K+', 'Teams'], ['99.9%', 'Uptime'], ['4.9★', 'Rating']].map(([v, l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 420, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', position: 'relative' }}>
        {/* Lang + Theme */}
        <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={{ background: lang === l.code ? '#3366ff' : 'transparent', color: lang === l.code ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
              {l.flag} {l.label}
            </button>
          ))}
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 14, color: 'var(--text)' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{t.title} 👋</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>{t.sub}</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{t.pass}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, padding: '12px', fontSize: 15, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} className="spinner" /> : t.btn}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
            {t.noAcc}{' '}
            <Link to="/register" style={{ color: '#3366ff', fontWeight: 600, textDecoration: 'none' }}>{t.signup}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
