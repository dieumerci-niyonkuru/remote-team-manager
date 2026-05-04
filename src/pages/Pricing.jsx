import { useState } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for individuals and small teams getting started.',
    color: '#64748b',
    badge: null,
    features: [
      '✅ Up to 3 workspaces',
      '✅ Up to 5 team members',
      '✅ Basic Kanban board',
      '✅ Real-time chat',
      '✅ 1GB file storage',
      '✅ Community support',
      '❌ AI features',
      '❌ Workflow automation',
      '❌ Advanced analytics',
    ],
    cta: 'Get Started Free',
    ctaClass: 'btn-secondary',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 12, yearly: 9 },
    description: 'For growing teams that need powerful AI-driven collaboration.',
    color: '#3366ff',
    badge: 'Most Popular',
    features: [
      '✅ Unlimited workspaces',
      '✅ Up to 25 team members',
      '✅ Full Kanban + Time Tracking',
      '✅ AI Task Breakdown',
      '✅ AI Productivity Assistant',
      '✅ Workflow Automation Engine',
      '✅ 20GB file storage',
      '✅ Priority email support',
      '✅ Calendar + HR module',
    ],
    cta: 'Start Pro Trial',
    ctaClass: 'btn-primary',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 39, yearly: 29 },
    description: 'For large organizations needing compliance, security, and scale.',
    color: '#8b5cf6',
    badge: 'Best Value',
    features: [
      '✅ Everything in Pro',
      '✅ Unlimited team members',
      '✅ GDPR compliance tools',
      '✅ Advanced audit logs',
      '✅ 2FA + SSO authentication',
      '✅ Custom integrations (API)',
      '✅ 1TB file storage',
      '✅ SLA (99.9% uptime guarantee)',
      '✅ Dedicated account manager',
    ],
    cta: 'Contact Sales',
    ctaClass: 'btn-primary',
  },
]

export default function Pricing() {
  const { theme } = useStore()
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly')

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '64px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-green" style={{ display: 'inline-flex', marginBottom: 16, padding: '6px 16px', fontSize: 13 }}>🌍 Simple, Transparent Pricing</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, marginBottom: 16 }}>
            The right plan for<br />
            <span style={{ background: 'linear-gradient(135deg, #3366ff, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>every team size</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 17, maxWidth: 520, margin: '0 auto 32px' }}>
            Start free, scale when you need. No hidden fees. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--bg2)', borderRadius: 50, padding: 4, gap: 4 }}>
            <button onClick={() => setBilling('monthly')} style={{ padding: '8px 24px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: billing === 'monthly' ? 'var(--brand)' : 'transparent', color: billing === 'monthly' ? '#fff' : 'var(--text2)', transition: 'var(--transition)' }}>Monthly</button>
            <button onClick={() => setBilling('yearly')} style={{ padding: '8px 24px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: billing === 'yearly' ? 'var(--brand)' : 'transparent', color: billing === 'yearly' ? '#fff' : 'var(--text2)', transition: 'var(--transition)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Yearly <span style={{ background: '#10b981', color: '#fff', borderRadius: 50, padding: '1px 8px', fontSize: 11 }}>-25%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
          {PLANS.map(plan => (
            <div key={plan.id} className="card" style={{ padding: 32, position: 'relative', border: plan.id === 'pro' ? `2px solid ${plan.color}` : '1px solid var(--border)', transform: plan.id === 'pro' ? 'scale(1.03)' : 'none', boxShadow: plan.id === 'pro' ? `0 0 40px ${plan.color}22` : 'none' }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', borderRadius: 50, padding: '4px 18px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>{plan.description}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: plan.color }}>
                    ${plan.price[billing]}
                  </span>
                  <span style={{ color: 'var(--text3)', fontSize: 14 }}>/ user / mo</span>
                </div>
                {billing === 'yearly' && plan.price.yearly > 0 && (
                  <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>
                    Save ${(plan.price.monthly - plan.price.yearly) * 12}/year per user
                  </div>
                )}
              </div>
              <button
                className={`btn ${plan.ctaClass}`}
                style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, marginBottom: 28 }}
                onClick={() => plan.id === 'free' ? navigate('/register') : alert('Stripe integration — connect your Stripe keys in settings.')}
              >
                {plan.cta}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ fontSize: 14, color: f.startsWith('❌') ? 'var(--text3)' : 'var(--text)', display: 'flex', gap: 8 }}>{f}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise contact */}
        <div className="card" style={{ marginTop: 48, padding: 40, textAlign: 'center', background: 'linear-gradient(135deg, rgba(51,102,255,0.08), rgba(139,92,246,0.08))' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Need a custom plan?</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>500+ users? On-premise deployment? Data residency requirements? We can help.</p>
          <button className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 15 }} onClick={() => alert('Contact: team@remoteteammanager.com')}>Talk to Sales</button>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
          {['🔒 SOC 2 Compliant', '🛡️ GDPR Ready', '⚡ 99.9% Uptime SLA', '🌍 Global CDN', '💳 No Credit Card for Free'].map(b => (
            <div key={b} style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>{b}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
