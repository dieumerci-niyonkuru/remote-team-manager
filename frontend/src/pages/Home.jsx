import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'

export default function Home() {
  const { lang, theme } = useStore()
  const t = useT(lang)

  const features = [
    { icon: '🔐', title: 'JWT Authentication', desc: 'Secure login with access + refresh tokens.' },
    { icon: '🏢', title: 'Multi‑Workspace', desc: 'Separate spaces for different teams or clients.' },
    { icon: '👥', title: 'Role‑Based Access', desc: 'Owner, Manager, Developer, Viewer – precise permissions.' },
    { icon: '📋', title: 'Kanban Board', desc: 'Visual task management with columns: To Do, In Progress, Done.' },
    { icon: '⏱️', title: 'Time Logging', desc: 'Track hours per task. Managers see all team logs.' },
    { icon: '⚡', title: 'Activity Feed', desc: 'Real‑time log of every action in your workspace.' },
    { icon: '🌍', title: '3 Languages', desc: 'English, Français, Kinyarwanda – switch instantly.' },
    { icon: '🐳', title: 'Docker Ready', desc: 'Fully containerised with PostgreSQL + CI/CD pipeline.' },
  ]

  const stats = [
    { value: '70+', label: 'Automated Tests' },
    { value: '100%', label: 'API Coverage' },
    { value: '4', label: 'RBAC Roles' },
    { value: 'Live', label: 'On Railway' },
  ]

  return (
    <div className={theme} style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0b1120 0%, #1e293b 100%)', padding: '5rem 1.5rem', textAlign: 'center', color: 'white' }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 className="fade-in-up" style={{ fontSize: 'clamp(2rem, 6vw, 3.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            {t.tagline}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', opacity: 0.9, marginBottom: '2rem' }}>
            {t.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', borderRadius: '40px' }}>Get Started Free →</Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', borderRadius: '40px', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 1.5rem', background: 'var(--bg2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {stats.map(stat => (
              <div key={stat.label} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--bg)' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>Everything Your Team Needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.8rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card card-hover" style={{ padding: '1.8rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text2)', lineHeight: 1.5, fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.8rem)', color: 'white', marginBottom: '1rem' }}>Ready to Boost Your Team's Productivity?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Join thousands of teams already using RemoteTeam.</p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.7rem 2rem' }}>Start Free Trial →</Link>
        </div>
      </section>
    </div>
  )
}
