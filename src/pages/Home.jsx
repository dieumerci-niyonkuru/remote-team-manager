import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import Dashboard from './Dashboard';
import {
  Zap, Shield, Globe, MessageSquare, Video, BarChart2, Target,
  Check, Star, ArrowRight, ChevronRight, Play, Users, Layers, Sparkles,
  ChevronDown
} from 'lucide-react';

const FEATURES = [
  { icon: <Zap size={22} />, title: 'Real-time Collaboration', desc: 'WebSocket-powered boards and live cursors keep every team member in sync, anywhere.', color: 'var(--brand)' },
  { icon: <Target size={22} />, title: 'AI Task Intelligence', desc: 'AI prioritises, assigns, and surfaces the work that matters before it becomes a blocker.', color: 'var(--accent)' },
  { icon: <MessageSquare size={22} />, title: 'Enterprise Chat', desc: 'Threaded channels, direct messages, reactions and rich media — all in one inbox.', color: 'var(--success)' },
  { icon: <Video size={22} />, title: 'Video Meetings', desc: 'One-click HD video calls with screen sharing, recording, and meeting notes.', color: 'var(--warning)' },
  { icon: <Shield size={22} />, title: 'OKR Tracking', desc: 'Cascade objectives to every task and watch progress build in real time.', color: 'var(--info)' },
  { icon: <BarChart2 size={22} />, title: 'Advanced Analytics', desc: 'Velocity charts, burn-downs, and dashboards that turn data into clear decisions.', color: 'var(--danger)' },
];

const STEPS = [
  { num: '01', icon: <Users size={24} />, title: 'Invite your team', desc: 'Add members by email or share a link. Everyone gets their own workspace instantly.' },
  { num: '02', icon: <Layers size={24} />, title: 'Set up projects', desc: 'Create boards, assign tasks, and configure workflows in minutes — no training required.' },
  { num: '03', icon: <Sparkles size={24} />, title: 'Ship faster with AI', desc: 'Let AI prioritise work, surface blockers, and keep your team moving toward every deadline.' },
];

const STATS = [
  { label: 'Teams worldwide', end: 500, suffix: '+' },
  { label: 'Tasks completed', end: 50, suffix: 'K+' },
  { label: 'Languages', end: 3, suffix: '' },
  { label: 'Uptime SLA', end: 99.9, suffix: '%' },
];

