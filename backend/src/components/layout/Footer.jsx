import { Link } from 'react-router-dom'

const SOCIAL = [
  { href:'https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/', icon:'💼', label:'LinkedIn' },
  { href:'https://x.com/dieumercin21', icon:'🐦', label:'X / Twitter' },
  { href:'https://github.com/dieumerci-niyonkuru', icon:'🐙', label:'GitHub' },
]

export default function Footer() {
  return (
    <footer id="footer" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '100px 0 60px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, marginBottom: 80 }}>
          
          {/* Brand & Mission */}
          <div style={{ gridColumn: 'span 1.5' }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none', marginBottom:32 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 10px 20px -5px rgba(51,102,255,0.4)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span className="logo-font" style={{ fontSize:26 }}>NexusTeams</span>
            </Link>
            <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 16, maxWidth: 420 }}>
              NexusTeams is an enterprise-grade mission control platform designed to unify remote workforces, streamline complex workflows, and protect mission-critical assets globally.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 20 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text3)', textDecoration: 'none', fontWeight: 800, fontSize: 13, textTransform:'uppercase', letterSpacing:1 }} className="link-hover">{s.label}</a>
              ))}
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 style={{ color: 'var(--text)', fontWeight: 900, marginBottom: 32, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 }}>Intelligence</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { l: 'Command Center', to: '/dashboard' },
                { l: 'Communication', to: '/chat' },
                { l: 'Timeline', to: '/calendar' },
                { l: 'Knowledge Base', to: '/wiki' },
                { l: 'Resource Library', to: '/files' }
              ].map(item => (
                <Link key={item.l} to={item.to} style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 15, fontWeight:600 }} className="link-hover">{item.l}</Link>
              ))}
            </div>
          </div>

          {/* Map & Presence */}
          <div>
            <h4 style={{ color: 'var(--text)', fontWeight: 900, marginBottom: 32, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 }}>Regional HQ</h4>
            <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', height: 200, background: 'var(--bg2)', position:'relative' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127606.31952219808!2d29.988081691357422!3d-1.9440733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca429ed308f25%3A0x10c9e03307d90!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1714777860601!5m2!1sen!2sus" 
                width="100%" height="100%" style={{ border: 0, filter: 'grayscale(1) invert(1) opacity(0.6)' }} allowFullScreen="" loading="lazy">
              </iframe>
              <div style={{ position:'absolute', bottom:16, left:16, right:16, background:'rgba(var(--bg-rgb), 0.8)', backdropFilter:'blur(10px)', padding:'8px 12px', borderRadius:12, fontSize:11, fontWeight:800, color:'var(--text)', border:'1px solid var(--border)', textAlign:'center' }}>
                 📍 KIGALI INNOVATION CITY, RWANDA
              </div>
            </div>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 16, fontWeight: 700, textAlign:'center' }}>Support: dieumercin21@gmail.com</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ paddingTop: 40, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ color: 'var(--text3)', fontSize: 14, fontWeight: 600 }}>
            © 2026 NexusTeams Technologies. Engineered for the future of Rwanda.
          </div>
          <div style={{ display: 'flex', gap: 32, fontSize:14, fontWeight:800, color:'var(--text)' }}>
             Built by Dieu-Merci Niyonkuru
          </div>
        </div>
      </div>
      <style>{`
        .link-hover:hover { color: var(--brand) !important; transform: translateX(4px); }
        .link-hover { transition: 0.2s; display: inline-block; }
      `}</style>
    </footer>
  )
}
