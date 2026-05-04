import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { setUser, theme } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async ev => {
    ev.preventDefault()
    setLoading(true)
    try {
      const { data } = await auth.login(form)
      localStorage.setItem('rtm_access', data.data.access)
      localStorage.setItem('rtm_refresh', data.data.refresh)
      setUser(data.data.user)
      toast.success('Secure Connection Established')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unauthorized: Check Neural ID')
    } finally { setLoading(false) }
  }

  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      
      {/* Visual Intelligence Section */}
      <div className="desktop-only" style={{ flex:1, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:60 }}>
         <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.15 }} />
         <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent, var(--bg))' }} />
         
         <div style={{ position:'relative', zIndex:10, maxWidth:500 }}>
            <h1 style={{ fontSize:56, fontWeight:900, color:'var(--text)', marginBottom:32, lineHeight:1, letterSpacing:'-0.04em' }}>
               Welcome Back to <br/> <span className="text-gradient">Mission Control.</span>
            </h1>
            <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
               {[
                 { t:'Operational Health', d:'Monitor your real-time performance metrics and mission status.', img:'https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=100' },
                 { t:'Global Asset Library', d:'Access your encrypted mission files from any node worldwide.', img:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=100' },
                 { t:'Unified Communications', d:'Stay synchronized with your team through multi-channel chat.', img:'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=100' }
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

      {/* Login Command Center */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative', zIndex:20 }}>
        <div className="card glass-premium" style={{ width:'100%', maxWidth:500, padding:56, borderRadius:40, boxShadow:'0 50px 100px -20px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <Link to="/" style={{ display:'inline-flex', width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', alignItems:'center', justifyContent:'center', color:'#fff', margin:'0 auto 24px' }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </Link>
            <h2 style={{ fontSize:36, fontWeight:900, color:'var(--text)', letterSpacing:'-0.03em' }}>Initiate Login</h2>
            <p style={{ color:'var(--text3)', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1 }}>Neural ID Authorization</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:24 }}>
            <div>
              <label className="label" style={{ marginBottom:12, fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1.5 }}>Neural ID (Email)</label>
              <input className="input" type="email" placeholder="email@nexus.com" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} style={{ padding:'18px 24px', fontSize:16, borderRadius:16 }} />
            </div>
            
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <label className="label" style={{ marginBottom:0, fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1.5 }}>Access Key</label>
                <Link to="/forgot-password" style={{ fontSize:12, color:'var(--brand)', textDecoration:'none', fontWeight:800 }}>Recover Key?</Link>
              </div>
              <input className="input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({...form, password:e.target.value})} style={{ padding:'18px 24px', fontSize:16, borderRadius:16 }} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:'20px', fontSize:18, borderRadius:20, fontWeight:900, marginTop:12 }}>
              {loading ? 'Authorizing...' : 'Establish Secure Connection ➜'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:15, color:'var(--text2)', marginTop:48, fontWeight:600 }}>
            New to the Workspace? <Link to="/register" style={{ color:'var(--brand)', fontWeight:800, textDecoration:'none' }}>Join Mission</Link>
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
