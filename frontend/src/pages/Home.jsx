import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'

export default function Home() {
  const { lang, theme } = useStore()
  const t = useT(lang)

  const features = [
    { icon: '🔐', title: 'JWT Authentication', desc: 'Secure login with access + refresh tokens.' },
    { icon: '🏢', title: 'Multi-Workspace', desc: 'Create multiple workspaces for different teams or clients.' },
    { icon: '👥', title: 'Role-Based Access', desc: 'Owner, Manager, Developer, Viewer — precise permissions.' },
    { icon: '📋', title: 'Kanban Board', desc: 'Visual task management with To Do, In Progress, Done columns.' },
    { icon: '⏱️', title: 'Time Logging', desc: 'Track hours spent on tasks. Managers see all logs.' },
    { icon: '⚡', title: 'Activity Feed', desc: 'Real‑time log of every action in your workspace.' },
    { icon: '🌍', title: '3 Languages', desc: 'English, Français, Kinyarwanda — switch instantly.' },
    { icon: '🐳', title: 'Docker Ready', desc: 'Fully containerised with Docker + PostgreSQL + CI/CD.' },
  ]

  return (
    <div className={theme}>
      {/* Hero section */}
      <section style={{
        background: `linear-gradient(135deg, #0b1120 0%, #1e293b 100%)`,
        padding: '5rem 1.5rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 className="fade-in-up" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            {t.tagline}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', opacity: 0.9, marginBottom: '2rem' }}>
            {t.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              {t.signupFree} →
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }}>
              {t.login}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--bg2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '3rem' }}>
            Everything your team needs
          </h2>
          <div className="grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card card-hover" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
