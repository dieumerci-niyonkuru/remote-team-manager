import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import Dashboard from './Dashboard';
import {
  Zap, Shield, Globe, MessageSquare, Video, BarChart2, Target,
  ArrowRight, Users, Layers, Sparkles,
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

function SectionHeader({ eyebrow, eyebrowColor, title, subtitle }) {
  const { visible, ref } = useReveal();
  return (
    <div ref={ref} style={{
      textAlign: 'center', marginBottom: 'clamp(32px,5vw,52px)', maxWidth: 580, margin: '0 auto',
      marginBottom: 'clamp(32px,5vw,52px)',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {eyebrow && (
        <p style={{ fontSize: 12, fontWeight: 700, color: eyebrowColor || 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 14px', color: 'var(--text)', lineHeight: 1.15 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 'clamp(14px,1.8vw,16px)', lineHeight: 1.7, color: 'var(--text3)', maxWidth: 480, margin: '0 auto' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const [hovered, setHovered] = useState(false);
  const { visible, ref } = useReveal();
  return (
    <div
      ref={ref} role="article"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="home-feature-card"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? (feature.color || 'var(--brand)') : 'var(--border)'}`,
        borderRadius: 16,
        padding: 'clamp(24px,3vw,32px) clamp(20px,2.5vw,28px)',
        transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(30px)',
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? '0 20px 50px -12px rgba(0,0,0,0.5)' : 'var(--shadow-sm)',
        transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s`,
        cursor: 'default',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${feature.color || 'var(--brand)'}15`,
        border: `1px solid ${feature.color || 'var(--brand)'}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: feature.color || 'var(--brand)', marginBottom: 16,
        transition: 'transform 0.3s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontSize: 'clamp(15px,1.6vw,17px)', fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>{feature.title}</h3>
      <p style={{ fontSize: 'clamp(13px,1.4vw,14px)', lineHeight: 1.75, color: 'var(--text2)', margin: 0 }}>{feature.desc}</p>
    </div>
  );
}

function StepCard({ step, index }) {
  const { visible, ref } = useReveal();
  return (
    <div ref={ref} className="home-step-card" style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
      padding: 'clamp(28px,3vw,36px) clamp(20px,2.5vw,28px)', position: 'relative', textAlign: 'center',
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

function CTASection() {
  const navigate = useNavigate();
  const { visible, ref } = useReveal();
  return (
    <section ref={ref} style={{
      padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)',
      background: 'linear-gradient(180deg, var(--bg2), var(--bg))',
      borderTop: '1px solid var(--border)',
      textAlign: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
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
            padding: 'clamp(13px,2vw,15px) clamp(24px,3vw,32px)', borderRadius: 12,
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
            padding: 'clamp(13px,2vw,15px) clamp(20px,3vw,28px)', borderRadius: 12,
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

export default function Home() {
  const { isAuth } = useStore();
  const navigate = useNavigate();
  if (isAuth) return <Dashboard />;

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* HERO */}
      <section aria-label="Hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(80px,12vh,160px) clamp(16px,4vw,24px) clamp(48px,6vw,80px)', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(51,102,255,0.08), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 840 }}>
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
            The All-in-One Platform<br className="hero-br" />
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
            <button onClick={() => navigate('/login')} style={{
              padding: 'clamp(13px,2vw,15px) clamp(20px,3vw,28px)', borderRadius: 12,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontWeight: 700, fontSize: 'clamp(14px,1.5vw,15px)', cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'var(--font-body)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)'; }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section aria-label="Features" style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader eyebrow="Everything you need" title="One platform, every workflow." subtitle="Replace a dozen scattered tools with a single source of truth." />
          <div className="home-features-grid">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section aria-label="How it works" style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader eyebrow="How it works" eyebrowColor="var(--accent)" title="Up and running in minutes" subtitle="Three simple steps from signup to your team's first shipped sprint." />
          <div className="home-steps-grid">
            {STEPS.map((step, i) => <StepCard key={step.num} step={step} index={i} />)}
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
        .home-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .home-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .hero-br { display: block; }
        @media (max-width: 768px) {
          .hero-br { display: none; }
          .home-features-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .home-steps-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .home-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .home-steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
