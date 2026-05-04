import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2070'
]

const FEATURES = [
  { icon:'⚡', title:'Real-time Sync', desc:'Websocket-powered chat and instant notifications keep your team in perfect rhythm.' },
  { icon:'🧠', title:'AI Copilot', desc:'Advanced AI helps breakdown complex goals into manageable tasks automatically.' },
  { icon:'📊', title:'Project Insights', desc:'Visual dashboards and time tracking give you deep visibility into productivity.' },
  { icon:'🔒', title:'Enterprise Security', desc:'Bank-grade encryption and role-based access control protect your sensitive data.' },
  { icon:'🏢', title:'Multi-Tenant', desc:'Isolate different organizations with dedicated workspaces and team permissions.' },
  { icon:'🚀', title:'Global Performance', desc:'Edge-optimized delivery ensures low latency for remote teams worldwide.' },
]

export default function Home() {
  const { theme } = useStore()
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setBgIndex(i => (i + 1) % BACKGROUNDS.length), 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={theme} style={{ background:'var(--bg)' }}>
      {/* Hero Section with Changeable Background */}
      <section style={{ position:'relative', minHeight:'90vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'100px 24px', overflow:'hidden' }}>
        {/* Dynamic Background */}
        {BACKGROUNDS.map((bg, i) => (
          <div key={bg} style={{ position:'absolute', inset:0, backgroundImage:`url(${bg})`, backgroundSize:'cover', backgroundPosition:'center', opacity: i === bgIndex ? 0.15 : 0, transition:'opacity 2s ease-in-out', zIndex:0 }} />
        ))}
        {/* Overlay Gradient */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at center, transparent 0%, var(--bg) 100%)', zIndex:1 }} />
        
        <div className="container fade-in" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--brand-bg)', border:'1px solid var(--brand)', borderRadius:30, padding:'8px 20px', fontSize:12, fontWeight:700, color:'var(--brand)', marginBottom:32, textTransform:'uppercase', letterSpacing:1.5 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--brand)', boxShadow:'0 0 10px var(--brand)', animation:'pulse-dot 2s infinite' }} />
            The Future of Remote Work is Here
          </div>
          
          <h1 style={{ fontSize:'clamp(42px, 8vw, 84px)', fontWeight:800, color:'var(--text)', marginBottom:24, maxWidth:1000, margin:'0 auto 24px' }}>
            Manage your global team <span style={{ background:'linear-gradient(135deg, var(--brand), var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>effortlessly.</span>
          </h1>
          
          <p style={{ fontSize:'clamp(16px, 2vw, 22px)', color:'var(--text2)', maxWidth:680, margin:'0 auto 48px', lineHeight:1.6 }}>
            The all-in-one workspace for remote-first companies. Real-time chat, AI-powered project management, and global-scale security.
          </p>
          
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding:'16px 40px', fontSize:16, borderRadius:14 }}>Get Started for Free</Link>
            <button className="btn btn-secondary" style={{ padding:'16px 40px', fontSize:16, borderRadius:14 }} onClick={() => setBgIndex(i => (i + 1) % BACKGROUNDS.length)}>Change Background 🖼️</button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding:'40px 24px', background:'var(--bg2)', borderY:'1px solid var(--border)' }}>
        <div className="container" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32, textAlign:'center' }}>
          {[
            { label:'Active Teams', val:'2,500+' },
            { label:'Tasks Completed', val:'1.2M' },
            { label:'Uptime SLA', val:'99.99%' },
            { label:'Global Support', val:'24/7' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize:32, fontWeight:800, color:'var(--text)', marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:14, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding:'120px 24px' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:80 }}>
            <h2 style={{ fontSize:'clamp(32px, 5vw, 48px)', fontWeight:800, marginBottom:20 }}>Built for high-performance teams</h2>
            <p style={{ color:'var(--text2)', fontSize:18, maxWidth:600, margin:'0 auto' }}>Advanced tools to help you scale your organization without losing speed or security.</p>
          </div>
          
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card card-hover" style={{ padding:40, background:'var(--bg-card)', backdropFilter:'blur(10px)' }}>
                <div style={{ width:56, height:56, borderRadius:16, background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:24, color:'var(--brand)' }}>{f.icon}</div>
                <h3 style={{ fontSize:20, fontWeight:700, marginBottom:16 }}>{f.title}</h3>
                <p style={{ color:'var(--text2)', lineHeight:1.7, fontSize:15 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding:'120px 24px', background:'linear-gradient(135deg, #0a1628 0%, #060b18 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:800, height:400, background:'radial-gradient(circle, rgba(51,102,255,0.1) 0%, transparent 70%)', zIndex:0 }} />
        <div className="container" style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(36px, 6vw, 56px)', fontWeight:800, color:'#fff', marginBottom:24 }}>Ready to unite your team?</h2>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.6)', marginBottom:48, maxWidth:580, margin:'0 auto 48px' }}>Join thousands of organizations scaling with NexusTeams today.</p>
          <Link to="/register" className="btn btn-primary" style={{ padding:'18px 48px', fontSize:18, borderRadius:16 }}>Start Your Free Trial</Link>
        </div>
      </section>
    </div>
  )
}
