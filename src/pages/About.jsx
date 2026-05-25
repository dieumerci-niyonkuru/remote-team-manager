import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Globe, Shield, Award, Heart, ArrowRight, CheckCircle, Star, Code, Target, Lightbulb } from 'lucide-react';

const TEAM = [
  { name: 'Dieu Merci Niyonkuru', role: 'Founder & CEO', initials: 'DN', color: '#3366ff', bio: 'Full-stack engineer passionate about building tools that empower remote teams.' },
  { name: 'Product Team', role: 'Product & Design', initials: 'PT', color: '#10b981', bio: 'Dedicated to crafting intuitive experiences for distributed teams worldwide.' },
  { name: 'Engineering Team', role: 'Engineering', initials: 'ET', color: '#f59e0b', bio: 'Building reliable, scalable infrastructure for the future of work.' },
];

const VALUES = [
  { icon: <Users size={24} />, title: 'Team First', desc: 'We believe remote teams deserve world-class tools. Everything we build starts with the question: does this make teamwork better?' },
  { icon: <Zap size={24} />, title: 'Speed & Reliability', desc: 'Your team cannot afford downtime. We obsess over performance, uptime, and instant responsiveness across all features.' },
  { icon: <Shield size={24} />, title: 'Privacy & Security', desc: 'Your workspace data is yours. We follow enterprise-grade security standards and never sell your information.' },
  { icon: <Globe size={24} />, title: 'Built for Everyone', desc: 'Available in English, French, and Kinyarwanda — because great tools should cross language barriers.' },
  { icon: <Heart size={24} />, title: 'Human-Centered', desc: 'Remote work is personal. We design for real humans managing real work — not just enterprise checkboxes.' },
  { icon: <Lightbulb size={24} />, title: 'Continuous Innovation', desc: 'We ship new features weekly, driven by user feedback and emerging best practices in distributed work.' },
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text1)' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d1f40 50%, #1a2a50 100%)',
        padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(51,102,255,0.15), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(51,102,255,0.15)', border: '1px solid rgba(51,102,255,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: 13, color: '#6699ff' }}>
            <Star size={14} /> Built for the future of work
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 900, color: '#fff', marginBottom: 20, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            The Workspace OS for<br />
            <span style={{ background: 'linear-gradient(90deg, #3366ff, #6699ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Remote-First Teams
            </span>
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36, maxWidth: 600, margin: '0 auto 36px' }}>
            RemoteTeam Manager combines project management, team collaboration, AI insights, and real-time communication in one powerful workspace — built by remote workers, for remote teams.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: '#3366ff', color: '#fff', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16, border: '1px solid rgba(255,255,255,0.15)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>

        {/* Mission */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>Our Mission</h2>
          <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 700, margin: '0 auto', lineHeight: 1.8 }}>
            We started RemoteTeam Manager because we experienced firsthand the friction of managing distributed teams across multiple disconnected tools. Our mission is simple: <strong style={{ color: 'var(--brand)' }}>make remote work feel as seamless and human as working side-by-side.</strong>
          </p>
        </div>

        {/* Features grid */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>Everything Your Team Needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>What We Stand For</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ padding: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-subtle)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>The Team</h2>
          <p style={{ fontSize: 16, color: 'var(--text2)', textAlign: 'center', marginBottom: 40 }}>A small, focused team building big things for remote workers.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {TEAM.map((m, i) => (
              <div key={i} style={{ padding: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 auto 16px' }}>
                  {m.initials}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{m.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, marginBottom: 12 }}>{m.role}</p>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 48, textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40 }}>Growing Together</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { value: '500+', label: 'Teams' },
              { value: '50K+', label: 'Tasks Managed' },
              { value: '3', label: 'Languages' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--brand)', marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>Ready to transform your remote team?</h2>
          <p style={{ fontSize: 18, color: 'var(--text2)', marginBottom: 36 }}>Join thousands of teams who manage work smarter with RemoteTeam Manager.</p>
          <Link to="/register" style={{ background: 'var(--brand)', color: '#fff', padding: '16px 40px', borderRadius: 14, textDecoration: 'none', fontWeight: 800, fontSize: 18, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Start for Free <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
