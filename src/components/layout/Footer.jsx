import React from 'react';
import { Link } from 'react-router-dom';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SOCIALS = [
  { icon: <GithubIcon />, href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager', label: 'GitHub' },
  { icon: <TwitterIcon />, href: '#', label: 'Twitter / X' },
  { icon: <LinkedInIcon />, href: '#', label: 'LinkedIn' },
];

const YEAR = new Date().getFullYear();

const PRODUCT_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Projects', to: '/projects' },
  { label: 'Tasks', to: '/tasks' },
  { label: 'Team Chat', to: '/chat' },
  { label: 'Video Calls', to: '/call' },
  { label: 'Wiki / Docs', to: '/wiki' },
  { label: 'OKR Tracker', to: '/okr' },
  { label: 'Analytics', to: '/analytics' },
];

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Integrations', to: '/integrations' },
  { label: 'AI Assistant', to: '/ai' },
  { label: 'Privacy Policy', to: '/about' },
  { label: 'Terms of Service', to: '/about' },
];

function NewsletterForm() {
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);

  if (done) {
    return (
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', background: 'var(--success-subtle)', border: '1px solid rgba(16,185,129,0.15)', padding: '8px 14px', borderRadius: 8 }}>
        Subscribed — thank you!
      </div>
    );
  }
  return (
    <form onSubmit={e => { e.preventDefault(); if (email) setDone(true); }} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 360 }}>
      <input
        type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        style={{
          flex: 1, minWidth: 120,
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px',
          color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
        }}
      />
      <button type="submit" style={{
        background: 'var(--brand)', color: '#fff', border: 'none',
        borderRadius: 8, padding: '8px 14px', fontSize: 12,
        fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        Subscribe
      </button>
    </form>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'inherit', borderTop: '1px solid var(--border)' }}>
      <style>{`
        .ft-grid {
          max-width: 1100px; margin: 0 auto;
          padding: clamp(24px,4vw,40px) clamp(16px,4vw,32px);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px,1fr));
          gap: clamp(20px,3vw,32px) clamp(16px,3vw,24px);
        }
        .ft-bottom {
          display: flex; align-items: center;
          justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        @media (max-width: 480px) {
          .ft-bottom { flex-direction: column; align-items: center; text-align: center; }
          .ft-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 320px) {
          .ft-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Top strip */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px clamp(16px,4vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.png" alt="RemoteTeam" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Remote<span style={{ color: 'var(--brand)' }}>Team</span>
              </span>
              <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 1 }}>Enterprise Workspace OS</div>
            </div>
          </Link>

          <p style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 260, lineHeight: 1.6, margin: 0, flex: '1 1 160px' }}>
            The all-in-one platform for distributed teams — projects, chat, video, analytics & AI.
          </p>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--brand)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="ft-grid">
        <div>
          <h4 style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Product</h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRODUCT_LINKS.map(l => (
              <li key={l.label}>
                <Link to={l.to} style={{ color: 'var(--text3)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
                >{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Company</h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COMPANY_LINKS.map(l => (
              <li key={l.label}>
                <Link to={l.to} style={{ color: 'var(--text3)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
                >{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <h4 style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Stay Updated</h4>
          <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6, margin: '0 0 12px' }}>
            Get product updates & remote work insights — no spam.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '0 clamp(16px,4vw,32px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 0' }}>
          <div className="ft-bottom">
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
              &copy; {YEAR} RemoteTeam Manager. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <Link key={item} to="/about"
                  style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
                >{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
