import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'

const FEATURES = [
  { icon:'🔐', title:'JWT Authentication', desc:'Secure login with access + refresh tokens. Auto-refresh on expiry.' },
  { icon:'🏢', title:'Multi-Workspace', desc:'Create multiple workspaces for different teams or clients.' },
  { icon:'👥', title:'Role-Based Access', desc:'Owner, Manager, Developer, Viewer — each with precise permissions.' },
  { icon:'📋', title:'Kanban Board', desc:'Visual task management with To Do, In Progress, and Done columns.' },
  { icon:'⏱️', title:'Time Logging', desc:'Track hours spent on tasks. Managers see all team time logs.' },
  { icon:'⚡', title:'Activity Feed', desc:'Real-time log of every action in your workspace.' },
  { icon:'🌍', title:'3 Languages', desc:'Full support for English, Français, and Kinyarwanda.' },
  { icon:'🐳', title:'Docker Ready', desc:'Fully containerised with Docker + PostgreSQL + CI/CD pipeline.' },
]

const STATS = [
  { value:'70+', label:'Automated Tests' },
  { value:'100%', label:'API Coverage' },
  { value:'4', label:'RBAC Roles' },
  { value:'Live', label:'On Railway' },
]

export default function Home() {
  const { lang, theme } = useStore()
  const t = useT(lang)

  return (
    <div className={theme}>
      {/* Hero */}
      <section style={{ position:'relative', overflow:'hidden', padding:'100px 24px 80px', textAlign:'center', background:`linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)` }}>
        {/* Bg blobs */}
        <div style={{ position:'absolute', top:-100, left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'rgba(51,102,255,0.06)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, right:'10%', width:300, height:300, borderRadius:'50%', background:'rgba(139,92,246,0.05)', filter:'blur(60px)', pointerEvents:'none' }} />

        <div style={{ maxWidth:780, margin:'0 auto', position:'relative' }} className="fade-in">
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--brand-bg)', border:'1px solid rgba(51,102,255,0.2)', borderRadius:20, padding:'6px 16px', fontSize:12, fontWeight:600, color:'#3366ff', marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#3366ff', animation:'pulse-dot 2s infinite' }} />
            Live on Railway · Django Bootcamp Final Project
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px, 6vw, 68px)', fontWeight:800, color:'var(--text)', lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:20 }}>
            {t.tagline}
          </h1>

          <p style={{ fontSize:'clamp(16px, 2vw, 20px)', color:'var(--text2)', lineHeight:1.7, marginBottom:40, maxWidth:560, margin:'0 auto 40px' }}>
            {t.subtitle}
          </p>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding:'14px 32px', fontSize:15, borderRadius:12 }}>
              Get Started Free →
            </Link>
            <a href="https://remote-team-manager-production.up.railway.app/api/docs/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding:'14px 32px', fontSize:15, borderRadius:12 }}>
              View API Docs ↗
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginTop:64, maxWidth:640, margin:'64px auto 0' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 24px', textAlign:'center', minWidth:120 }} className="card">
              <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding:'80px 24px', background:'var(--bg2)' }}>
        <div style={{ maxWidth:1140, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:12 }}>
              Everything your team needs
            </h2>
            <p style={{ fontSize:16, color:'var(--text2)', maxWidth:480, margin:'0 auto' }}>A complete project management system built with Django REST Framework</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card card-hover" style={{ padding:24, cursor:'default', animationDelay:`${i*0.05}s` }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ padding:'80px 24px', background:'var(--bg)' }}>
        <div style={{ maxWidth:960, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px, 3vw, 38px)', fontWeight:800, color:'var(--text)', marginBottom:12 }}>Built with modern tech</h2>
          <p style={{ fontSize:15, color:'var(--text2)', marginBottom:40 }}>Production-ready stack used in real companies</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {[['Django 4.2','🐍'],['DRF','🔌'],['PostgreSQL','🐘'],['Docker','🐳'],['React 18','⚛️'],['JWT Auth','🔐'],['GitHub Actions','⚙️'],['Railway','🚀']].map(([n, i]) => (
              <div key={n} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:600, color:'var(--text)' }}>
                <span>{i}</span>{n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px', background:'linear-gradient(135deg, #0a1628 0%, #0f2043 50%, #0a1628 100%)', textAlign:'center' }}>
        <div style={{ maxWidth:580, margin:'0 auto' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:16 }}>Ready to get started?</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', marginBottom:36 }}>Create your account and start managing your team today.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding:'14px 32px', fontSize:15, borderRadius:12 }}>Create Free Account</Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding:'14px 32px', fontSize:15, borderRadius:12, borderColor:'rgba(255,255,255,0.2)', color:'#fff' }}>Sign In</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
