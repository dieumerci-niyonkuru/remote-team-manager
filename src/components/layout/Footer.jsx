import { Link } from 'react-router-dom'

const SOCIAL = [
  { href:'https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/', icon:'💼', label:'LinkedIn' },
  { href:'https://x.com/dieumercin21', icon:'🐦', label:'X / Twitter' },
  { href:'https://github.com/dieumerci-niyonkuru', icon:'🐙', label:'GitHub' },
]

export default function Footer() {
  return (
    <footer style={{ background:'var(--bg)', borderTop:'1px solid var(--border)', padding:'100px 24px 60px' }}>
      <div className="container">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:64, marginBottom:80 }}>
          {/* Brand & Mission */}
          <div style={{ gridColumn:'span 1.5' }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', marginBottom:32 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 10px 20px -5px rgba(51,102,255,0.4)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span className="logo-font">NexusTeams</span>
            </Link>
            <p style={{ fontSize:16, color:'var(--text2)', lineHeight:1.8, marginBottom:32, maxWidth:400 }}>
              The world's most advanced remote-first collaboration platform. Empowering teams to build, scale, and win together.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:15, color:'var(--text2)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:18 }}>📍</span> Kigali, Rwanda
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:18 }}>📧</span> dieumercin21@gmail.com
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }}>
            <div>
              <h4 style={{ fontSize:14, fontWeight:900, color:'var(--text)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:32 }}>Company</h4>
              {['Home', 'About', 'Pricing', 'Blog', 'Careers'].map(l => (
                <Link key={l} to={l === 'Home' ? '/' : `/#${l.toLowerCase()}`} style={{ display:'block', fontSize:15, color:'var(--text3)', textDecoration:'none', padding:'10px 0', transition:'var(--transition)', fontWeight:500 }}
                  onMouseEnter={e => e.target.style.color='var(--brand)'} onMouseLeave={e => e.target.style.color='var(--text3)'}>{l}</Link>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize:14, fontWeight:900, color:'var(--text)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:32 }}>Platform</h4>
              {['Features', 'Security', 'Enterprise', 'API', 'Status'].map(l => (
                <Link key={l} to={`/${l.toLowerCase()}`} style={{ display:'block', fontSize:15, color:'var(--text3)', textDecoration:'none', padding:'10px 0', transition:'var(--transition)', fontWeight:500 }}
                  onMouseEnter={e => e.target.style.color='var(--brand)'} onMouseLeave={e => e.target.style.color='var(--text3)'}>{l}</Link>
              ))}
            </div>
          </div>

          {/* Map Preview */}
          <div>
             <h4 style={{ fontSize:14, fontWeight:900, color:'var(--text)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:32 }}>Headquarters</h4>
             <div style={{ width:'100%', height:220, borderRadius:24, overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg2)', position:'relative', boxShadow:'var(--shadow-lg)' }}>
                <a href="https://maps.app.goo.gl/V2rwyZe58N3MpkuD6" target="_blank" rel="noopener noreferrer" style={{ display:'block', width:'100%', height:'100%', backgroundImage:'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000)', backgroundSize:'cover', backgroundPosition:'center', transition:'transform 0.5s ease' }}
                  onMouseEnter={e => e.target.style.transform='scale(1.05)'} onMouseLeave={e => e.target.style.transform='scale(1)'}>
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, backdropFilter:'blur(2px)' }}>OPEN GOOGLE MAPS</div>
                </a>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:40, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
          <p style={{ fontSize:14, color:'var(--text3)', fontWeight:500 }}>
            © 2026 NexusTeams. All rights reserved. Built with 💎 by <strong style={{ color:'var(--text)' }}>Dieu-Merci Niyonkuru</strong>.
          </p>
          <div style={{ display:'flex', gap:32 }}>
            {SOCIAL.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize:22, textDecoration:'none', color:'var(--text3)', transition:'var(--transition)' }}
                onMouseEnter={e => e.target.style.color='var(--brand)'} onMouseLeave={e => e.target.style.color='var(--text3)'}>{s.icon}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
