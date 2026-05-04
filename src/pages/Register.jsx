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
    if (!form.first_name) e.first_name = 'First name required'
    if (!form.last_name) e.last_name = 'Last name required'
    if (!form.email) e.email = 'Email required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    
    if (!form.password) e.password = 'Password required'
    else if (form.password.length < 8) e.password = 'Min 8 characters'
    
    if (form.password !== form.password2) e.password2 = 'Passwords mismatch'
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
    <div style={{ marginBottom:16 }}>
      <label className="label" style={{ marginBottom:8, fontSize:13 }}>{label}</label>
      {children || <input className={`input ${errors[name]?'error':''}`} type={type} placeholder={placeholder} value={form[name]} onChange={e => set(name, e.target.value)} />}
      {errors[name] && <div className="error-msg" style={{ marginTop:6 }}>⚠ {errors[name]}</div>}
    </div>
  )

  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'60px 24px' }}>
      <div className="card fade-in" style={{ width:'100%', maxWidth:540, padding:48, background:'var(--bg-card)', backdropFilter:'blur(20px)' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:26, fontWeight:800, color:'#fff', boxShadow:'0 8px 20px rgba(51,102,255,0.3)' }}>R</div>
          <h2 style={{ fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:8 }}>Join NexusTeams</h2>
          <p style={{ color:'var(--text2)', fontSize:15 }}>Create your professional identity</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ width:100, height:100, borderRadius:'50%', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', position:'relative', transition:'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ textAlign:'center', color:'var(--text3)' }}>
                  <div style={{ fontSize:24 }}>📸</div>
                  <div style={{ fontSize:10, fontWeight:600, marginTop:4 }}>OPTIONAL</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <F name="first_name" label="First Name" placeholder="John" />
            <F name="last_name" label="Last Name" placeholder="Doe" />
          </div>

          <F name="email" label="Professional Email" type="email" placeholder="john@company.com" />
          
          <F name="role" label="Your Role">
            <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </F>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <F name="password" label="Password" type="password" placeholder="••••••••" />
            <F name="password2" label="Confirm" type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:16, fontSize:16, borderRadius:14, marginTop:12 }}>
            {loading ? <div className="spinner" style={{ width:20, height:20, border:'3px solid rgba(255,255,255,0.3)', borderTop:'3px solid #fff' }} /> : 'Create My Account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:14, color:'var(--text2)', marginTop:32 }}>
          Already have an account? <Link to="/login" style={{ color:'var(--brand)', fontWeight:700, textDecoration:'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
