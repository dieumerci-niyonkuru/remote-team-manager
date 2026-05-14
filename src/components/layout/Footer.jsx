import { Link } from 'react-router-dom'

const LINKS = {
  product: [
    { l: 'Dashboard', to: '/dashboard' },
    { l: 'Workspaces', to: '/workspaces' },
    { l: 'Projects', to: '/projects' },
    { l: 'Tasks', to: '/tasks' }
  ],
  company: [
    { l: 'About Us', to: '/about' },
    { l: 'Careers', to: '/about' },
    { l: 'Contact', to: '/about' },
    { l: 'Terms', to: '/about' }
  ]
}

export default function Footer() {
  return (
    <footer id="footer" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '100px 0 40px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 64, marginBottom: 80 }}>
          
          {/* Brand */}
          <div style={{ gridColumn: 'span 1.2' }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', marginBottom:24 }}>
               <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg, var(--brand), #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 10px 20px -5px rgba(51,102,255,0.4)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
               </div>
               <span className="logo-font" style={{ fontSize:22 }}>RemoteTeam</span>
            </Link>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 14, maxWidth: 320 }}>
              The all-in-one mission control for modern teams. Built to scale with your ambition.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 24, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LINKS.product.map(item => (
                <Link key={item.l} to={item.to} style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 14, fontWeight:600 }} className="link-hover">{item.l}</Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div style={{ gridColumn: 'span 1.3' }}>
            <h4 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 16, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Newsletter</h4>
            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
              Get the latest updates on AI, remote work, and Remote Team engineering.
            </p>
            <form style={{ display: 'flex', gap: 10 }}>
              <input className="input" type="email" placeholder="Enter your email" style={{ padding: '12px 16px', fontSize: 14, flex: 1, borderRadius: 12 }} />
              <button className="btn btn-primary" type="button" style={{ padding: '0 24px', borderRadius: 12, fontSize: 14 }}>Subscribe</button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 700, textTransform:'uppercase', letterSpacing:1 }}>
            © {new Date().getFullYear()} RemoteTeam Global. All rights reserved.
          </div>
          <div style={{ display:'flex', gap:24 }}>
             <a href="#" style={{ fontSize:12, color:'var(--text3)', textDecoration:'none', fontWeight:700 }}>PRIVACY</a>
             <a href="#" style={{ fontSize:12, color:'var(--text3)', textDecoration:'none', fontWeight:700 }}>TERMS</a>
             <a href="#" style={{ fontSize:12, color:'var(--text3)', textDecoration:'none', fontWeight:700 }}>SECURITY</a>
          </div>
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
