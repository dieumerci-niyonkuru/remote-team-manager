import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Zap, Shield, Globe } from 'lucide-react';

const VALUES = [
  { icon: <Users size={22} />, title: 'Team First', desc: 'Remote teams deserve world-class tools. Everything we build starts with the question: does this make teamwork better?', color: 'var(--brand)' },
  { icon: <Zap size={22} />, title: 'Speed & Reliability', desc: 'Your team cannot afford downtime. We obsess over performance, uptime, and instant responsiveness.', color: 'var(--accent)' },
  { icon: <Shield size={22} />, title: 'Privacy & Security', desc: 'Your workspace data is yours. Enterprise-grade security standards, always.', color: 'var(--success)' },
  { icon: <Globe size={22} />, title: 'Built for Everyone', desc: 'Available in English, French, and Kinyarwanda — great tools should cross language barriers.', color: 'var(--warning)' },
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

function RevealSection({ children, delay = 0, style = {} }) {
  const { visible, ref } = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `all 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Hero */}
      <div style={{
        position: 'relative',
        background: 'var(--bg2)',
        padding: 'clamp(80px,12vh,140px) clamp(16px,4vw,24px) clamp(48px,6vw,80px)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(51,102,255,0.07), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: 'var(--text)',
            marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.03em',
          }}>
            Built by remote workers,
            <br />
            <span style={{ background: 'linear-gradient(90deg, var(--brand), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              for remote teams
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(15px,1.8vw,17px)', color: 'var(--text2)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
            We experienced the friction of managing distributed teams firsthand.
            So we built the tool we wished existed.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(36px,6vw,72px) clamp(16px,4vw,24px)' }}>

        {/* Story */}
        <RevealSection style={{ marginBottom: 'clamp(40px,6vw,64px)' }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>Our Story</h2>
          <div style={{ fontSize: 'clamp(14px,1.5vw,15px)', color: 'var(--text2)', lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0 }}>
              RemoteTeam Manager started from a simple frustration: managing a distributed team
              meant juggling a dozen different tools — one for tasks, another for chat, a separate
              one for docs, and yet another for video calls. Context was constantly lost between apps,
              and nothing felt connected.
            </p>
            <p style={{ margin: 0 }}>
              We set out to build a single workspace where projects, communication, and goals live
              together — so teams can focus on shipping great work instead of switching between tabs.
            </p>
            <p style={{ margin: 0 }}>
              Today, RemoteTeam Manager is an open-source platform that combines project management,
              real-time chat, video meetings, knowledge base, OKR tracking, and AI-powered insights
              into one cohesive experience. Available in English, French, and Kinyarwanda.
            </p>
          </div>
        </RevealSection>

        {/* Values */}
        <RevealSection delay={0.1} style={{ marginBottom: 'clamp(40px,6vw,64px)' }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 800, marginBottom: 'clamp(20px,3vw,32px)', letterSpacing: '-0.02em' }}>What We Stand For</h2>
          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <AboutValueCard key={i} value={v} index={i} />
            ))}
          </div>
        </RevealSection>

        {/* Team */}
        <RevealSection delay={0.15} style={{ marginBottom: 'clamp(40px,6vw,64px)' }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>The Team</h2>
          <p style={{ fontSize: 'clamp(14px,1.5vw,15px)', color: 'var(--text2)', marginBottom: 32 }}>
            A small, focused team building for the future of remote work.
          </p>

          <div style={{
            padding: 'clamp(20px,4vw,36px)',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
            display: 'flex', gap: 'clamp(16px,3vw,32px)', alignItems: 'center', flexWrap: 'wrap',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {/* Founder portrait. The gradient + initials sit underneath, so if
                the photo ever fails to load the avatar still renders cleanly. */}
            <div style={{
              width: 96, height: 96, borderRadius: '50%', position: 'relative',
              background: 'linear-gradient(135deg, var(--brand), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
              boxShadow: '0 8px 24px rgba(51,102,255,0.3)',
              border: '2px solid var(--brand)',
            }}>
              DN
              <img
                src="/founder.jpg"
                alt="Dieu Merci Niyonkuru"
                onError={e => { e.currentTarget.style.display = 'none'; }}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', borderRadius: '50%',
                }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <h3 style={{ fontSize: 'clamp(18px,2vw,20px)', fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>Dieu Merci Niyonkuru</h3>
              <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 700, marginBottom: 10 }}>Founder & Developer</p>
              <p style={{ fontSize: 'clamp(13px,1.4vw,14px)', color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>
                Full-stack engineer passionate about building tools that make remote teams more productive.
                Created RemoteTeam Manager to solve the real challenges of distributed work.
              </p>
            </div>
          </div>
        </RevealSection>

        {/* CTA */}
        <RevealSection delay={0.2} style={{
          textAlign: 'center', padding: 'clamp(32px,6vw,56px) 0',
          borderTop: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
            Want to join us?
          </h2>
          <p style={{ fontSize: 'clamp(14px,1.5vw,15px)', color: 'var(--text2)', marginBottom: 28 }}>
            We're always looking for talented people who care about remote work.
          </p>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, var(--brand), var(--accent))',
            color: '#fff', padding: 'clamp(12px,2vw,14px) clamp(24px,3vw,32px)', borderRadius: 12,
            textDecoration: 'none', fontWeight: 700, fontSize: 'clamp(14px,1.5vw,15px)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(51,102,255,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(51,102,255,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(51,102,255,0.3)'; }}
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </RevealSection>
      </div>

      <style>{`
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) {
          .about-values-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function AboutValueCard({ value, index }) {
  const [hovered, setHovered] = useState(false);
  const { visible, ref } = useReveal();
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 'clamp(20px,3vw,28px)', background: 'var(--bg-card)', border: `1px solid ${hovered ? value.color : 'var(--border)'}`,
        borderRadius: 14,
        transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? '0 20px 48px -12px rgba(0,0,0,0.4)' : 'var(--shadow-sm)',
        transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s`,
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${value.color}15`, border: `1px solid ${value.color}25`,
        color: value.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        transition: 'transform 0.3s', transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {value.icon}
      </div>
      <h3 style={{ fontSize: 'clamp(15px,1.5vw,16px)', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>{value.title}</h3>
      <p style={{ fontSize: 'clamp(13px,1.4vw,14px)', color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{value.desc}</p>
    </div>
  );
}
