import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '2rem 1rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text3)' }}>
        <p>© 2026 Remote Team Manager – Built with Django & React. All rights reserved.</p>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/about" style={{ color: 'var(--text2)', textDecoration: 'none' }}>About</a>
          <a href="/privacy" style={{ color: 'var(--text2)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: 'var(--text2)', textDecoration: 'none' }}>Terms</a>
        </div>
      </div>
    </footer>
  )
}
