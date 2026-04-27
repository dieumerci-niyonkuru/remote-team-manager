import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../store'
import { useT } from '../i18n'

const featuresData = [
  {
    icon: '🔐',
    title: 'JWT Authentication',
    desc: 'Secure login with token auto-refresh.',
    longDesc: 'JWT ensures stateless authentication. Tokens auto-refresh on expiry.',
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format'
  },
  {
    icon: '🏢',
    title: 'Multi-Workspace',
    desc: 'Separate spaces for different teams.',
    longDesc: 'Each workspace has its own members, projects, tasks, and permissions.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format'
  },
  {
    icon: '👥',
    title: 'Role-Based Access',
    desc: 'Owner, Manager, Developer, Viewer.',
    longDesc: 'RBAC controls what each role can do – full control down to read‑only.',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format'
  },
  {
    icon: '📋',
    title: 'Kanban Board',
    desc: 'Visual task management columns.',
    longDesc: 'Drag & drop tasks between To Do, In Progress, Done. Subtasks auto-update progress.',
    img: 'https://images.unsplash.com/photo-1611224885990-ab7363d3f2a6?w=600&auto=format'
  },
  {
    icon: '⏱️',
    title: 'Time Logging',
    desc: 'Track hours per task.',
    longDesc: 'Log time on tasks; managers see all team logs.',
    img: 'https://images.unsplash.com/photo-1506784926709-22f1ec395e3a?w=600&auto=format'
  },
  {
    icon: '⚡',
    title: 'Activity Feed',
    desc: 'Real-time action log.',
    longDesc: 'Every create, update, delete is recorded with actor and timestamp.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format'
  },
  {
    icon: '🌍',
    title: '3 Languages',
    desc: 'English, Français, Kinyarwanda.',
    longDesc: 'Switch instantly – all UI text changes, powered by i18n.',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format'
  },
  {
    icon: '🐳',
    title: 'Docker Ready',
    desc: 'Containerised + CI/CD.',
    longDesc: 'Runs anywhere – Railway, AWS, Vercel. Includes GitHub Actions pipeline.',
    img: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format'
  }
]

export default function Home() {
  const { lang, theme } = useStore()
  const t = useT(lang)
  const [selectedFeature, setSelectedFeature] = useState(null)

  return (
    <div className={theme}>
      {/* Hero section with collaboration image */}
      <section style={{
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1rem' }}>{t.tagline}</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>{t.subtitle}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">Get Started Free →</Link>
            <a href="https://remote-team-manager-production.up.railway.app/api/docs/" target="_blank" className="btn btn-secondary" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.3)' }}>View API Docs ↗</a>
          </div>
        </div>
      </section>

      {/* Features section with images */}
      <section id="features" style={{ padding: '4rem 1.5rem', background: 'var(--bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text)' }}>Everything your team needs</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text2)', maxWidth: 560, margin: '0.5rem auto 0' }}>Click any feature to learn more</p>
          </div>
          <div className="grid-auto">
            {featuresData.map((f, i) => (
              <div key={i} className="card" onClick={() => setSelectedFeature(f)} style={{ padding: '1.5rem', cursor: 'pointer' }}>
                <img src={f.img} alt={f.title} className="feature-img" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>{f.icon}</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{f.title}</h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature modal */}
      {selectedFeature && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setSelectedFeature(null)}>
          <div className="card scale-in" style={{ maxWidth: 500, width: '90%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedFeature.icon}</span>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{selectedFeature.title}</h3>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>{selectedFeature.longDesc}</p>
            <button className="btn btn-primary" onClick={() => setSelectedFeature(null)} style={{ marginTop: '1.5rem', width: '100%' }}>Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}
