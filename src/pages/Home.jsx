import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import Dashboard from './Dashboard';
import {
  Zap, Shield, Globe, MessageSquare, Video, BarChart2, Target,
  Check, Star, ArrowRight, ChevronRight, Play
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap size={24} />,
    title: 'Real-time Collaboration',
    desc: 'WebSocket-powered boards and live cursors keep every team member in sync, anywhere.',
  },
  {
    icon: <Target size={24} />,
    title: 'AI Task Intelligence',
    desc: 'AI prioritises, assigns, and surfaces the work that matters before it becomes a blocker.',
  },
  {
    icon: <MessageSquare size={24} />,
    title: 'Enterprise Chat',
    desc: 'Threaded channels, direct messages, reactions and rich media — all in one inbox.',
  },
  {
    icon: <Video size={24} />,
    title: 'Video Meetings',
    desc: 'One-click HD video calls with screen sharing, recording, and meeting notes.',
  },
  {
    icon: <Shield size={24} />,
    title: 'OKR Tracking',
    desc: 'Cascade objectives to every task and watch progress build in real time.',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'Advanced Analytics',
    desc: 'Velocity charts, burn-downs, and dashboards that turn data into clear decisions.',
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
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    desc: 'Everything growing teams need to ship fast.',
    features: ['Unlimited members', 'Unlimited Workspaces', 'AI Task Intelligence', 'Advanced Analytics', 'Video Meetings', '100 GB Storage', 'Priority Support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Tailored security, compliance, and scale.',
    features: ['SSO & SAML 2.0', 'Audit Logs', 'Custom Workflows', 'Unlimited Storage', 'SLA Guarantee', 'Dedicated CSM', 'On-premise Option'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    quote: 'RemoteTeam completely transformed our engineering velocity. We ship 40% faster and our on-call rotations are a breeze.',
    name: 'Sarah Jenkins',
    title: 'VP Engineering',
    company: 'Acme Corp',
    initials: 'SJ',
  },
  {
    quote: 'The real-time sync is flawless. We finally have one source of truth across 12 time zones.',
    name: 'David Chen',
    title: 'CTO',
    company: 'GlobalTech',
    initials: 'DC',
  },
  {
    quote: 'Best-in-class UI and incredible performance. My team refused to go back after the first week.',
    name: 'Elena Rodriguez',
    title: 'Product Lead',
    company: 'Quantum',
    initials: 'ER',
  },
];

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

function StatItem({ stat }) {
  const { count, ref } = useCountUp(stat.end);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '0 24px' }}>
      <p style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1, margin: 0 }}>
        {stat.prefix}{count}{stat.suffix}
      </p>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '28px 24px',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'var(--brand-bg)',
        border: '1px solid rgba(51,102,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand)', marginBottom: 16,
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>{feature.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', margin: 0 }}>{feature.desc}</p>
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '24px 20px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />)}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text2)', margin: 0, fontStyle: 'italic' }}>
        "{t.quote}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0,
        }}>{t.initials}</div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{t.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text3)' }}>{t.title}, {t.company}</p>
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
        background: plan.popular ? 'var(--bg2)' : 'var(--bg-card)',
        border: `1px solid ${plan.popular ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '32px 24px',
        transform: plan.popular ? 'scale(1.02)' : hovered ? 'translateY(-4px)' : 'none',
        boxShadow: plan.popular ? 'var(--shadow-brand)' : hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all 0.3s ease',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      {plan.popular && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--brand)',
          color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>Most Popular</div>
      )}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>{plan.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{plan.price}</span>
          {plan.period && <span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 600 }}>{plan.period}</span>}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>{plan.desc}</p>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={10} color="var(--brand)" />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate(plan.name === 'Enterprise' ? '/contact' : '/register')}
        style={{
          width: '100%', padding: '12px', borderRadius: 10,
          background: plan.popular ? 'var(--brand)' : 'var(--bg3)',
          border: `1px solid ${plan.popular ? 'var(--brand)' : 'var(--border)'}`,
          color: plan.popular ? '#fff' : 'var(--brand)',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

function DemoPreview() {
  return (
    <div style={{
      position: 'relative', maxWidth: 900, margin: '0 auto',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ background: 'var(--bg3)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--warning)', opacity: 0.8 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', opacity: 0.8 }} />
        <div style={{ flex: 1, height: 22, borderRadius: 6, background: 'var(--bg2)', marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>app.remoteteam.io/dashboard</span>
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: 280 }}>
        <div style={{ width: 140, background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Dashboard', 'Tasks', 'Projects', 'Chat', 'Team', 'Analytics'].map((item, i) => (
            <div key={item} style={{
              padding: '6px 8px', borderRadius: 6,
              background: i === 0 ? 'var(--brand-bg)' : 'transparent',
              color: i === 0 ? 'var(--brand)' : 'var(--text3)',
              fontSize: 11, fontWeight: 700, cursor: 'default',
            }}>{item}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Tasks', value: '42', color: 'var(--brand)' },
              { label: 'Done', value: '9', color: 'var(--success)' },
              { label: 'Projects', value: '7', color: 'var(--accent)' },
              { label: 'Online', value: '12', color: 'var(--warning)' },
            ].map(kpi => (
              <div key={kpi.label} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
                <p style={{ fontSize: 9, color: 'var(--text3)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{kpi.label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{kpi.value}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 10, flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</p>
            {[{ name: 'Web App', pct: 72 }, { name: 'API', pct: 45 }, { name: 'Design', pct: 89 }].map(p => (
              <div key={p.name} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--text2)' }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 700 }}>{p.pct}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--bg2)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: 'var(--brand)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      padding: '80px 24px',
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
          Start your free trial today
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text3)', margin: '0 0 32px' }}>
          Join 500+ teams. No credit card required. Cancel anytime.
        </p>
        {sent ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--success)', fontSize: 16, fontWeight: 700 }}>
            <Check size={22} /> Redirecting you to sign up...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your work email"
              style={{
                flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 10,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 14, outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '12px 24px', borderRadius: 10,
              background: 'var(--brand)',
              color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              Get Started Free <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { isAuth } = useStore();
  const navigate = useNavigate();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  if (isAuth) return <Dashboard />;

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,12vh,160px) 24px 80px', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)',
            borderRadius: 24, padding: '5px 14px', marginBottom: 28,
            animation: 'fadeSlideDown 0.8s ease both',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Now in General Availability</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px,7vw,80px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            margin: '0 0 20px',
            animation: 'fadeSlideUp 0.9s ease 0.1s both',
          }}>
            The All-in-One Platform<br />
            for{' '}
            <span style={{
              background: 'linear-gradient(90deg,var(--brand),var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Remote Teams</span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px,2vw,18px)',
            lineHeight: 1.65,
            color: 'var(--text2)',
            maxWidth: 560,
            margin: '0 auto 36px',
            animation: 'fadeSlideUp 0.9s ease 0.25s both',
          }}>
            Unify projects, tasks, chat, OKRs and analytics in one intelligent workspace.
            Built for teams that move fast and stay connected.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56, animation: 'fadeSlideUp 0.9s ease 0.4s both' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '14px 28px', borderRadius: 10,
                background: 'var(--brand)',
                color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                boxShadow: 'var(--shadow-brand)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              Get Started Free
            </button>
            <button
              onClick={() => setVideoModalOpen(true)}
              style={{
                padding: '14px 24px', borderRadius: 10,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={12} fill="var(--brand)" color="var(--brand)" style={{ marginLeft: 2 }} />
              </div>
              Watch Demo
            </button>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
            borderTop: '1px solid var(--border)',
            paddingTop: 36, gap: '20px 0',
            animation: 'fadeSlideUp 0.9s ease 0.55s both',
          }}>
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <StatItem stat={stat} />
                {i < STATS.length - 1 && (
                  <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section style={{ padding: '24px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
            Trusted by engineering teams at
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(16px,4vw,48px)', flexWrap: 'wrap', opacity: 0.3 }}>
            {['Acme Corp', 'GlobalTech', 'Quantum', 'Nexus AI', 'Stark Industries'].map(name => (
              <span key={name} style={{ fontSize: 'clamp(13px,2vw,18px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(64px,8vw,100px) 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Everything you need</p>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px', color: 'var(--text)' }}>
              One platform, every workflow.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text3)', maxWidth: 480, margin: '0 auto' }}>
              Replace a dozen scattered tools with a single source of truth.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {FEATURES.map(f => <FeatureCard key={f.title} feature={f} />)}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section style={{ padding: 'clamp(64px,8vw,100px) 24px', background: 'var(--bg2)', textAlign: 'center' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>See it in action</p>
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'var(--text)' }}>
            Your whole operation, one screen.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text3)', margin: '0 0 40px' }}>
            Real-time data, zero context-switching.
          </p>
          <DemoPreview />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: 'clamp(64px,8vw,100px) 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'var(--text)' }}>
              Teams love RemoteTeam
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text3)' }}>Don't just take our word for it.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {TESTIMONIALS.map(t => <TestimonialCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: 'clamp(64px,8vw,100px) 24px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Simple pricing</p>
            <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'var(--text)' }}>
              Choose your plan
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text3)' }}>
              Start free. Upgrade when you're ready.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, alignItems: 'stretch' }}>
            {PLANS.map(p => <PricingCard key={p.name} plan={p} />)}
          </div>
        </div>
      </section>

      <CTASection />

      {videoModalOpen && (
        <div
          onClick={() => setVideoModalOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Play size={24} fill="var(--brand)" color="var(--brand)" style={{ marginLeft: 3 }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>Demo Coming Soon</h3>
            <p style={{ fontSize: 14, color: 'var(--text3)', margin: '0 0 24px' }}>Sign up to get early access and a live walkthrough with our team.</p>
            <button
              onClick={() => { setVideoModalOpen(false); navigate('/register'); }}
              style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--brand)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Get Early Access
            </button>
          </div>
        </div>
      )}

      <style>{`
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
