import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'

const features = [
  { icon: '🔐', title: 'JWT Authentication', desc: 'Secure login with JWT tokens.', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop' },
  { icon: '🏢', title: 'Multi-Workspace', desc: 'Separate spaces for different teams.', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Owner, Manager, Developer, Viewer.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop' },
  { icon: '📋', title: 'Kanban Board', desc: 'Visual task management.', img: 'https://images.unsplash.com/photo-1611224885990-ab7363d3f2a6?w=400&h=300&fit=crop' },
  { icon: '💬', title: 'Team Chat', desc: 'Real-time communication.', img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop' },
  { icon: '📊', title: 'Performance', desc: 'Team productivity insights.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' },
]

export default function Home() {
  const { theme } = useStore()
  const t = useT(useStore.getState().lang)
  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero section */}
      <section style={{ background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=500&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'var(--font-display)', color: 'white', marginBottom: 16 }}>{t.tagline}</h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>{t.subtitle}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: 30 }}>Get Started Free →</Link>
            <Link to="/login" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: 30, background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>Everything your team needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={f.img} alt={f.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.6rem' }}>{f.icon}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{f.title}</h3>
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
