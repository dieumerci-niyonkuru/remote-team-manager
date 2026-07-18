import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Globe, Shield, Award, Heart, ArrowRight, CheckCircle, Star, Code, Target, Lightbulb } from 'lucide-react';

const TEAM = [
  {
    name: 'Dieu Merci Niyonkuru',
    role: 'CEO & Founder',
    initials: 'DN',
    bio: 'Full-stack engineer and visionary entrepreneur passionate about building tools that empower remote teams worldwide. Founded RemoteTeam Manager to solve the real challenges of distributed work.',
    featured: true,
  },
  {
    name: 'Product Team',
    role: 'Product & Design',
    initials: 'PT',
    bio: 'Dedicated to crafting intuitive experiences for distributed teams worldwide.',
  },
  {
    name: 'Engineering Team',
    role: 'Engineering',
    initials: 'ET',
    bio: 'Building reliable, scalable infrastructure for the future of work.',
  },
];

const VALUES = [
  { icon: <Users size={22} />, title: 'Team First', desc: 'Remote teams deserve world-class tools. Everything we build starts with the question: does this make teamwork better?' },
  { icon: <Zap size={22} />, title: 'Speed & Reliability', desc: 'Your team cannot afford downtime. We obsess over performance, uptime, and instant responsiveness.' },
  { icon: <Shield size={22} />, title: 'Privacy & Security', desc: 'Your workspace data is yours. Enterprise-grade security standards, always.' },
  { icon: <Globe size={22} />, title: 'Built for Everyone', desc: 'Available in English, French, and Kinyarwanda — great tools should cross language barriers.' },
  { icon: <Heart size={22} />, title: 'Human-Centered', desc: 'Remote work is personal. We design for real humans managing real work.' },
  { icon: <Lightbulb size={22} />, title: 'Continuous Innovation', desc: 'We ship new features weekly, driven by user feedback and emerging best practices.' },
];

const FEATURES = [
  'Real-time collaboration with live presence',
  'AI-powered task suggestions and insights',
  'Integrated chat, video calls, and messaging',
  'Project & task management with Kanban boards',
  'Wiki knowledge base for your team',
  'Time tracking and productivity analytics',
  'Multi-workspace organization support',
  'OKR tracking and goal management',
  'HR module for team management',
  'Automation rules and workflows',
];

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Hero */}
      <div style={{
        background: 'var(--bg2)',
        padding: 'clamp(60px,10vw,100px) 24px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 20, fontSize: 12, color: 'var(--brand)', fontWeight: 700 }}>
            <Star size={13} /> Built for the future of work
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            The Workspace OS for<br />
            <span style={{ background: 'linear-gradient(90deg, var(--brand), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Remote-First Teams
            </span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            RemoteTeam Manager combines project management, collaboration, AI insights, and real-time communication — built by remote workers, for remote teams.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: 'var(--brand)', color: '#fff', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" style={{ background: 'var(--bg3)', color: 'var(--text)', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15, border: '1px solid var(--border)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px,6vw,60px) 24px' }}>

        {/* Mission */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,36px)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Our Mission</h2>
          <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 640, margin: '0 auto', lineHeight: 1.8 }}>
            We started RemoteTeam Manager because we experienced firsthand the friction of managing distributed teams. Our mission is simple: <strong style={{ color: 'var(--brand)' }}>make remote work feel as seamless and human as working side-by-side.</strong>
          </p>
        </div>

        {/* Features grid */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,30px)', fontWeight: 800, textAlign: 'center', marginBottom: 32 }}>Everything Your Team Needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,30px)', fontWeight: 800, textAlign: 'center', marginBottom: 32 }}>What We Stand For</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ padding: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brand-bg)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team — Featured Founder */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,30px)', fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>The Team</h2>
          <p style={{ fontSize: 15, color: 'var(--text2)', textAlign: 'center', marginBottom: 32 }}>A small, focused team building big things for remote workers.</p>

          {/* Featured founder card */}
          <div style={{
            padding: 'clamp(24px,4vw,40px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            marginBottom: 20,
            display: 'flex',
            gap: 'clamp(20px,3vw,32px)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
              boxShadow: '0 8px 24px rgba(51,102,255,0.3)',
            }}>
              {TEAM[0].initials}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>{TEAM[0].name}</h3>
              <p style={{ fontSize: 14, color: 'var(--brand)', fontWeight: 700, marginBottom: 10 }}>{TEAM[0].role}</p>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{TEAM[0].bio}</p>
            </div>
          </div>

          {/* Rest of team */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {TEAM.slice(1).map((m, i) => (
              <div key={i} style={{ padding: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'var(--brand)', margin: '0 auto 14px' }}>
                  {m.initials}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>{m.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 700, marginBottom: 10 }}>{m.role}</p>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(28px,4vw,44px)', textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,30px)', fontWeight: 800, marginBottom: 32 }}>Growing Together</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 20 }}>
            {[
              { value: '500+', label: 'Teams' },
              { value: '50K+', label: 'Tasks Managed' },
              { value: '3', label: 'Languages' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand)', marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,36px)', fontWeight: 800, marginBottom: 12 }}>Ready to transform your remote team?</h2>
          <p style={{ fontSize: 16, color: 'var(--text2)', marginBottom: 28 }}>Join thousands of teams who manage work smarter with RemoteTeam Manager.</p>
          <Link to="/register" style={{ background: 'var(--brand)', color: '#fff', padding: '14px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
