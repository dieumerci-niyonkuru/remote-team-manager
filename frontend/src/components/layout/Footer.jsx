import { useStore } from '../../store'

export default function Footer() {
  const { theme } = useStore()
  return (
    <footer style={{ 
      background: 'var(--bg2)', 
      borderTop: '1px solid var(--border)', 
      padding: '1.5rem 1rem',
      marginTop: 'auto',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '0.5rem' }}>
          © 2026 Remote Team Manager | Built with Django + React
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a href="https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '1rem' }}>💼</a>
          <a href="https://x.com/dieumercin21" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '1rem' }}>🐦</a>
          <a href="https://github.com/dieumerci-niyonkuru" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '1rem' }}>🐙</a>
        </div>
      </div>
    </footer>
  )
}
