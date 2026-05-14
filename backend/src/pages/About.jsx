import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '120px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 80 }} className="fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--brand-bg)', color: 'var(--brand)', padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 }}>
             <span>🚀</span> OUR MISSION
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, color: 'var(--text)', marginBottom: 24, letterSpacing: '-0.05em', lineHeight: 1.1 }}>
            Unifying <span className="text-gradient">Human Intelligence</span>
          </h1>
          <p style={{ fontSize: 20, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 700, margin: '0 auto' }}>
            NexusTeams is more than a tool—it's a high-fidelity mission control for the modern era, designed to empower teams in Rwanda and across the globe.
          </p>
        </div>

        {/* The System Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, marginBottom: 100 }}>
          <div className="card glass" style={{ padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 24 }}>🧠</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 16 }}>What is NexusTeams?</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 16 }}>
              It is a multi-tenant, secure collaboration hub where communication, task management, and resource allocation converge. Built with enterprise-grade encryption, it ensures that your team's intelligence remains protected and synchronized.
            </p>
          </div>
          <div className="card glass" style={{ padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 24 }}>⚡</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 16 }}>How it Works?</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 16 }}>
              Operators connect via secure nodes (Workspaces). Real-time WebSockets handle instant communication, while our AI engine analyzes project pulse to provide actionable insights. Navigation is streamlined via the Command Bridge (Cmd+K).
            </p>
          </div>
        </div>

        {/* Core Capabilities */}
        <div style={{ marginBottom: 100 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', marginBottom: 48, textAlign:'center' }}>Core Platform Capabilities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { t: 'Real-time Sync', d: 'Zero-latency frequency for instant team alignment.', i: '📡' },
              { t: 'AI Copilot', d: 'Intelligent task breakdown and resource optimization.', i: '🤖' },
              { t: 'Asset Vault', d: 'Encrypted storage for mission-critical documents.', i: '🔒' },
              { t: 'Global Map', d: 'Localized presence in Kigali Innovation City.', i: '🌍' },
            ].map(f => (
              <div key={f.t} style={{ padding:32, background:'var(--bg2)', borderRadius:24, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:32, marginBottom:16 }}>{f.i}</div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:8 }}>{f.t}</h3>
                <p style={{ fontSize:14, color:'var(--text3)', lineHeight:1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rwanda HQ */}
        <div className="card glass" style={{ padding: 64, textAlign: 'center', background:'linear-gradient(135deg, var(--bg-card), var(--brand-bg))' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', marginBottom: 24 }}>Proudly Engineered in Rwanda</h2>
          <p style={{ fontSize: 18, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 700, margin: '0 auto 40px' }}>
            We are committed to the digital transformation of East Africa. Our global headquarters in Kigali Innovation City serves as the heartbeat of our technical operations.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '18px 48px', borderRadius: 16, fontSize: 18, fontWeight: 800 }}>Join the Revolution ➜</Link>
        </div>

      </div>
    </div>
  )
}
