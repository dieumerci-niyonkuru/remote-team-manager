import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'developer', label: 'Developer' },
  { value: 'manager', label: 'Manager' },
  { value: 'owner', label: 'Owner' },
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'designer', label: 'UI/UX Designer' },
  { value: 'hr', label: 'HR Manager' },
]

export default function Register() {
  const { setUser, theme } = useStore()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [form, setForm] = useState({ 
    email:'', first_name:'', last_name:'', password:'', password2:'', role: 'viewer' 
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(p => ({...p,[k]:v})); setErrors(p => ({...p,[k]:''})) }

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
      toast.success('Welcome to NexusTeams! 🚀')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(typeof msg === 'object' ? Object.values(msg).flat()[0] : msg || 'Registration failed')
    } finally { setLoading(false) }
  }

  const F = ({ name, label, type='text', placeholder, children }) => (
    <div style={{ flex:1 }}>
      <label className="label" style={{ marginBottom:8, fontSize:12, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>{label}</label>
      {children || <input className={`input ${errors[name]?'error':''}`} type={type} placeholder={placeholder} value={form[name]} onChange={e => set(name, e.target.value)} style={{ padding:'14px 20px', borderRadius:14 }} />}
      {errors[name] && <div className="error-msg" style={{ marginTop:4, fontSize:11 }}>⚠ {errors[name]}</div>}
    </div>
  )

  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'80px 24px', position:'relative', overflow:'hidden' }}>
      <div className="moving-code-bg" />
      
      <div className="card fade-in" style={{ width:'100%', maxWidth:580, padding:56, background:'rgba(var(--bg-card-rgb), 0.7)', backdropFilter:'blur(40px)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 40px 100px -20px rgba(0,0,0,0.5)', borderRadius:32 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <Link to="/" style={{ display:'inline-flex', width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', alignItems:'center', justifyContent:'center', color:'#fff', margin:'0 auto 24px', boxShadow:'0 10px 25px -5px rgba(51,102,255,0.5)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </Link>
          <h2 style={{ fontSize:32, fontWeight:900, color:'var(--text)', marginBottom:12, letterSpacing:'-0.03em' }}>Create Account</h2>
          <p style={{ color:'var(--text2)', fontSize:16, fontWeight:500 }}>Join the world's most advanced remote workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Avatar Upload */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ width:96, height:96, borderRadius:32, border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', position:'relative', transition:'var(--transition)', background:'var(--bg2)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ textAlign:'center', color:'var(--text3)' }}>
                  <div style={{ fontSize:28 }}>👤</div>
                  <div style={{ fontSize:10, fontWeight:800, marginTop:4 }}>AVATAR</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </div>

          <div style={{ display:'flex', gap:16 }}>
            <F name="first_name" label="First Name" placeholder="John" />
            <F name="last_name" label="Last Name" placeholder="Doe" />
          </div>

          <F name="email" label="Professional Email" type="email" placeholder="john@company.com" />
          
          <F name="role" label="Your Primary Role">
            <select className="input" value={form.role} onChange={e => set('role', e.target.value)} style={{ padding:'14px 20px', borderRadius:14, cursor:'pointer' }}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </F>

          <div style={{ display:'flex', gap:16 }}>
            <F name="password" label="Password" type="password" placeholder="••••••••" />
            <F name="password2" label="Confirm" type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:'18px', fontSize:17, borderRadius:16, fontWeight:800, marginTop:10 }}>
            {loading ? <div className="spinner" style={{ width:24, height:24, border:'3px solid rgba(255,255,255,0.3)', borderTop:'3px solid #fff' }} /> : 'Create My Workspace ➜'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:15, color:'var(--text2)', marginTop:40, fontWeight:500 }}>
          Already have an account? <Link to="/login" style={{ color:'var(--brand)', fontWeight:800, textDecoration:'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
