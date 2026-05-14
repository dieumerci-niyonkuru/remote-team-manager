import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  about: [
    { label: 'Customers', to: '/about' },
    { label: 'Our Team', to: '/about' },
    { label: 'Careers', to: '/about' },
    { label: 'Integrations', to: '/integrations' },
    { label: 'Partners', to: '/about' },
    { label: 'Investors', to: '/about' },
    { label: 'Press', to: '/about' },
    { label: 'Sustainability & ESG', to: '/about' },
    { label: 'RemoteTeam Cares', to: '/about' },
    { label: 'Media Kit', to: '/about' },
    { label: 'How To Videos', to: '/about' },
    { label: 'Developer Platform', to: '/about' }
  ],
  download: [
    { label: 'RemoteTeam App', to: '/about' },
    { label: 'RemoteTeam Rooms', to: '/about' },
    { label: 'Rooms Controller', to: '/about' },
    { label: 'Browser Extension', to: '/about' },
    { label: 'Outlook Plug-in', to: '/about' },
    { label: 'iPhone/iPad App', to: '/about' },
    { label: 'Android App', to: '/about' },
    { label: 'Virtual Backgrounds', to: '/about' }
  ],
  sales: [
    { label: 'Contact Sales', to: '/about' },
    { label: 'Plans & Pricing', to: '/about' },
    { label: 'Request a Demo', to: '/about' },
    { label: 'Webinars and Events', to: '/about' },
    { label: 'Experience Center', to: '/about' },
    { label: 'RemoteTeam for Startups', to: '/about' }
  ],
  support: [
    { label: 'Test RemoteTeam', to: '/about' },
    { label: 'Account', to: '/dashboard' },
    { label: 'Support Center', to: '/about' },
    { label: 'Learning Center', to: '/about' },
    { label: 'Community', to: '/about' },
    { label: 'Technical Library', to: '/about' },
    { label: 'Feedback', to: '/about' },
    { label: 'Contact Us', to: '/about' },
    { label: 'Accessibility', to: '/about' }
  ]
}

export default function Footer() {
  return (
    <footer id="footer" style={{ background: '#f5f5f7', borderTop: '1px solid #e5e5e5', padding: '80px 0 40px' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 64 }}>
          
          {/* About */}
          <div>
            <h4 style={{ color: '#000', fontWeight: 700, marginBottom: 24, fontSize: 14 }}>About</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FOOTER_LINKS.about.map(item => (
                <Link key={item.label} to={item.to} style={{ color: '#666', textDecoration: 'none', fontSize: 13 }} className="zoom-link">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Download */}
          <div>
            <h4 style={{ color: '#000', fontWeight: 700, marginBottom: 24, fontSize: 14 }}>Download</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FOOTER_LINKS.download.map(item => (
                <Link key={item.label} to={item.to} style={{ color: '#666', textDecoration: 'none', fontSize: 13 }} className="zoom-link">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Sales */}
          <div>
            <h4 style={{ color: '#000', fontWeight: 700, marginBottom: 24, fontSize: 14 }}>Sales</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FOOTER_LINKS.sales.map(item => (
                <Link key={item.label} to={item.to} style={{ color: '#666', textDecoration: 'none', fontSize: 13 }} className="zoom-link">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: '#000', fontWeight: 700, marginBottom: 24, fontSize: 14 }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FOOTER_LINKS.support.map(item => (
                <Link key={item.label} to={item.to} style={{ color: '#666', textDecoration: 'none', fontSize: 13 }} className="zoom-link">{item.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: 40 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
             <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'#0b5cff', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <span style={{ fontSize:18, fontWeight:900, color:'#000' }}>RemoteTeam</span>
             </Link>
           </div>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ color: '#666', fontSize: 12 }}>
                Copyright ©{new Date().getFullYear()} RemoteTeam Workspace, Inc. All rights reserved.
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                 {['Terms', 'Privacy', 'Trust Center', 'Acceptable Use', 'Legal & Compliance', 'Cookies Settings', 'Site Map'].map(l => (
                   <a key={l} href="#" style={{ color:'#666', textDecoration:'none', fontSize:12, fontWeight:500 }}>{l}</a>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <style>{`
        .zoom-link:hover { color: #0b5cff !important; text-decoration: underline !important; }
      `}</style>
    </footer>
  )
}
