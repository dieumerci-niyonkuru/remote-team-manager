import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../store'
import { useT } from '../i18n'

const featuresData = [
  { icon: '🔐', title: 'JWT Authentication', desc: 'Secure login with access + refresh tokens.', longDesc: 'JWT ensures stateless authentication. Tokens auto-refresh on expiry. This system uses SimpleJWT with blacklisting.' },
  { icon: '🏢', title: 'Multi-Workspace', desc: 'Create multiple workspaces for different teams.', longDesc: 'Each workspace has its own members, projects, tasks, and permissions. Perfect for agencies or freelancers.' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Owner, Manager, Developer, Viewer – precise permissions.', longDesc: 'RBAC controls what each role can do: Owner (full), Manager (create projects), Developer (edit tasks), Viewer (read-only).' },
  { icon: '📋', title: 'Kanban Board', desc: 'Visual task management with To Do, In Progress, Done.', longDesc: 'Drag & drop tasks between columns. Subtasks auto-update parent progress.' },
  { icon: '⏱️', title: 'Time Logging', desc: 'Track hours spent on tasks.', longDesc: 'Developers log hours; managers see all team logs. Perfect for billing.' },
  { icon: '⚡', title: 'Activity Feed', desc: 'Real-time log of every action.', longDesc: 'Every create, update, delete is recorded with actor, timestamp, and object.' },
  { icon: '🌍', title: '3 Languages', desc: 'English, Français, Kinyarwanda.', longDesc: 'Switch instantly – all UI text changes, powered by i18n.' },
  { icon: '🐳', title: 'Docker Ready', desc: 'Containerised with PostgreSQL + CI/CD.', longDesc: 'Runs anywhere – Railway, AWS, Vercel. Includes GitHub Actions pipeline.' },
]

export default function Home() {
  const { lang, theme } = useStore()
  const t = useT(lang)
  const [selectedFeature, setSelectedFeature] = useState(null)

  return (
    <div className={theme}>
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }} className="fade-in">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)', lineHeight: 1.1, marginBottom: 20 }}>{t.tagline}</h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginBottom: 40 }}>{t.subtitle}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15, borderRadius: 12 }}>Get Started Free →</Link>
            <a href="https://remote-team-manager-production.up.railway.app/api/docs/" target="_blank" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: 15, borderRadius: 12, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>View API Docs ↗</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 64 }}>
          {[['70+','Automated Tests'],['100%','API Coverage'],['4','RBAC Roles'],['Live','On Railway']].map(([v,l]) => (
            <div key={l} className="card" style={{ padding: '16px 24px', textAlign: 'center', minWidth: 120, background: 'rgba(20,30,48,0.7)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" style={{ padding: '80px 24px', background: 'var(--bg2)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'var(--text)' }}>Everything your team needs</h2>
          <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 480, margin: '12px auto 0' }}>Click any feature to learn more</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, maxWidth: 1140, margin: '0 auto' }}>
          {featuresData.map((f, i) => (
            <div key={i} className="card card-hover" onClick={() => setSelectedFeature(f)} style={{ padding: 24, textAlign: 'left', cursor: 'pointer', background: 'var(--bg-card)', backdropFilter: 'blur(4px)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature modal */}
      {selectedFeature && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setSelectedFeature(null)}>
          <div className="card scale-in" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 40 }}>{selectedFeature.icon}</div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{selectedFeature.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>{selectedFeature.longDesc}</p>
            <button className="btn-primary" onClick={() => setSelectedFeature(null)} style={{ width: '100%' }}>Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}
