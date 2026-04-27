import { Link } from 'react-router-dom'
const SOCIAL = [
  { href: 'https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/', icon: '💼', label: 'LinkedIn' },
  { href: 'https://x.com/dieumercin21', icon: '🐦', label: 'X / Twitter' },
  { href: 'https://github.com/dieumerci-niyonkuru', icon: '🐙', label: 'GitHub' },
]
export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '48px 24px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3366ff,#6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>R</div><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Remote<span style={{ color: '#3366ff' }}>Team</span></span></div><p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Professional remote team management. Built with Django + React.</p></div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Product</div>{['Dashboard', 'Workspaces', 'Projects', 'Tasks', 'Team', 'Activity'].map(l => <Link key={l} to={`/${l.toLowerCase()}`} style={{ display: 'block', fontSize: 13, color: 'var(--text2)', textDecoration: 'none', padding: '5px 0' }} onMouseEnter={e => e.target.style.color = '#3366ff'} onMouseLeave={e => e.target.style.color = 'var(--text2)'}>{l}</Link>)}</div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>API & Docs</div>{[
            { label: 'API Documentation', href: 'https://remote-team-manager-production.up.railway.app/api/docs/' },
            { label: 'Health Check', href: 'https://remote-team-manager-production.up.railway.app/api/health/' },
            { label: 'GitHub Repo', href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager' },
          ].map(l => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 13, color: 'var(--text2)', textDecoration: 'none', padding: '5px 0' }} onMouseEnter={e => e.target.style.color = '#3366ff'} onMouseLeave={e => e.target.style.color = 'var(--text2)'}>{l.label} ↗</a>)}</div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Connect</div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{SOCIAL.map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, textDecoration: 'none', transition: '0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3366ff'; e.currentTarget.style.background = 'var(--brand-bg)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)' }}><span style={{ fontSize: 16 }}>{s.icon}</span><span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.label}</span></a>)}</div></div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>© 2026 RemoteTeam by <strong style={{ color: 'var(--text2)' }}>Dieu-Merci Niyonkuru</strong> – Django Bootcamp Final Project.</p>
          <div style={{ display: 'flex', gap: 16 }}>{SOCIAL.map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, textDecoration: 'none', opacity: 0.7 }} onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.7'}>{s.icon}</a>)}</div>
        </div>
      </div>
    </footer>
  )
}
