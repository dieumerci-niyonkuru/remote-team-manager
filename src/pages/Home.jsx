import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import Dashboard from './Dashboard'

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2000'
]

const FEATURES = [
  { 
    title:'Real-time Sync', 
    desc:'Websocket-powered chat and instant notifications keep your team in perfect rhythm.',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800'
  },
  { 
    title:'AI Copilot', 
    desc:'Advanced AI helps breakdown complex goals into manageable tasks automatically.',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800'
  },
  { 
    title:'Project Insights', 
    desc:'Visual dashboards and time tracking give you deep visibility into productivity.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800'
  }
]

const MARQUEE_ITEMS = [
  { name: 'Sarah L.', role: 'Engineering Lead', text: 'RemoteTeam transformed how we deploy globally.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { name: 'Marcus J.', role: 'Product Manager', text: 'The AI workflows are a literal game changer.', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { name: 'Elena R.', role: 'Head of Design', text: 'Beautiful UI, even better performance.', avatar: 'https://i.pravatar.cc/150?u=elena' },
  { name: 'David K.', role: 'CEO @ TechFlow', text: 'Scaling to 500 members was seamless with the workspace OS.', avatar: 'https://i.pravatar.cc/150?u=david' },
  { name: 'Sofia M.', role: 'Operations', text: 'The Kanban engine is the most stable we have ever used.', avatar: 'https://i.pravatar.cc/150?u=sofia' },
]

export default function Home() {
  const { isAuth, theme } = useStore()
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    if (isAuth) return
    const timer = setInterval(() => setBgIndex(i => (i + 1) % BACKGROUNDS.length), 8000)
    return () => clearInterval(timer)
  }, [isAuth])

  if (isAuth) {
    return <Dashboard />
  }

  return (
    <div className={theme} style={{ background:'var(--bg)' }}>
      {/* Hero Section */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px', overflow:'hidden' }}>
        {/* Animated Background Overlay */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
           {BACKGROUNDS.map((bg, i) => (
             <div key={bg} style={{ position:'absolute', inset:0, backgroundImage:`url(${bg})`, backgroundSize:'cover', backgroundPosition:'center', opacity: i === bgIndex ? 0.3 : 0, transition:'opacity 2s ease-in-out' }} />
           ))}
           <div className="moving-code-bg" style={{ opacity: 0.15 }} />
        </div>
        
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent, var(--bg))', zIndex:1 }} />
        
        <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div className="fade-in" style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(51,102,255,0.1)', border:'1px solid var(--brand)', borderRadius:40, padding:'10px 24px', fontSize:13, fontWeight:800, color:'var(--brand)', marginBottom:40, textTransform:'uppercase', letterSpacing:2 }}>
            <span className="activity-dot" />
            The Future of Remote Management
          </div>
          
          <h1 className="fade-in" style={{ fontSize:'clamp(48px, 12vw, 120px)', fontWeight:900, color:'var(--text)', marginBottom:32, lineHeight:0.8, letterSpacing:'-0.06em' }}>
            Work <span className="text-gradient">Unlimited.</span> <br/> 
            Scale Global.
          </h1>
          
          <p className="fade-in" style={{ fontSize:'clamp(18px, 3vw, 26px)', color:'var(--text2)', maxWidth:800, margin:'0 auto 64px', lineHeight:1.4, animationDelay:'0.2s', fontWeight:500 }}>
            The all-in-one mission control for modern teams. Real-time chat, AI workflows, and bank-grade security.
          </p>
          
          <div className="fade-in" style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap', animationDelay:'0.3s' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding:'24px 64px', fontSize:20, borderRadius:24 }}>Get Started Free</Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding:'24px 64px', fontSize:20, borderRadius:24, background:'rgba(255,255,255,0.05)' }}>Request Demo ➜</Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section (Mockup) */}
      <section style={{ padding:'0 24px', position:'relative', marginTop:'-100px', zIndex:10 }}>
        <div className="container">
          <div className="mockup-glow fade-in" style={{ padding:'12px', background:'rgba(255,255,255,0.02)', backdropFilter:'blur(40px)', border:'1px solid rgba(255,255,255,0.1)' }}>
             <img 
               src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000" 
               alt="Dashboard Preview" 
               style={{ width:'100%', borderRadius:16, border:'1px solid rgba(255,255,255,0.05)' }} 
             />
             <div style={{ position:'absolute', top:'20%', right:'-40px', width:240, padding:20, borderRadius:20, background:'rgba(11,20,41,0.9)', border:'1px solid var(--brand)', boxShadow:'var(--shadow-lg)' }} className="float desktop-only">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">JD</div>
                   <div>
                      <p className="text-xs font-bold text-white">Project Launch</p>
                      <p className="text-[10px] text-gray-400">Due in 2 hours</p>
                   </div>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500" style={{ width:'75%' }} />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Infinite Moving Cards Section */}
      <section style={{ padding:'140px 0', overflow:'hidden', background:'var(--bg)' }}>
        <div style={{ textAlign:'center', marginBottom:80 }}>
          <h2 style={{ fontSize:48, fontWeight:900, letterSpacing:'-0.04em' }}>Trusted by the <span className="text-gradient">Best.</span></h2>
        </div>
        
        <div className="marquee-container">
           {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
             <div key={i} className="card" style={{ width:350, margin:'0 15px', padding:32, background:'var(--bg2)', borderRadius:28, border:'1px solid var(--border2)' }}>
                <div className="flex items-center gap-4 mb-6">
                   <img src={item.avatar} alt={item.name} style={{ width:56, height:56, borderRadius:20, border:'2px solid var(--brand)' }} />
                   <div>
                      <h4 style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{item.name}</h4>
                      <p style={{ fontSize:12, color:'var(--brand)', fontWeight:700, textTransform:'uppercase' }}>{item.role}</p>
                   </div>
                </div>
                <p style={{ color:'var(--text2)', fontSize:16, lineHeight:1.6, fontStyle:'italic' }}>"{item.text}"</p>
             </div>
           ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section style={{ padding:'140px 24px', background:'var(--bg2)' }}>
        <div className="container" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:40 }}>
           {FEATURES.map((f, i) => (
             <div key={i} className="card card-hover" style={{ padding:40, borderRadius:32 }}>
                <div style={{ width:64, height:64, borderRadius:20, background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--brand)', marginBottom:32 }}>
                   {i === 0 ? <img src={f.img} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:20 }} /> : null}
                </div>
                <h3 style={{ fontSize:28, fontWeight:900, marginBottom:20 }}>{f.title}</h3>
                <p style={{ color:'var(--text2)', fontSize:18, lineHeight:1.7 }}>{f.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Feedback & Community */}
      <section style={{ padding:'140px 24px', background:'linear-gradient(to bottom, var(--bg), var(--bg2))' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <div style={{ maxWidth:800, margin:'0 auto' }}>
             <h2 style={{ fontSize:56, fontWeight:900, marginBottom:32 }}>Your voice <span className="text-gradient">Matters.</span></h2>
             <p style={{ fontSize:22, color:'var(--text2)', marginBottom:48 }}>We build for you. Provide feedback directly within the platform to help us shape the future of workspace engineering.</p>
             <Link to="/register" className="btn btn-primary" style={{ padding:'24px 80px', fontSize:22, borderRadius:24 }}>Join the Community</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
