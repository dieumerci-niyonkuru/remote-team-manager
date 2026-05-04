import { Link } from 'react-router-dom'

const SOCIAL = [
  { href:'https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/', icon:'💼', label:'LinkedIn' },
  { href:'https://x.com/dieumercin21', icon:'🐦', label:'X / Twitter' },
  { href:'https://github.com/dieumerci-niyonkuru', icon:'🐙', label:'GitHub' },
]

export default function Footer() {
  return (
    <footer style={{ background:'var(--bg)', borderTop:'1px solid var(--border)', padding:'80px 24px 40px' }}>
      <div className="container">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:48, marginBottom:64 }}>
          {/* Brand & Address */}
          <div>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:24 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontWeight:800, fontSize:18 }}>R</div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--text)', letterSpacing:'-0.03em' }}>NexusTeams</span>
            </Link>
            <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.7, marginBottom:24 }}>
              The world's first AI-powered remote management platform built for speed and security.
            </p>
            <div style={{ fontSize:13, color:'var(--text2)', display:'flex', flexDirection:'column', gap:8 }}>
              <span>📍 Kigali, Rwanda</span>
              <span>📧 dieumercin21@gmail.com</span>
              <a href="https://maps.app.goo.gl/V2rwyZe58N3MpkuD6" target="_blank" rel="noopener noreferrer" style={{ color:'var(--brand)', textDecoration:'none', fontWeight:600 }}>View on Google Maps ➜</a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:1, marginBottom:24 }}>Company</h4>
            {['Dashboard', 'Pricing', 'Workspaces', 'Chat', 'Wiki', 'Team'].map(l => (
              <Link key={l} to={`/${l.toLowerCase()}`} style={{ display:'block', fontSize:14, color:'var(--text2)', textDecoration:'none', padding:'8px 0', transition:'var(--transition)' }}
                onMouseEnter={e => e.target.style.color='var(--brand)'} onMouseLeave={e => e.target.style.color='var(--text2)'}>{l}</Link>
            ))}
          </div>

          {/* Map Preview */}
          <div style={{ gridColumn:'span 2' }} className="hide-mobile">
             <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:1, marginBottom:24 }}>Global Headquarters</h4>
             <div style={{ width:'100%', height:200, borderRadius:16, overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg2)', position:'relative' }}>
                <a href="https://maps.app.goo.gl/V2rwyZe58N3MpkuD6" target="_blank" rel="noopener noreferrer" style={{ display:'block', width:'100%', height:'100%', backgroundImage:'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000)', backgroundSize:'cover', backgroundPosition:'center' }}>
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700 }}>Click to Open Map</div>
                </a>
             </div>
          </div>
        </div>

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:32, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
          <p style={{ fontSize:13, color:'var(--text3)' }}>© 2026 NexusTeams. All rights reserved. Designed by <strong>Dieu-Merci Niyonkuru</strong>.</p>
          <div style={{ display:'flex', gap:24 }}>
            {SOCIAL.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize:20, textDecoration:'none', color:'var(--text2)', transition:'var(--transition)' }}
                onMouseEnter={e => e.target.style.color='var(--brand)'} onMouseLeave={e => e.target.style.color='var(--text2)'}>{s.icon}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
