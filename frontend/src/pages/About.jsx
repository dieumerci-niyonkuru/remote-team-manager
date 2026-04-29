import { useStore } from '../store'
import { useT } from '../i18n'

export default function About() {
  const { theme, lang } = useStore()
  const t = useT(lang)
  return (
    <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 16 }}>About Remote Team Manager</h1>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>{t.aboutDesc}</p>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Tech Stack</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {['Django 4.2', 'DRF', 'PostgreSQL', 'Docker', 'React 18', 'JWT Auth', 'GitHub Actions', 'Railway', 'Netlify'].map(tech => (
              <span key={tech} className="badge badge-blue">{tech}</span>
            ))}
          </div>
          <p>Created by Dieu-Merci Niyonkuru as a Django Bootcamp Final Project.</p>
        </div>
      </div>
    </div>
  )
}
