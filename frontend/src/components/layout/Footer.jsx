import { Link } from 'react-router-dom'

const SOCIAL = [
  { href: 'https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/', icon: 'fa-brands fa-linkedin', iconClass: 'fab fa-linkedin', fallback: '💼' },
  { href: 'https://x.com/dieumercin21', icon: 'fa-brands fa-twitter', iconClass: 'fab fa-twitter', fallback: '🐦' },
  { href: 'https://github.com/dieumerci-niyonkuru', icon: 'fa-brands fa-github', iconClass: 'fab fa-github', fallback: '🐙' },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '2rem 1.5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--brand),var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>R</div>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Remote<span style={{ color: 'var(--brand)' }}>Team</span></span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>Professional remote team management. Built with Django + React.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '0.75rem' }}>PRODUCT</div>
            {['Dashboard', 'Workspaces', 'Projects', 'Tasks', 'Team', 'Activity'].map(l => (
              <Link key={l} to={`/${l.toLowerCase()}`} style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', textDecoration: 'none', padding: '0.25rem 0' }}>{l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '0.75rem' }}>API & DOCS</div>
            {[
              { label: 'API Docs', href: 'https://remote-team-manager-production.up.railway.app/api/docs/' },
              { label: 'Health Check', href: 'https://remote-team-manager-production.up.railway.app/api/health/' },
              { label: 'GitHub', href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', textDecoration: 'none', padding: '0.25rem 0' }}>{l.label} ↗</a>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '0.75rem' }}>CONNECT</div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.5rem', color: 'var(--text)', opacity: 0.7, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
                  {s.fallback}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text3)' }}>
          © 2026 RemoteTeam by Dieu-Merci Niyonkuru – Django Bootcamp Final Project
        </div>
      </div>
    </footer>
  )
}
