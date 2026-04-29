import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'

const features = [
  { icon: '🔐', title: 'JWT Authentication', desc: 'Secure login with JWT tokens.', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop' },
  { icon: '🏢', title: 'Multi-Workspace', desc: 'Separate spaces for different teams.', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Owner, Manager, Developer, Viewer.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop' },
  { icon: '📋', title: 'Kanban Board', desc: 'Visual task management.', img: 'https://images.unsplash.com/photo-1611224885990-ab7363d3f2a6?w=400&h=300&fit=crop' },
  { icon: '⏱️', title: 'Time Logging', desc: 'Track hours per task.', img: 'https://images.unsplash.com/photo-1506784926709-22f1ec395e3a?w=400&h=300&fit=crop' },
  { icon: '📊', title: 'Performance', desc: 'Team productivity insights.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' },
  { icon: '💬', title: 'Team Chat', desc: 'Real-time communication.', img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop' },
  { icon: '🧠', title: 'Knowledge Base', desc: 'Centralised documentation.', img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop' },
]

export default function Home() {
  const { theme, lang } = useStore()
  const t = useT(lang)
  return (
    <div className={theme}>
      {/* Hero with collaboration image background */}
      <section style={{ background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=600&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '5rem 1rem', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }} className="fade-in">
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>{t.tagline}</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{t.subtitle}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">Get Started Free →</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features with images */}
      <section style={{ padding: '4rem 1rem', background: 'var(--bg2)' }}>
        <div className="container"><h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Everything your team needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '2rem' }}>
            {features.map(f => (
              <div key={f.title} className="card card-hover" style={{ padding: '0', overflow: 'hidden', cursor: 'default' }}>
                <img src={f.img} alt={f.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem 1.2rem 1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{f.icon}</span>
                    <h3 style={{ fontSize: '1.1rem' }}>{f.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text2)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
