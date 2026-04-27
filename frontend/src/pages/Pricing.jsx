import { Link } from 'react-router-dom'
import { useStore } from '../store'
export default function Pricing() {
  const { theme } = useStore()
  const plans = [
    { name: 'Free', price: '$0', features: ['3 workspaces', '10 members', 'Basic tasks'], cta: 'Get Started' },
    { name: 'Pro', price: '$12', features: ['Unlimited workspaces', 'Unlimited members', 'Time logging', 'Priority support'], cta: 'Start Trial', highlighted: true },
    { name: 'Enterprise', price: 'Custom', features: ['SSO', 'Audit logs', 'Dedicated support'], cta: 'Contact Sales' },
  ]
  return (
    <div className={theme} style={{ padding: '3rem 1.5rem', background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <h1 style={{ textAlign: 'center' }}>Simple Pricing</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          {plans.map(p => (
            <div key={p.name} className="card" style={{ padding: '1.5rem', textAlign: 'center', border: p.highlighted ? '2px solid var(--brand)' : 'none' }}>
              <h3>{p.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>{p.price}</div>
              <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                {p.features.map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              <Link to="/register" className="btn btn-primary btn-block">{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
