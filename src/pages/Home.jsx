import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import Dashboard from './Dashboard'

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2074',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=2070'
]

const FEATURES = [
  { 
    title:'Real-time Sync', 
    desc:'Websocket-powered chat and instant notifications keep your team in perfect rhythm.',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
  },
  { 
    title:'AI Copilot', 
    desc:'Advanced AI helps breakdown complex goals into manageable tasks automatically.',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
  },
  { 
    title:'Project Insights', 
    desc:'Visual dashboards and time tracking give you deep visibility into productivity.',
    img: 'https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800'
  },
  { 
    title:'Enterprise Security', 
    desc:'Bank-grade encryption and role-based access control protect your sensitive data.',
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800'
  },
  { 
    title:'Multi-Tenant', 
    desc:'Isolate different organizations with dedicated workspaces and team permissions.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  },
  { 
    title:'Global Delivery', 
    desc:'Edge-optimized performance ensures low latency for remote teams worldwide.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
  }
]

export default function Home() {
  const { isAuth, theme } = useStore()
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    if (isAuth) return
    const timer = setInterval(() => setBgIndex(i => (i + 1) % BACKGROUNDS.length), 8000)
    return () => clearInterval(timer)
  }, [isAuth])

  // If logged in, show the Platform Mission Control (Dashboard)
  if (isAuth) {
    return <Dashboard />
  }

  return (
    <div className={theme} style={{ background:'var(--bg)' }}>
      {/* Hero Section */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px', overflow:'hidden' }}>
        {BACKGROUNDS.map((bg, i) => (
          <div key={bg} style={{ position:'absolute', inset:0, backgroundImage:`url(${bg})`, backgroundSize:'cover', backgroundPosition:'center', opacity: i === bgIndex ? 0.25 : 0, transition:'opacity 2s ease-in-out', zIndex:0 }} />
        ))}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent, var(--bg))', zIndex:1 }} />
        
        <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div className="fade-in" style={{ display:'inline-flex', alignItems:'center', gap:10, background:'var(--brand-bg)', border:'1px solid var(--brand)', borderRadius:40, padding:'10px 24px', fontSize:13, fontWeight:800, color:'var(--brand)', marginBottom:40, textTransform:'uppercase', letterSpacing:2 }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:'var(--brand)', boxShadow:'0 0 15px var(--brand)', animation:'pulse-dot 2s infinite' }} />
            The Future of Remote Management
          </div>
          
          <h1 className="fade-in" style={{ fontSize:'clamp(48px, 10vw, 104px)', fontWeight:900, color:'var(--text)', marginBottom:32, lineHeight:0.85, letterSpacing:'-0.06em' }}>
            Build faster. <br/> Scale <span style={{ background:'linear-gradient(135deg, var(--brand), var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>global.</span>
          </h1>
          
          <p className="fade-in" style={{ fontSize:'clamp(18px, 2.5vw, 26px)', color:'var(--text2)', maxWidth:800, margin:'0 auto 64px', lineHeight:1.5, animationDelay:'0.2s', fontWeight:500 }}>
            The all-in-one mission control for modern teams. Real-time chat, AI workflows, and bank-grade security — built to scale with your ambition.
          </p>
          
          <div className="fade-in" style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap', animationDelay:'0.3s' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding:'24px 60px', fontSize:20, borderRadius:20 }}>Start Your Journey</Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding:'24px 60px', fontSize:20, borderRadius:20 }}>Explore Platform ➜</Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding:'140px 24px', background:'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:100 }}>
            <h2 style={{ fontSize:'clamp(36px, 6vw, 64px)', fontWeight:900, marginBottom:24, letterSpacing:'-0.04em' }}>Everything you need to <span style={{ color:'var(--brand)' }}>win.</span></h2>
            <p style={{ color:'var(--text2)', fontSize:20, maxWidth:700, margin:'0 auto' }}>Battle-tested features designed for the most demanding remote organizations.</p>
          </div>
          
          <div className="grid-responsive">
            {FEATURES.map((f, i) => (
              <div key={i} className="card card-hover" style={{ overflow:'hidden', borderRadius:24, background:'var(--bg-card)' }}>
                <div style={{ height:240, overflow:'hidden', position:'relative' }}>
                  <img src={f.img} alt={f.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, var(--bg-card), transparent)' }} />
                </div>
                <div style={{ padding:32 }}>
                  <h3 style={{ fontSize:22, fontWeight:800, marginBottom:16, color:'var(--text)' }}>{f.title}</h3>
                  <p style={{ color:'var(--text2)', lineHeight:1.7, fontSize:15 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{ padding:'140px 24px', background:'var(--bg2)' }}>
        <div className="container" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:100, alignItems:'center' }}>
          <div>
             <div style={{ width:48, height:8, background:'var(--brand)', borderRadius:4, marginBottom:32 }} />
             <h2 style={{ fontSize:'clamp(32px, 5vw, 56px)', fontWeight:900, marginBottom:32, lineHeight:1.1 }}>We are on a mission to unite <span style={{ color:'var(--brand)' }}>humanity</span> through code.</h2>
             <p style={{ fontSize:20, color:'var(--text2)', lineHeight:1.8, marginBottom:40 }}>NexusTeams was born from the belief that talent is universal, but opportunity is not. We build the bridges that connect the world's best minds, regardless of where they sleep.</p>
             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
                {[
                  { label:'Founded', val:'2024' },
                  { label:'Global Users', val:'500k+' },
                  { label:'Reliability', val:'99.99%' },
                  { label:'Awards', val:'12+' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize:28, fontWeight:900, color:'var(--text)' }}>{s.val}</div>
                    <div style={{ fontSize:14, color:'var(--brand)', fontWeight:700, textTransform:'uppercase' }}>{s.label}</div>
                  </div>
                ))}
             </div>
          </div>
          <div className="fade-in" style={{ position:'relative' }}>
             <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" alt="About Us" style={{ width:'100%', borderRadius:32, boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)' }} />
             <div style={{ position:'absolute', bottom:-40, right:-40, width:200, height:200, background:'var(--brand)', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', padding:32, boxShadow:'var(--shadow-lg)' }} className="float">
                <div style={{ textAlign:'center' }}>
                   <div style={{ fontSize:48, fontWeight:900 }}>100%</div>
                   <div style={{ fontSize:14, fontWeight:700 }}>REMOTE FIRST</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section style={{ padding:'120px 24px', background:'var(--bg)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h2 style={{ fontSize:48, fontWeight:900, marginBottom:24 }}>Join the revolution.</h2>
          <p style={{ color:'var(--text2)', fontSize:20, marginBottom:56, maxWidth:600, margin:'0 auto 56px' }}>Get the latest updates on AI, remote work, and NexusTeams engineering.</p>
          <form style={{ maxWidth:600, margin:'0 auto', display:'flex', gap:16 }}>
            <input className="input" type="email" placeholder="Enter your email" style={{ padding:'20px 32px', fontSize:18, borderRadius:16 }} />
            <button className="btn btn-primary" type="button" style={{ padding:'0 48px', borderRadius:16, fontSize:18 }}>Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}
