import { useStore } from '../store'
import { useT } from '../i18n'
export default function About() {
  const { lang, theme } = useStore()
  const t = useT(lang)
  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card fade-in" style={{ padding: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>{t.aboutTitle}</h1>
          <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 32 }}>{t.aboutDesc}</p>
          <div className="divider" />
          <div style={{ marginTop: 24 }}><h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>🛠️ {t.aboutStack}</h3><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>{['Django 4.2','DRF 3.14','PostgreSQL','Docker','React 18','JWT Auth','GitHub Actions','Railway'].map(tech => <span key={tech} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: 'var(--text2)' }}>{tech}</span>)}</div><p style={{ fontSize: 14, color: 'var(--text2)' }}>👤 {t.aboutAuthor}<br />📅 Django Bootcamp Final Project — April 2026</p></div>
        </div>
      </div>
    </div>
  )
}
