import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store'
import { getT } from '../../i18n'

/* ── Social icon SVGs ─────────────────────────────────────── */
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
)

const YEAR = new Date().getFullYear()

const SOCIALS = [
  { icon: <GithubIcon />, href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager', label: 'GitHub' },
  { icon: <TwitterIcon />, href: '#', label: 'Twitter / X' },
  { icon: <LinkedinIcon />, href: '#', label: 'LinkedIn' },
  { icon: <YoutubeIcon />, href: '#', label: 'YouTube' },
]

export default function Footer() {
  const { lang = 'en' } = useStore()
  const t = getT(lang)

  const usefulLinks = [
    { label: t('nav.dashboard', 'Dashboard'), to: '/dashboard' },
    { label: t('nav.projects', 'Projects & Tasks'), to: '/projects' },
    { label: t('nav.team', 'Team Collaboration'), to: '/team' },
    { label: t('nav.chat', 'Chat & Messages'), to: '/chat' },
    { label: t('nav.wiki', 'Knowledge Base'), to: '/wiki' },
  ]

  const aboutLinks = [
    { label: t('nav.about', 'About Us'), to: '/about' },
    { label: 'Our Mission', to: '/about' },
    { label: 'Careers', to: '/about' },
    { label: 'Privacy Policy', to: '/about' },
    { label: 'Terms of Service', to: '/about' },
  ]

  const supportHours = [
    { day: 'Mon – Fri', hours: '09:00 AM – 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM – 2:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ]

  return (
    <footer style={{ background: '#060b18', color: '#fff', fontFamily: 'var(--font-body)' }}>

      {/* ── Top bar: Logo + Socials ─────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d1f40 100%)',
        borderBottom: '3px solid #f59e0b',
        padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Diamond pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 20px)',
          pointerEvents: 'none'
        }} />

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 20px rgba(51,102,255,0.4)', padding: 10, overflow: 'hidden'
          }}>
            <img src="/logo.png" alt="RT" style={{ width: '100%', objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Remote<span style={{ color: 'var(--brand)' }}>Team</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 3 }}>
              Enterprise Workspace OS
            </div>
          </div>
        </Link>

        {/* Social icons */}
        <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
          {SOCIALS.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#fff', color: '#0a1628',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* ── Main Content Area ───────────────────────────────── */}
      <div style={{ padding: '40px 40px 32px', maxWidth: 1300, margin: '0 auto' }}>

        {/* 3-column content card */}
        <div style={{
          border: '2px solid #f59e0b',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'linear-gradient(135deg, #0d1f40 0%, #0a1930 100%)',
        }}>

          {/* Column 1 — Useful Links */}
          <div style={{ padding: '36px 36px', borderRight: '1px solid rgba(245,158,11,0.3)' }}>
            <h4 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 24, letterSpacing: '-0.02em' }}>
              {t('nav.useful_links', 'Useful Links')}
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {usefulLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 15,
                    fontWeight: 500, transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 8
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — About RemoteTeam */}
          <div style={{ padding: '36px 36px', borderRight: '1px solid rgba(245,158,11,0.3)' }}>
            <h4 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em' }}>
              {t('nav.about_remoteteam', 'About RemoteTeam')}
            </h4>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
              RemoteTeam is the all-in-one workspace platform for distributed teams — combining project management, real-time chat, analytics, and AI in a single intelligent OS.
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {aboutLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14,
                    fontWeight: 500, transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 8
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Working Hours + Short Map */}
          <div style={{ padding: '36px 36px' }}>
            <h4 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em' }}>
              Working Hours
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {supportHours.map(row => (
                <div key={row.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{row.day}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.hours === 'Closed' ? '#ef4444' : '#f59e0b' }}>
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 700 }}>Based in</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>🌍 Kigali, Rwanda</p>
            </div>

            {/* Short Google Map */}
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(245,158,11,0.3)', height: 140 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.123456789!2d30.061887!3d-1.944896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19d6981900000001%3A0x123456789abcdef!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kigali, Rwanda"
              />
            </div>
          </div>
        </div>

        {/* Newsletter strip */}
        <div style={{
          marginTop: 24, padding: '18px 28px', borderRadius: 12,
          background: 'rgba(51,102,255,0.08)', border: '1px solid rgba(51,102,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
        }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>Stay ahead of the curve</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Get product updates &amp; remote work insights — no spam.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 40px' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500 }}>
            © {YEAR} RemoteTeam Manager. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Terms & Conditions', 'Privacy Policy'].map(item => (
              <Link key={item} to="/about"
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .footer-card { grid-template-columns: 1fr !important; }
          .footer-card > div { border-right: none !important; border-bottom: 1px solid rgba(245,158,11,0.3); }
          .footer-card > div:last-child { border-bottom: none; }
        }
      `}</style>
    </footer>
  )
}

function NewsletterForm() {
  const [email, setEmail] = React.useState('')
  const [done, setDone] = React.useState(false)
  if (done) return (
    <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '10px 20px', borderRadius: 10 }}>
      ✓ You're subscribed!
    </div>
  )
  return (
    <form onSubmit={e => { e.preventDefault(); if (email) setDone(true); }}
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com" required
        style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#fff',
          outline: 'none', width: 220, fontFamily: 'var(--font-body)'
        }} />
      <button type="submit"
        style={{
          background: 'linear-gradient(135deg, var(--brand), #7c3aed)', color: '#fff',
          border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13,
          fontWeight: 800, cursor: 'pointer'
        }}>
        Subscribe →
      </button>
    </form>
  )
}
