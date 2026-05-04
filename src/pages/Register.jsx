import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'viewer', label: 'Viewer', desc: 'Read-only node access', icon: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=100' },
  { value: 'developer', label: 'Developer', desc: 'Build & Deploy nodes', icon: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
  { value: 'manager', label: 'Manager', desc: 'Team synchronization', icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  { value: 'designer', label: 'Designer', desc: 'Interface engineering', icon: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
]

const F = ({ name, label, type = 'text', placeholder, value, onChange, error, children }) => (
  <div style={{ flex: 1 }}>
    <label className="label" style={{ marginBottom: 10, fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{label}</label>
    {children || <input className={`input ${error ? 'error' : ''}`} type={type} placeholder={placeholder} value={value} onChange={e => onChange(name, e.target.value)} style={{ padding: '16px 24px', borderRadius: 16, fontSize: 15 }} />}
    {error && <div className="error-msg" style={{ marginTop: 4, fontSize: 11 }}>{error}</div>}
  </div>
)

export default function Register() {
  const { setUser, theme } = useStore()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '', password: '', password2: '', role: 'viewer'
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.first_name) e.first_name = 'Required'
    if (!form.last_name) e.last_name = 'Required'
    if (!form.email) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid'
    if (!form.password) e.password = 'Required'
    else if (form.password.length < 8) e.password = 'Min 8 chars'
    if (form.password !== form.password2) e.password2 = 'Mismatch'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)

    const formData = new FormData()
    Object.keys(form).forEach(k => formData.append(k, form[k]))
    if (avatar) formData.append('avatar', avatar)

    try {
      const res = await auth.register(formData)
      localStorage.setItem('rtm_access', res.data.data.access)
      localStorage.setItem('rtm_refresh', res.data.data.refresh)
      setUser(res.data.data.user)
      toast.success('Welcome to NexusTeams!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(typeof msg === 'object' ? Object.values(msg).flat()[0] : msg || 'Access Denied')
    } finally { setLoading(false) }
  }

  return (
    <div className={theme} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
      <div className="moving-code-bg" />

      <div className="card glass-premium fade-in" style={{ width: '100%', maxWidth: 580, padding: 56, borderRadius: 40, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link to="/" style={{ display: 'inline-flex', width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 24px', boxShadow: '0 15px 30px -5px rgba(51,102,255,0.4)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </Link>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.03em' }}>Initialize Identity</h2>
          <p style={{ color: 'var(--text2)', fontSize: 16, fontWeight: 500 }}>Join the world's most advanced remote workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Avatar Selection */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ width: 100, height: 100, borderRadius: 32, border: '3px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor:'pointer', overflow:'hidden', position:'relative', background:'var(--bg3)', transition:'0.3s' }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                   <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100" style={{ width:44, height:44, borderRadius:'50%', opacity:0.5, marginBottom:4 }} />
                   <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>SET PHOTO</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <F name="first_name" label="First Name" placeholder="John" value={form.first_name} onChange={set} error={errors.first_name} />
            <F name="last_name" label="Last Name" placeholder="Doe" value={form.last_name} onChange={set} error={errors.last_name} />
          </div>

          <F name="email" label="Neural ID (Email)" type="email" placeholder="john@nexus.com" value={form.email} onChange={set} error={errors.email} />

          {/* Role Selection Grid with Photos */}
          <div>
            <label className="label" style={{ marginBottom: 16, fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Select Your Mission Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {ROLES.map(r => (
                <div key={r.value} onClick={() => set('role', r.value)} style={{ padding: 18, borderRadius: 20, background: form.role === r.value ? 'var(--brand-bg)' : 'var(--bg3)', border: form.role === r.value ? '2px solid var(--brand)' : '2px solid transparent', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src={r.icon} style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', border: form.role === r.value ? '2px solid var(--brand)' : '1px solid var(--border)' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: form.role === r.value ? 'var(--brand)' : 'var(--text)' }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <F name="password" label="Access Key" type="password" placeholder="••••••••" value={form.password} onChange={set} error={errors.password} />
            <F name="password2" label="Confirm Key" type="password" placeholder="••••••••" value={form.password2} onChange={set} error={errors.password2} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '20px', fontSize: 18, borderRadius: 20, fontWeight: 900, marginTop: 12 }}>
            {loading ? 'Processing...' : 'Authorize Registration ➜'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text2)', marginTop: 48, fontWeight: 600 }}>
          Already registered? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 800, textDecoration: 'none' }}>Initiate Login</Link>
        </p>
      </div>

      <style>{`
        .glass-premium { background: rgba(var(--bg-card-rgb), 0.7); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.05); }
      `}</style>
    </div>
  )
}