const PLANS = [
  { name: 'Starter', price: '$0', period: '/mo', desc: 'Perfect for small teams getting started.', features: ['Up to 5 members', '3 Workspaces', 'Basic Chat', 'Task Boards', '5 GB Storage'], cta: 'Get Started Free', popular: false },
  { name: 'Pro', price: '$29', period: '/mo', desc: 'Everything growing teams need to ship fast.', features: ['Unlimited members', 'Unlimited Workspaces', 'AI Task Intelligence', 'Advanced Analytics', 'Video Meetings', '100 GB Storage', 'Priority Support'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'Tailored security, compliance, and scale.', features: ['SSO & SAML 2.0', 'Audit Logs', 'Custom Workflows', 'Unlimited Storage', 'SLA Guarantee', 'Dedicated CSM', 'On-premise Option'], cta: 'Contact Sales', popular: false },
];

const TESTIMONIALS = [
  { quote: 'RemoteTeam completely transformed our engineering velocity. We ship 40% faster and our on-call rotations are a breeze.', name: 'Sarah Jenkins', title: 'VP Engineering', company: 'Acme Corp', initials: 'SJ' },
  { quote: 'The real-time sync is flawless. We finally have one source of truth across 12 time zones.', name: 'David Chen', title: 'CTO', company: 'GlobalTech', initials: 'DC' },
  { quote: 'Best-in-class UI and incredible performance. My team refused to go back after the first week.', name: 'Elena Rodriguez', title: 'Product Lead', company: 'Quantum', initials: 'ER' },
];

/* Real screens captured from the running product. */
const SHOWCASE = [
  { img: '/shots/dashboard.jpg', title: 'Dashboard', desc: 'Every metric, deadline and team update in a single view.' },
  { img: '/shots/projects.jpg',  title: 'Projects',  desc: 'Track each project’s status, owners and progress at a glance.' },
  { img: '/shots/tasks.jpg',     title: 'Tasks',     desc: 'Assign work with priorities, stages and clear ownership.' },
  { img: '/shots/chat.jpg',      title: 'Team Chat', desc: 'Real-time channels that keep decisions where the work is.' },
  { img: '/shots/call.jpg',      title: 'Video Calls', desc: 'Start an HD stand-up straight from your workspace.' },
  { img: '/shots/ai.jpg',        title: 'AI Assistant', desc: 'Instant summaries and insights across your workspace.' },
];

const FAQ = [
  { q: 'Is RemoteTeam free to use?', a: 'Yes — the Starter plan is free for teams up to 5 members with no credit card required. Upgrade anytime for more features.' },
  { q: 'Can I migrate from other tools?', a: 'Absolutely. We offer one-click imports from Jira, Asana, Trello, Slack, and more. Our team can help with custom migrations.' },
  { q: 'Is my data secure?', a: 'We use AES-256 encryption at rest, TLS 1.3 in transit, and SOC 2 Type II compliance. Your workspace data is always yours.' },
  { q: 'Do you support mobile devices?', a: 'RemoteTeam is fully responsive and works beautifully on any device — phones, tablets, and desktops alike.' },
];

/* ─── Scroll-reveal hook ─── */
function useReveal(threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { visible, ref };
}



/* ─── Section header ─── */
function SectionHeader({ eyebrow, eyebrowColor, title, subtitle }) {
  const { visible, ref } = useReveal();
  return (
    <div ref={ref} style={{
      textAlign: 'center', marginBottom: 'clamp(32px,5vw,52px)', maxWidth: 580, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {eyebrow && (
        <p style={{ fontSize: 12, fontWeight: 700, color: eyebrowColor || 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontSize: 'clamp(22px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 14px', color: 'var(--text)', lineHeight: 1.15 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 'clamp(14px,1.6vw,16px)', lineHeight: 1.7, color: 'var(--text3)', maxWidth: 480, margin: '0 auto' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Count-up hook ─── */
function useCountUp(end, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
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
    <div ref={ref} style={{ textAlign: 'center', flex: '1 1 100px', minWidth: 80 }}>
      <p style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1, margin: 0 }}>
        {count}{stat.suffix}
      </p>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {stat.label}
      </p>
    </div>
  );
}

/* ─── Feature card with reveal ─── */
function FeatureCard({ feature, index }) {
  const [hovered, setHovered] = useState(false);
  const { visible, ref } = useReveal();
  const color = feature.color || 'var(--brand)';
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? color : 'var(--border)'}`,
        borderRadius: 16, padding: 'clamp(20px,3vw,28px)',
        transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(30px)',
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? '0 20px 50px -12px rgba(0,0,0,0.5)' : 'var(--shadow-sm)',
        transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s`,
        cursor: 'default',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, marginBottom: 16,
        transition: 'transform 0.3s', transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontSize: 'clamp(15px,1.6vw,17px)', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>{feature.title}</h3>
      <p style={{ fontSize: 'clamp(13px,1.4vw,14px)', lineHeight: 1.7, color: 'var(--text2)', margin: 0 }}>{feature.desc}</p>
    </div>
  );
}

/* ─── Step card ─── */
function StepCard({ step, index }) {
  const { visible, ref } = useReveal();
  return (
    <div ref={ref} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
      padding: 'clamp(24px,3vw,32px)', position: 'relative', textAlign: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 0.12}s`,
    }}>
      <div style={{
        fontSize: 'clamp(32px,4vw,44px)', fontWeight: 800, fontFamily: 'var(--font-display)',
        background: 'linear-gradient(180deg, var(--brand), transparent)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        position: 'absolute', top: 12, right: 16, lineHeight: 1,
      }}>{step.num}</div>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand)', margin: '0 auto 20px',
      }}>{step.icon}</div>
      <h3 style={{ fontSize: 'clamp(15px,1.6vw,17px)', fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>{step.title}</h3>
      <p style={{ fontSize: 'clamp(13px,1.4vw,14px)', lineHeight: 1.7, color: 'var(--text2)', margin: 0 }}>{step.desc}</p>
    </div>
  );
}

/* ─── Testimonial card ─── */
function TestimonialCard({ t }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
      padding: 'clamp(20px,3vw,24px)', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />)}
      </div>
      <p style={{ fontSize: 'clamp(13px,1.4vw,14px)', lineHeight: 1.75, color: 'var(--text2)', margin: 0, fontStyle: 'italic' }}>
        "{t.quote}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: 'var(--brand)',
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

/* ─── Pricing card ─── */
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
        border: `1px solid ${plan.popular ? 'var(--brand)' : hovered ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 16, padding: 'clamp(24px,3vw,32px)',
        transform: plan.popular ? 'scale(1.02)' : hovered ? 'translateY(-6px)' : 'none',
        boxShadow: plan.popular ? 'var(--shadow-brand)' : hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      {plan.popular && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 800,
          letterSpacing: '0.1em', padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>Most Popular</div>
      )}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>{plan.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ fontSize: 'clamp(32px,4vw,40px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{plan.price}</span>
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
          background: plan.popular ? 'linear-gradient(135deg, var(--brand), var(--accent))' : 'var(--bg3)',
          border: `1px solid ${plan.popular ? 'var(--brand)' : 'var(--border)'}`,
          color: plan.popular ? '#fff' : 'var(--brand)',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.2s', fontFamily: 'var(--font-body)',
          boxShadow: plan.popular ? '0 8px 30px rgba(51,102,255,0.35)' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

/* ─── FAQ item ─── */
function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const { visible, ref } = useReveal();
  return (
    <div ref={ref} style={{
      background: 'var(--bg-card)', border: `1px solid ${open ? 'var(--brand)' : 'var(--border)'}`,
      borderRadius: 14, overflow: 'hidden',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(14px,2vw,18px) clamp(16px,2vw,20px)', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', gap: 12,
      }}>
        <span style={{ fontSize: 'clamp(14px,1.5vw,15px)', fontWeight: 700, color: 'var(--text)' }}>{item.q}</span>
        <ChevronDown size={16} style={{ color: 'var(--text3)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ padding: '0 clamp(16px,2vw,20px) clamp(14px,2vw,18px)', fontSize: 'clamp(13px,1.4vw,14px)', lineHeight: 1.7, color: 'var(--text2)' }}>
          {item.a}
        </div>
      )}
    </div>
  );
}

/* ─── CTA section ─── */
function CTASection() {
  const navigate = useNavigate();
  const { visible, ref } = useReveal();
  return (
    <section ref={ref} style={{
      padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)',
      background: 'linear-gradient(180deg, var(--bg2), var(--bg))',
      borderTop: '1px solid var(--border)', textAlign: 'center',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', fontFamily: 'var(--font-display)' }}>
          Start building with your team today
        </h2>
        <p style={{ fontSize: 'clamp(14px,1.6vw,16px)', color: 'var(--text3)', margin: '0 0 36px', lineHeight: 1.6 }}>
          Free for teams up to 5. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{
            padding: 'clamp(12px,2vw,15px) clamp(24px,3vw,32px)', borderRadius: 12,
            background: 'linear-gradient(135deg, var(--brand), var(--accent))',
            color: '#fff', fontWeight: 700, fontSize: 'clamp(14px,1.5vw,15px)', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(51,102,255,0.35)', transition: 'transform 0.2s, box-shadow 0.2s', fontFamily: 'var(--font-body)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(51,102,255,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 30px rgba(51,102,255,0.35)'; }}
          >
            Get Started Free <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
          </button>
          <button onClick={() => navigate('/login')} style={{
            padding: 'clamp(12px,2vw,15px) clamp(20px,3vw,28px)', borderRadius: 12,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            color: 'var(--text)', fontWeight: 700, fontSize: 'clamp(14px,1.5vw,15px)', cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: 'var(--font-body)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Product screenshot card ─── */
function ShowcaseCard({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const { visible, ref } = useReveal(0.1);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 16, overflow: 'hidden',
        transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transition: `opacity .6s ease ${index * 0.07}s, transform .35s cubic-bezier(.4,0,.2,1)`,
        boxShadow: hovered ? '0 20px 48px -12px rgba(51,102,255,0.35)' : '0 2px 12px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <img
          src={item.img}
          alt={`${item.title} screen in RemoteTeam Manager`}
          loading="lazy"
          style={{
            display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', objectPosition: 'top left',
            transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>
      <div style={{ padding: 'clamp(14px,2vw,18px)' }}>
        <h3 style={{ fontSize: 'clamp(15px,1.7vw,17px)', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          {item.title}
        </h3>
        <p style={{ fontSize: 'clamp(12.5px,1.4vw,13.5px)', color: 'var(--text3)', lineHeight: 1.6, margin: 0 }}>
          {item.desc}
        </p>
      </div>
    </div>
  );
}

/* ─── Hero background video ───
   Decorative looping footage behind the hero. Muted + playsInline so mobile
   browsers allow autoplay, and it degrades to a static poster whenever motion
   is unwanted (reduced-motion, Data Saver) or the file fails to load. */
function HeroVideoBackground() {
  const [play, setPlay] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    if (!reduced && !saveData) setPlay(true);
  }, []);

  const layer = {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%', objectFit: 'cover',
  };

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {play && !failed ? (
        <video
          autoPlay loop muted playsInline preload="metadata"
          poster="/hero-bg-poster.jpg"
          onError={() => setFailed(true)}
          style={{ ...layer, opacity: 0.85, filter: 'saturate(1.2)' }}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      ) : (
        <img src="/hero-bg-poster.jpg" alt="" style={{ ...layer, opacity: 0.7, filter: 'saturate(1.2)' }} />
      )}
      {/* Brand wash ties the stock footage into the product palette */}
      <div style={{
        position: 'absolute', inset: 0, mixBlendMode: 'multiply',
        background: 'linear-gradient(135deg, rgba(51,102,255,0.55), rgba(139,92,246,0.42))',
      }} />
      {/* Scrim — bright particle footage needs solid cover for the copy */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(var(--bg-rgb),0.60) 0%, rgba(var(--bg-rgb),0.52) 38%, rgba(var(--bg-rgb),0.86) 82%, var(--bg) 100%)',
      }} />
      {/* Vignette concentrated behind the headline block */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 58% 44% at 50% 46%, rgba(var(--bg-rgb),0.62), transparent 74%)',
      }} />
    </div>
  );
}

/* ─── Main ─── */
export default function Home() {
  const { isAuth } = useStore();
  const navigate = useNavigate();
  if (isAuth) return <Dashboard />;

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* HERO */}
      <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(80px,12vh,140px) clamp(16px,4vw,24px) clamp(40px,6vw,60px)', textAlign: 'center', overflow: 'hidden' }}>
        <HeroVideoBackground />
        <div style={{ maxWidth: 840, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)',
            borderRadius: 24, padding: '5px 14px', marginBottom: 'clamp(20px,3vw,32px)',
            animation: 'heroBadgeIn 0.8s cubic-bezier(0.4,0,0.2,1) both',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Now in General Availability</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px,7vw,76px)', fontWeight: 800, letterSpacing: '-0.04em',
            lineHeight: 1.05, margin: '0 0 24px', fontFamily: 'var(--font-display)',
            animation: 'heroTextIn 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s both',
          }}>
            The All-in-One Platform{' '}
            <br className="hero-br" />
            for{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--brand), var(--accent), #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Remote Teams</span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px,2vw,18px)', lineHeight: 1.7, color: 'var(--text2)',
            maxWidth: 580, margin: '0 auto clamp(28px,4vw,40px)',
            animation: 'heroTextIn 0.9s cubic-bezier(0.4,0,0.2,1) 0.25s both',
          }}>
            Unify projects, tasks, chat, OKRs and analytics in one intelligent workspace.
            Built for teams that move fast and stay connected across any distance.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'heroTextIn 0.9s cubic-bezier(0.4,0,0.2,1) 0.4s both' }}>
            <button onClick={() => navigate('/register')} style={{
              padding: 'clamp(13px,2vw,15px) clamp(24px,3vw,32px)', borderRadius: 12,
              background: 'linear-gradient(135deg, var(--brand), var(--accent))',
              color: '#fff', fontWeight: 700, fontSize: 'clamp(14px,1.5vw,15px)', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(51,102,255,0.35)', transition: 'transform 0.2s, box-shadow 0.2s', fontFamily: 'var(--font-body)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(51,102,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 30px rgba(51,102,255,0.35)'; }}
            >
              Get Started Free
            </button>
            <button onClick={() => { const el = document.getElementById('demo-video'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} style={{
              padding: 'clamp(13px,2vw,15px) clamp(20px,3vw,28px)', borderRadius: 12,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontWeight: 700, fontSize: 'clamp(14px,1.5vw,15px)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', fontFamily: 'var(--font-body)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)'; }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Play size={12} fill="var(--brand)" color="var(--brand)" style={{ marginLeft: 2 }} />
              </div>
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* VIDEO SHOWCASE */}
      <section id="demo-video" style={{ padding: '0 clamp(16px,4vw,24px) clamp(48px,8vw,80px)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{
            position: 'relative', borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px var(--border)',
            background: '#000',
          }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/vkhkcfAuR8g?autoplay=1&mute=1&loop=1&playlist=vkhkcfAuR8g&rel=0&modestbranding=1"
                title="See how RemoteTeam works"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 16, fontWeight: 600 }}>
            See how RemoteTeam unifies projects, chat, tasks, and analytics in one workspace.
          </p>
        </div>
      </section>

      {/* INSIDE THE PRODUCT — real screens */}
      <section style={{ padding: 'clamp(48px,8vw,96px) clamp(16px,4vw,24px)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <SectionHeader
          eyebrow="Inside RemoteTeam"
          title="See the actual product"
          subtitle="Real screens from the live app — not mockups. This is exactly what your team works in every day."
        />
        <div className="showcase-grid" style={{ maxWidth: 1140, margin: '0 auto' }}>
          {SHOWCASE.map((item, i) => (
            <ShowcaseCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* TRUSTED BY */}
      <section style={{ padding: 'clamp(20px,3vw,24px) clamp(16px,4vw,24px)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
            Trusted by engineering teams at
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(12px,4vw,48px)', flexWrap: 'wrap', opacity: 0.3 }}>
            {['Acme Corp', 'GlobalTech', 'Quantum', 'Nexus AI', 'Stark Industries'].map(name => (
              <span key={name} style={{ fontSize: 'clamp(12px,2vw,18px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader eyebrow="Everything you need" title="One platform, every workflow." subtitle="Replace a dozen scattered tools with a single source of truth." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 'clamp(12px,2vw,16px)' }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader eyebrow="How it works" eyebrowColor="var(--accent)" title="Up and running in minutes" subtitle="Three simple steps from signup to your team's first shipped sprint." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 'clamp(12px,2vw,20px)' }}>
            {STEPS.map((step, i) => <StepCard key={step.num} step={step} index={i} />)}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: 'clamp(32px,5vw,48px) clamp(16px,4vw,24px)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="hero-stats" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'clamp(16px,3vw,0)' }}>
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <StatItem stat={stat} />
              {i < STATS.length - 1 && (
                <div className="stat-divider" style={{ width: 1, background: 'var(--border)', margin: '0 4px', alignSelf: 'stretch' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader eyebrow="Testimonials" title="Teams love RemoteTeam" subtitle="Don't just take our word for it." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 'clamp(12px,2vw,16px)' }}>
            {TESTIMONIALS.map(t => <TestimonialCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader eyebrow="Simple pricing" title="Choose your plan" subtitle="Start free. Upgrade when you're ready." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 'clamp(12px,2vw,16px)', alignItems: 'stretch' }}>
            {PLANS.map(p => <PricingCard key={p.name} plan={p} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" subtitle="Everything you need to know about RemoteTeam." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map((item, i) => <FAQItem key={i} item={item} index={i} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />

      <style>{`
        @keyframes heroBadgeIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes heroTextIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Product screenshot grid: 3 up on desktop, 2 on tablet, 1 on phones */
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px, 2vw, 22px);
        }
        @media (max-width: 1024px) {
          .showcase-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .showcase-grid { grid-template-columns: 1fr; }
        }
        .hero-br { display: block; }
        @media (max-width: 768px) {
          .hero-br { display: none; }
          .stat-divider { display: none; }
          .hero-stats {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px 12px;
          }
        }
      `}</style>
    </div>
  );
}
