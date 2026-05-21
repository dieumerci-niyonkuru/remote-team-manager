import React from 'react'
import * as tokens from '../../styles/tokens'
import { Link } from 'react-router-dom'
import {
  Globe,
  Mail,
  ArrowRight,
  Zap,
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  BookOpen,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

// Inline SVGs for brand icons (removed from lucide-react v1.x)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
)


const YEAR = new Date().getFullYear()

const NAV = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', to: '/dashboard', icon: <BarChart3 size={13} /> },
      { label: 'Tasks & Projects', to: '/projects', icon: <Zap size={13} /> },
      { label: 'Team Collaboration', to: '/team', icon: <Users size={13} /> },
      { label: 'Direct Messages', to: '/chat', icon: <MessageSquare size={13} /> },
      { label: 'File Management', to: '/files', icon: <FileText size={13} /> },
      { label: 'AI Assistant', to: '/ai', icon: <Zap size={13} /> },
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about', icon: <Globe size={13} /> },
      { label: 'Pricing', to: '/pricing', icon: <BarChart3 size={13} /> },
      { label: 'Security', to: '/about', icon: <Shield size={13} /> },
      { label: 'Blog', to: '/about', icon: <BookOpen size={13} />, external: false },
      { label: 'Careers', to: '/about', icon: <Users size={13} /> },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/about', icon: <BookOpen size={13} /> },
      { label: 'API Reference', to: '/about', icon: <FileText size={13} /> },
      { label: 'Help Center', to: '/about', icon: <HelpCircle size={13} /> },
      { label: 'Community', to: '/about', icon: <Users size={13} /> },
      { label: 'Status Page', to: '/about', icon: <ExternalLink size={13} /> },
    ]
  },
]

const SOCIALS = [
  { icon: <GithubIcon />, href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager', label: 'GitHub' },
  { icon: <TwitterIcon />, href: '#', label: 'Twitter / X' },
  { icon: <LinkedinIcon />, href: '#', label: 'LinkedIn' },
  { icon: <YoutubeIcon />, href: '#', label: 'YouTube' },
]

const BADGES = [
  { label: 'SOC 2 Type II', icon: <Shield size={12} /> },
  { label: 'GDPR Ready', icon: <Shield size={12} /> },
  { label: '99.9% Uptime', icon: <Zap size={12} /> },
]

export default function Footer() {
  const [email, setEmail] = React.useState('')
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="relative bg-[#060b18] text-white overflow-hidden">

      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3366ff]/60 to-transparent" />

      {/* Background glows */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-accent-violet/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Newsletter Banner */}
      <div className="relative border-b border-white/5">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-brand/10 to-accent-violet/10 border border-white/8 rounded-xl p-8 backdrop-blur-sm">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                Stay ahead of the curve
              </h3>
              <p className="text-gray-400 font-medium">
                Get product updates, tips, and remote work insights — no spam, ever.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex items-center gap-3 w-full lg:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-xl font-black text-sm">
                  <Zap size={16} />
                  You're subscribed!
                </div>
              ) : (
                <>
                  <div className="flex-1 lg:w-72 relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-black px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-brand/25 whitespace-nowrap text-sm"
                  >
                    Subscribe
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-accent-violet flex items-center justify-center group-hover:shadow-brand/50 transition-shadow" style={{ boxShadow: tokens.shadow.lg }}>
                <img src="/logo.png" alt="RemoteTeam" className="w-6 h-6 object-contain" onError={e => e.target.style.display='none'} />
                <Zap size={20} className="text-white absolute" style={{display:'none'}} />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">RemoteTeam</span>
                <div className="text-[10px] font-black text-brand uppercase tracking-widest leading-none">Enterprise OS</div>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed font-medium max-w-sm">
              The all-in-one workspace platform for distributed teams. Manage projects, communicate in real time, and ship faster — from anywhere in the world.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              {BADGES.map(b => (
                <div key={b.label} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <span className="text-emerald-400">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:bg-brand/20 hover:border-brand/40 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {NAV.map(section => (
            <div key={section.title}>
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200 group font-medium"
                    >
                      <span className="text-gray-600 group-hover:text-brand transition-colors duration-200">
                        {link.icon}
                      </span>
                      {link.label}
                      {link.external && <ExternalLink size={11} className="opacity-50 ml-auto" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
{/* Office Location */}
<div className="mt-12">
  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-5">Our Office</h4>
  <p className="text-gray-400 text-sm mb-4">Kigali, Rwanda</p>
  <div className="w-full h-64">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.123456789!2d30.061887!3d-1.944896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19d6981900000001%3A0x123456789abcdef!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus"
      width="100%"
      height="100%"
      style={{border:0}}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                <p className="text-xs text-gray-600 font-medium">Remote Team Manager</p>

            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Acceptable Use'].map(item => (
                <Link
                  key={item}
                  to="/about"
                  className="text-[11px] font-semibold text-gray-600 hover:text-gray-300 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
    </footer>
  )
}
