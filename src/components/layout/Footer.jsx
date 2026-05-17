import React from 'react'
import { Link } from 'react-router-dom'
import {
  Github,
  Twitter,
  Linkedin,
  Youtube,
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
  { icon: <Github size={18} />, href: 'https://github.com/dieumerci-niyonkuru/remote-team-manager', label: 'GitHub' },
  { icon: <Twitter size={18} />, href: '#', label: 'Twitter' },
  { icon: <Linkedin size={18} />, href: '#', label: 'LinkedIn' },
  { icon: <Youtube size={18} />, href: '#', label: 'YouTube' },
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
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-brand/10 to-accent-violet/10 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
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
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-2xl font-black text-sm">
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-black px-6 py-3.5 rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-brand/25 whitespace-nowrap text-sm"
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand to-accent-violet flex items-center justify-center shadow-lg shadow-brand/30 group-hover:shadow-brand/50 transition-shadow">
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
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <p className="text-xs text-gray-600 font-medium">
              &copy; {YEAR} RemoteTeam, Inc. All rights reserved. Built with ❤️ for distributed teams worldwide.
            </p>

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
