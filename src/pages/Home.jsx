import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import Dashboard from './Dashboard';
import {
  Zap, Shield, Globe, MessageSquare, Video, BarChart2, Target,
  Check, Star, ArrowRight, ChevronRight, Play, Share2, Code, Briefcase, Users
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Zap size={26} />,
    title: 'Real-time Collaboration',
    desc: 'WebSocket-powered boards and live cursors keep every team member perfectly in sync, anywhere on the globe.',
    color: '#3366ff',
    glow: 'rgba(51,102,255,0.25)',
  },
  {
    icon: <Target size={26} />,
    title: 'AI Task Intelligence',
    desc: 'Let AI prioritise, assign, and surface the work that matters most—before it becomes a blocker.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
  },
  {
    icon: <MessageSquare size={26} />,
    title: 'Enterprise Chat',
    desc: 'Threaded channels, direct messages, reactions and rich media—all searchable from one inbox.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.25)',
  },
  {
    icon: <Video size={26} />,
    title: 'Video Meetings',
    desc: 'One-click HD video calls with screen sharing, recording, and automatic meeting notes.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.25)',
  },
  {
    icon: <Shield size={26} />,
    title: 'OKR Tracking',
    desc: 'Cascade company objectives to every individual task and watch progress build in real time.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.25)',
  },
  {
    icon: <BarChart2 size={26} />,
    title: 'Advanced Analytics',
    desc: 'Velocity charts, burn-down graphs, and custom dashboards that turn raw data into clear decisions.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.25)',
  },
];

const STATS = [
  { label: 'Teams worldwide', end: 500, suffix: '+', prefix: '' },
  { label: 'Tasks completed', end: 50, suffix: 'K+', prefix: '' },
  { label: 'Languages', end: 3, suffix: '', prefix: '' },
  { label: 'Uptime SLA', end: 99.9, suffix: '%', prefix: '' },
];

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mo',
    desc: 'Perfect for small teams getting started.',
    features: ['Up to 5 members', '3 Workspaces', 'Basic Chat', 'Task Boards', '5 GB Storage'],
    cta: 'Get Started Free',
    popular: false,
    accent: '#3366ff',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    desc: 'Everything growing teams need to ship fast.',
    features: ['Unlimited members', 'Unlimited Workspaces', 'AI Task Intelligence', 'Advanced Analytics', 'Video Meetings', '100 GB Storage', 'Priority Support'],
    cta: 'Start Free Trial',
    popular: true,
    accent: '#8b5cf6',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Tailored security, compliance, and scale.',
    features: ['SSO & SAML 2.0', 'Audit Logs', 'Custom Workflows', 'Unlimited Storage', 'SLA Guarantee', 'Dedicated CSM', 'On-premise Option'],
    cta: 'Contact Sales',
    popular: false,
    accent: '#10b981',
  },
];

const TESTIMONIALS = [
  {
    quote: 'RemoteTeam completely transformed our engineering velocity. We ship 40 % faster and our on-call rotations are a breeze.',
    name: 'Sarah Jenkins',
    title: 'VP Engineering',
    company: 'Acme Corp',
    initials: 'SJ',
    bg: 'linear-gradient(135deg,#3366ff,#8b5cf6)',
  },
  {
    quote: 'The real-time sync is flawless. We finally have one source of truth across 12 time zones.',
    name: 'David Chen',
    title: 'CTO',
    company: 'GlobalTech',
    initials: 'DC',
    bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  },
  {
    quote: 'Best-in-class UI and incredible performance. My team refused to go back to our old stack after the first week.',
    name: 'Elena Rodriguez',
    title: 'Product Lead',
    company: 'Quantum',
    initials: 'ER',
    bg: 'linear-gradient(135deg,#10b981,#06b6d4)',
  },
];

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Status'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  },
  {
    heading: 'Resources',
    links: ['Docs', 'API Reference', 'Community', 'Tutorials', 'Webinars'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'],
  },
];

/* ─── Count-up hook ─────────────────────────────────────────── */
function useCountUp(end, duration = 1800, startOnVisible = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnVisible) { setStarted(true); return; }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!started) return;
    const isDecimal = !Number.isInteger(end);
    const step = duration / 60;
    let current = 0;
    const increment = end / (duration / step);
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(isDecimal ? end : Math.round(end)); clearInterval(timer); }
      else { setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current)); }
    }, step);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

