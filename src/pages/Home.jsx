import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=2074',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2071',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2070'
]

const FEATURES = [
  { 
    icon:'⚡', 
    title:'Real-time Collaboration', 
    desc:'Connect with your team instantly. Our WebSocket architecture ensures that messages, task updates, and notifications happen in the blink of an eye.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'
  },
  { 
    icon:'🧠', 
    title:'AI-Driven Insights', 
    desc:'Stop guessing and start knowing. Our built-in AI assistant analyzes your project data to predict bottlenecks and suggest the most efficient path forward.',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
  },
  { 
    icon:'📊', 
    title:'Advanced Visual Analytics', 
    desc:'Track every hour and every task with precision. Beautifully designed dashboards give you a 360-degree view of your organization health.',
    img: 'https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800'
  }
]

export default function Home() {
  const { theme } = useStore()
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setBgIndex(i => (i + 1) % BACKGROUNDS.length), 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={theme} style={{ background:'var(--bg)' }}>
      {/* Hero Section */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px', overflow:'hidden' }}>
        {BACKGROUNDS.map((bg, i) => (
          <div key={bg} style={{ position:'absolute', inset:0, backgroundImage:`url(${bg})`, backgroundSize:'cover', backgroundPosition:'center', opacity: i === bgIndex ? 0.2 : 0, transition:'opacity 2s ease-in-out', zIndex:0 }} />
        ))}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent, var(--bg))', zIndex:1 }} />
        
        <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div className="fade-in" style={{ display:'inline-flex', alignItems:'center', gap:10, background:'var(--brand-bg)', border:'1px solid var(--brand)', borderRadius:40, padding:'10px 24px', fontSize:13, fontWeight:700, color:'var(--brand)', marginBottom:40, textTransform:'uppercase', letterSpacing:2 }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:'var(--brand)', boxShadow:'0 0 15px var(--brand)', animation:'pulse-dot 2s infinite' }} />
            The Next Generation of Teamwork
          </div>
          
          <h1 className="fade-in" style={{ fontSize:'clamp(48px, 10vw, 96px)', fontWeight:800, color:'var(--text)', marginBottom:32, lineHeight:0.9, letterSpacing:'-0.05em' }}>
            Build faster. <br/> Together. <span style={{ background:'linear-gradient(135deg, var(--brand), var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Anywhere.</span>
          </h1>
          
          <p className="fade-in" style={{ fontSize:'clamp(18px, 2.5vw, 24px)', color:'var(--text2)', maxWidth:720, margin:'0 auto 64px', lineHeight:1.6, animationDelay:'0.2s' }}>
            Unleash your team's potential with a unified platform designed for the modern remote era. Scalable, secure, and powered by AI.
          </p>
          
          <div className="fade-in" style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap', animationDelay:'0.3s' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding:'20px 52px', fontSize:18, borderRadius:18 }}>Join NexusTeams Today</Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding:'20px 52px', fontSize:18, borderRadius:18 }}>Live Demo ➜</Link>
          </div>
        </div>

        {/* Floating Moving Elements */}
        <div className="float" style={{ position:'absolute', bottom:'10%', left:'5%', width:120, height:120, borderRadius:24, background:'var(--brand-bg)', border:'1px solid var(--brand)', backdropFilter:'blur(10px)', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, opacity:0.6 }}>💬</div>
        <div className="float" style={{ position:'absolute', top:'15%', right:'8%', width:100, height:100, borderRadius:'50%', background:'var(--accent-bg)', border:'1px solid var(--accent)', backdropFilter:'blur(10px)', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, opacity:0.5, animationDelay:'1s' }}>🧠</div>
      </section>

      {/* Feature Showcases with Images */}
      {FEATURES.map((f, i) => (
        <section key={i} style={{ padding:'120px 24px', background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg2)' }}>
          <div className="container" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:80, alignItems:'center' }}>
            <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:32, color:'var(--brand)' }}>{f.icon}</div>
              <h2 style={{ fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, marginBottom:24, color:'var(--text)' }}>{f.title}</h2>
              <p style={{ fontSize:18, color:'var(--text2)', lineHeight:1.8, marginBottom:40 }}>{f.desc}</p>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:16 }}>
                {['Industry-leading performance', 'Enterprise-grade security', 'Customizable workflows'].map(item => (
                  <li key={item} style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text)', fontWeight:600, fontSize:15 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10 }}>✓</div> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ order: i % 2 === 0 ? 2 : 1 }} className="fade-in">
              <div className="card" style={{ overflow:'hidden', borderRadius:24, border:'1px solid var(--border2)', transform: i % 2 === 0 ? 'rotate(2deg)' : 'rotate(-2deg)', transition:'transform 0.5s ease' }}>
                <img src={f.img} alt={f.title} style={{ width:'100%', height:480, objectFit:'cover', display:'block' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Subscription Section */}
      <section style={{ padding:'120px 24px', background:'var(--bg3)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h2 style={{ fontSize:40, fontWeight:800, marginBottom:16 }}>Stay updated with the latest AI tools</h2>
          <p style={{ color:'var(--text2)', marginBottom:48 }}>Join 10,000+ professionals receiving our weekly productivity digest.</p>
          <form style={{ maxWidth:500, margin:'0 auto', display:'flex', gap:12 }}>
            <input className="input" type="email" placeholder="dieumercin21@gmail.com" style={{ padding:'16px 24px', fontSize:16 }} />
            <button className="btn btn-primary" type="button" style={{ padding:'0 32px' }}>Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}
