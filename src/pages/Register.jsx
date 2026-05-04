import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access to nodes', icon: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=100' },
  { value: 'developer', label: 'Developer', desc: 'Code and build mission nodes', icon: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
  { value: 'manager', label: 'Manager', desc: 'Coordinate team operations', icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  { value: 'designer', label: 'UI/UX', desc: 'Design the future interface', icon: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
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
      toast.success('Operational Access Granted')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(typeof msg === 'object' ? Object.values(msg).flat()[0] : msg || 'Access Denied')
    } finally { setLoading(false) }
  }

  const F = ({ name, label, type='text', placeholder, children }) => (
    <div style={{ flex:1 }}>
      <label className="label" style={{ marginBottom:8, fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1.5 }}>{label}</label>
      {children || <input className={`input ${errors[name]?'error':''}`} type={type} placeholder={placeholder} value={form[name]} onChange={e => set(name, e.target.value)} style={{ padding:'16px 20px', borderRadius:16, fontSize:15 }} />}
      {errors[name] && <div className="error-msg" style={{ marginTop:4, fontSize:11 }}>{errors[name]}</div>}
    </div>
  )

  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      
      {/* Visual Intelligence Section */}
      <div className="desktop-only" style={{ flex:1, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:60 }}>
         <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.15 }} />
         <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent, var(--bg))' }} />
         
         <div style={{ position:'relative', zIndex:10, maxWidth:500 }}>
            <h1 style={{ fontSize:56, fontWeight:900, color:'var(--text)', marginBottom:32, lineHeight:1, letterSpacing:'-0.04em' }}>
               Start Your <br/> <span className="text-gradient">Operational Journey.</span>
            </h1>
            <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
               {[
                 { t:'Real-time Frequency', d:'Synchronize with your team across global nodes in millisecond latency.', img:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=100' },
                 { t:'AI Neural Link', d:'Advanced AI assistants breakdown complex mission goals into tasks.', img:'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=100' },
                 { t:'Bank-Grade Security', d:'Encrypted communication nodes protected by multi-layer firewalls.', img:'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=100' }
               ].map(f => (
                 <div key={f.t} style={{ display:'flex', gap:20, alignItems:'center' }}>
                    <img src={f.img} style={{ width:64, height:64, borderRadius:20, objectFit:'cover', border:'2px solid var(--border)' }} />
                    <div>
                       <div style={{ fontWeight:800, color:'var(--text)', fontSize:18, marginBottom:4 }}>{f.t}</div>
                       <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>{f.d}</div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Registration Command Center */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative', zIndex:20 }}>
        <div className="card glass-premium" style={{ width:'100%', maxWidth:600, padding:56, borderRadius:40, boxShadow:'0 50px 100px -20px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <Link to="/" style={{ display:'inline-flex', width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', alignItems:'center', justifyContent:'center', color:'#fff', margin:'0 auto 24px' }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </Link>
            <h2 style={{ fontSize:36, fontWeight:900, color:'var(--text)', letterSpacing:'-0.03em' }}>Initialize Identity</h2>
            <p style={{ color:'var(--text3)', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1 }}>Global Node Registration</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {/* Avatar Cluster */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width:100, height:100, borderRadius:32, border:'3px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', position:'relative', background:'var(--bg3)' }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <div style={{ textAlign:'center', color:'var(--text3)' }}>
                    <div style={{ fontSize:32 }}>👤</div>
                    <div style={{ fontSize:9, fontWeight:900, marginTop:4, letterSpacing:1 }}>SET AVATAR</div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
            </div>

            <div style={{ display:'flex', gap:20 }}>
              <F name="first_name" label="First Name" placeholder="First Name" />
              <F name="last_name" label="Last Name" placeholder="Last Name" />
            </div>

            <F name="email" label="Neural ID (Email)" type="email" placeholder="email@nexus.com" />
            
            {/* Role Selection Intelligence */}
            <div>
               <label className="label" style={{ marginBottom:12, fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1.5 }}>Select Your Mission Role</label>
               <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {ROLES.map(r => (
                    <div key={r.value} onClick={() => set('role', r.value)} style={{ padding:16, borderRadius:20, background:form.role===r.value?'var(--brand-bg)':'var(--bg3)', border:form.role===r.value?'2px solid var(--brand)':'2px solid transparent', cursor:'pointer', transition:'0.2s', display:'flex', alignItems:'center', gap:12 }}>
                       <img src={r.icon} style={{ width:40, height:40, borderRadius:12, objectFit:'cover' }} />
                       <div>
                          <div style={{ fontWeight:800, fontSize:14, color:form.role===r.value?'var(--brand)':'var(--text)' }}>{r.label}</div>
                          <div style={{ fontSize:10, color:'var(--text3)' }}>{r.desc}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div style={{ display:'flex', gap:20 }}>
              <F name="password" label="Access Key" type="password" placeholder="••••••••" />
              <F name="password2" label="Confirm Key" type="password" placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:'20px', fontSize:18, borderRadius:20, fontWeight:900, marginTop:12 }}>
              {loading ? 'Processing...' : 'Authorize Registration ➜'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:15, color:'var(--text2)', marginTop:48, fontWeight:600 }}>
            Identity established? <Link to="/login" style={{ color:'var(--brand)', fontWeight:800, textDecoration:'none' }}>Initiate Login</Link>
          </p>
        </div>
      </div>

      <style>{`
        .glass-premium { background: rgba(var(--bg-card-rgb), 0.7); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.05); }
        @media (max-width: 1024px) { .desktop-only { display: none !important; } }
      `}</style>
    </div>
  )
}