/* ─── Sub-components ────────────────────────────────────────── */
function StatItem({ stat }) {
  const { count, ref } = useCountUp(stat.end);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '0 24px' }}>
      <p style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1, margin: 0 }}>
        {stat.prefix}{count}{stat.suffix}
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {stat.label}
      </p>
    </div>
  );
}

function FeatureCard({ feature }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(255,255,255,0.07)` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? feature.color + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20,
        padding: '32px 28px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? `0 24px 48px -12px ${feature.glow}` : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${feature.color}18`,
        border: `1px solid ${feature.color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: feature.color, marginBottom: 20,
        boxShadow: hovered ? `0 0 20px ${feature.glow}` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>{feature.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{feature.desc}</p>
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '28px 24px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />)}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.75)', margin: 0, fontStyle: 'italic' }}>
        "{t.quote}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: t.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 14, color: '#fff', flexShrink: 0,
        }}>{t.initials}</div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: '#fff' }}>{t.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.title}, {t.company}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ plan }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: plan.popular ? `linear-gradient(145deg,rgba(51,102,255,0.15),rgba(139,92,246,0.10))` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${plan.popular ? plan.accent + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 22,
        padding: '36px 28px',
        transform: plan.popular ? 'scale(1.04)' : hovered ? 'translateY(-4px)' : 'none',
        boxShadow: plan.popular ? `0 0 60px ${plan.accent}22, 0 24px 48px rgba(0,0,0,0.3)` : hovered ? '0 20px 40px rgba(0,0,0,0.25)' : '0 4px 24px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        display: 'flex', flexDirection: 'column', height: '100%',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {plan.popular && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: `linear-gradient(90deg,#3366ff,#8b5cf6)`,
          color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
          padding: '5px 16px', borderRadius: 30, textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>Most Popular</div>
      )}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{plan.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{plan.price}</span>
          {plan.period && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{plan.period}</span>}
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{plan.desc}</p>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${plan.accent}22`, border: `1px solid ${plan.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={10} color={plan.accent} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate(plan.name === 'Enterprise' ? '/contact' : '/register')}
        style={{
          width: '100%', padding: '13px', borderRadius: 12,
          background: plan.popular ? `linear-gradient(90deg,#3366ff,#8b5cf6)` : `${plan.accent}18`,
          border: `1px solid ${plan.accent}44`,
          color: plan.popular ? '#fff' : plan.accent,
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          transition: 'all 0.2s', letterSpacing: '0.01em',
          boxShadow: plan.popular ? '0 4px 20px rgba(51,102,255,0.35)' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

/* ─── Demo Preview ──────────────────────────────────────────── */
function DemoPreview() {
  const panels = [
    { label: 'Tasks', color: '#3366ff', w: '55%', items: ['Design system audit', 'API rate-limiting', 'Mobile nav refactor', 'Load test staging'] },
    { label: 'Team', color: '#8b5cf6', w: '40%', items: ['Sarah J. — Online', 'David C. — In meeting', 'Elena R. — Away', 'Tom K. — Online'] },
  ];

  return (
    <div style={{
      position: 'relative', maxWidth: 900, margin: '0 auto',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 24, overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 120px rgba(51,102,255,0.1)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Browser chrome */}
      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
        <div style={{ flex: 1, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>app.remoteteam.io/dashboard</span>
        </div>
      </div>

      {/* Fake sidebar + content */}
      <div style={{ display: 'flex', minHeight: 320 }}>
        {/* Sidebar */}
        <div style={{ width: 160, background: 'rgba(0,0,0,0.25)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Dashboard', 'Tasks', 'Projects', 'Chat', 'Team', 'Analytics'].map((item, i) => (
            <div key={item} style={{
              padding: '8px 10px', borderRadius: 8,
              background: i === 0 ? 'rgba(51,102,255,0.25)' : 'transparent',
              color: i === 0 ? '#3366ff' : 'rgba(255,255,255,0.35)',
              fontSize: 12, fontWeight: 700, cursor: 'default',
            }}>{item}</div>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: 20, display: 'flex', gap: 16 }}>
          {/* KPI row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
              {[
                { label: 'Tasks', value: '42', color: '#3366ff' },
                { label: 'Done Today', value: '9', color: '#10b981' },
                { label: 'Projects', value: '7', color: '#8b5cf6' },
                { label: 'Online', value: '12', color: '#f59e0b' },
              ].map(kpi => (
                <div key={kpi.label} style={{ flex: 1, background: `${kpi.color}12`, border: `1px solid ${kpi.color}30`, borderRadius: 12, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{kpi.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Two panels */}
            <div style={{ display: 'flex', gap: 12, flex: 1 }}>
              {panels.map(panel => (
                <div key={panel.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: panel.color, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{panel.label}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {panel.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: panel.color, flexShrink: 0, opacity: 0.7 }} />
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Project Progress</p>
              {[{ name: 'Web App v2', pct: 72, c: '#3366ff' }, { name: 'API Refactor', pct: 45, c: '#8b5cf6' }, { name: 'Design System', pct: 89, c: '#10b981' }].map(p => (
                <div key={p.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: p.c, fontWeight: 700 }}>{p.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${p.pct}%`, background: `linear-gradient(90deg,${p.c},${p.c}aa)`, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CTA Email Form ────────────────────────────────────────── */
function CTASection() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) { setSent(true); setTimeout(() => navigate('/register'), 1200); }
  };

  return (
    <section style={{
      padding: '100px 24px',
      background: 'linear-gradient(135deg,rgba(51,102,255,0.12),rgba(139,92,246,0.08))',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(51,102,255,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(51,102,255,0.15)', border: '1px solid rgba(51,102,255,0.3)', borderRadius: 30, padding: '5px 14px', marginBottom: 24 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#3366ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free forever on Starter</span>
        </div>

        <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px' }}>
          Start your free trial today
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 40px' }}>
          Join 500+ teams. No credit card required. Cancel anytime.
        </p>

        {sent ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#10b981', fontSize: 16, fontWeight: 700 }}>
            <Check size={22} /> Redirecting you to sign up…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your work email"
              style={{
                flex: 1, minWidth: 200, padding: '14px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '14px 28px', borderRadius: 12,
              background: 'linear-gradient(90deg,#3366ff,#8b5cf6)',
              color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(51,102,255,0.4)', whiteSpace: 'nowrap',
              transition: 'transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              Get Started Free <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer style={{ background: '#05080f', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 40, marginBottom: 52 }}>
          {/* Logo column */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#fff" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>RemoteTeam</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: '0 0 20px' }}>
              The operating system for modern remote teams.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[Share2, Code, Briefcase, Users].map((Icon, i) => (
                <button key={i} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(51,102,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                  <Icon size={15} color="rgba(255,255,255,0.5)" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(col => (
            <div key={col.heading}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>{col.heading}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}
                      onMouseEnter={e => { e.target.style.color = '#fff'; }}
                      onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.38)'; }}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            © {new Date().getFullYear()} RemoteTeam, Inc. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Made with care for distributed teams everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Home Component ────────────────────────────────────── */
export default function Home() {
  const { isAuth } = useStore();
  const navigate = useNavigate();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  if (isAuth) return <Dashboard />;

  return (
    <div style={{ background: '#060b18', color: '#fff', overflowX: 'hidden', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,12vh,160px) 24px 80px', overflow: 'hidden', textAlign: 'center' }}>
        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(51,102,255,0.18),transparent 70%)', filter: 'blur(40px)', animation: 'floatOrb1 12s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.14),transparent 70%)', filter: 'blur(40px)', animation: 'floatOrb2 14s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '30%', height: '30%', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.07),transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Pulse dots decorations */}
        {[
          { top: '20%', left: '8%', delay: '0s', color: '#3366ff' },
          { top: '70%', left: '5%', delay: '0.8s', color: '#8b5cf6' },
          { top: '30%', right: '6%', delay: '0.4s', color: '#10b981' },
          { top: '75%', right: '8%', delay: '1.2s', color: '#f59e0b' },
        ].map((dot, i) => (
          <div key={i} style={{ position: 'absolute', top: dot.top, left: dot.left, right: dot.right, width: 8, height: 8, borderRadius: '50%', background: dot.color, animation: `pulseDot 3s ease-in-out infinite`, animationDelay: dot.delay, boxShadow: `0 0 16px ${dot.color}`, pointerEvents: 'none' }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(51,102,255,0.1)', border: '1px solid rgba(51,102,255,0.25)',
            borderRadius: 30, padding: '6px 16px', marginBottom: 32,
            animation: 'fadeSlideDown 0.8s ease both',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block', animation: 'pulseDot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#3366ff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Now in General Availability</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(42px,7.5vw,96px)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1.0,
            margin: '0 0 24px',
            animation: 'fadeSlideUp 0.9s ease 0.1s both',
          }}>
            The Operating System<br />
            for{' '}
            <span style={{
              background: 'linear-gradient(90deg,#3366ff,#8b5cf6,#ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Remote Teams</span>
          </h1>

          {/* Sub-headline */}
          <p style={{
            fontSize: 'clamp(16px,2.2vw,20px)',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 640,
            margin: '0 auto 40px',
            animation: 'fadeSlideUp 0.9s ease 0.25s both',
          }}>
            Unify tasks, chat, video, OKRs and analytics in one intelligent workspace.
            Built for teams that move at the speed of thought.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64, animation: 'fadeSlideUp 0.9s ease 0.4s both' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '15px 32px', borderRadius: 14,
                background: 'linear-gradient(90deg,#3366ff,#8b5cf6)',
                color: '#fff', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 28px rgba(51,102,255,0.45)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(51,102,255,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 28px rgba(51,102,255,0.45)'; }}
            >
              Get Started Free
            </button>
            <button
              onClick={() => setVideoModalOpen(true)}
              style={{
                padding: '15px 28px', borderRadius: 14,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(51,102,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={13} fill="#3366ff" color="#3366ff" style={{ marginLeft: 2 }} />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: 40, gap: '24px 0',
            animation: 'fadeSlideUp 0.9s ease 0.55s both',
          }}>
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <StatItem stat={stat} />
                {i < STATS.length - 1 && (
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ───────────────────────────────────────── */}
      <section style={{ padding: '28px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 20 }}>
            Trusted by engineering teams at
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(20px,4vw,56px)', flexWrap: 'wrap', opacity: 0.4, filter: 'grayscale(1)' }}>
            {['Acme Corp', 'GlobalTech', 'Quantum', 'Nexus AI', 'Stark Industries'].map(name => (
              <span key={name} style={{ fontSize: 'clamp(14px,2vw,20px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,10vw,120px) 24px', background: '#080d1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#3366ff', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 14px' }}>Everything you need</p>
            <h2 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 16px', color: '#fff' }}>
              Built for the <span style={{ background: 'linear-gradient(90deg,#3366ff,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>elite.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 560, margin: '0 auto' }}>
              Six core pillars that replace a dozen tools and actually work together.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {FEATURES.map(f => <FeatureCard key={f.title} feature={f} />)}
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,10vw,120px) 24px', background: '#060b18', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 14px' }}>See it in action</p>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 12px', color: '#fff' }}>
            Your whole operation, one screen.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', margin: '0 0 52px' }}>
            Real-time data, zero context-switching.
          </p>
          <DemoPreview />
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,10vw,120px) 24px', background: '#080d1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 12px', color: '#fff' }}>
              Teams love RemoteTeam
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>Don't just take our word for it.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {TESTIMONIALS.map(t => <TestimonialCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,10vw,120px) 24px', background: '#060b18' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 14px' }}>Simple pricing</p>
            <h2 style={{ fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 12px', color: '#fff' }}>
              Choose your plan
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
              Start free. Upgrade when you're ready. No surprises.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, alignItems: 'stretch' }}>
            {PLANS.map(p => <PricingCard key={p.name} plan={p} />)}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────── */}
      <CTASection />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <SiteFooter />

      {/* ── VIDEO MODAL ──────────────────────────────────────── */}
      {videoModalOpen && (
        <div
          onClick={() => setVideoModalOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(51,102,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Play size={28} fill="#3366ff" color="#3366ff" style={{ marginLeft: 4 }} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>Demo Coming Soon</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 28px' }}>Sign up to get early access and a live walkthrough with our team.</p>
            <button
              onClick={() => { setVideoModalOpen(false); navigate('/register'); }}
              style={{ padding: '13px 28px', borderRadius: 12, background: 'linear-gradient(90deg,#3366ff,#8b5cf6)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(51,102,255,0.4)' }}>
              Get Early Access
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatOrb1 {
          0%,100%{transform:translate(0,0) scale(1);}
          33%{transform:translate(3%,4%) scale(1.05);}
          66%{transform:translate(-2%,2%) scale(0.97);}
        }
        @keyframes floatOrb2 {
          0%,100%{transform:translate(0,0) scale(1);}
          40%{transform:translate(-3%,-4%) scale(1.04);}
          70%{transform:translate(2%,2%) scale(0.96);}
        }
        @keyframes pulseDot {
          0%,100%{opacity:1;transform:scale(1);}
          50%{opacity:0.4;transform:scale(0.7);}
        }
        @keyframes fadeSlideDown {
          from{opacity:0;transform:translateY(-16px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes fadeSlideUp {
          from{opacity:0;transform:translateY(20px);}
          to{opacity:1;transform:translateY(0);}
        }
      `}</style>
    </div>
  );
}
