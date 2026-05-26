import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import { getT } from '../i18n';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Zap, Shield, Globe, Users, Check } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'rw', label: 'RW', flag: '🇷🇼', name: 'Kinyarwanda' },
];

export default function Login() {
  const { setUser, lang = 'en', setLang } = useStore();
  const t = getT(lang);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);
  const [focused, setFocused] = React.useState<string | null>(null);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const response = await auth.login({ username: form.email, password: form.password });
      const result = response.data;
      localStorage.setItem('rtm_access', result.access);
      localStorage.setItem('rtm_refresh', result.refresh);
      setUser(result.user);
      toast.success('Welcome back! 👋');
      navigate(nextPath);
    } catch (err: any) {
      if (!err.response) {
        toast.error('Cannot connect to the server. Make sure the backend is running.');
        return;
      }
      const data = err.response?.data;
      let msg = 'Invalid email or password.';
      if (data?.message) msg = data.message;
      else if (data?.detail) msg = data.detail;
      else if (data?.non_field_errors?.[0]) msg = data.non_field_errors[0];
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Zap size={18} />, text: 'Real-time collaboration' },
    { icon: <Shield size={18} />, text: 'Bank-grade security' },
    { icon: <Globe size={18} />, text: '3 languages supported' },
    { icon: <Users size={18} />, text: 'Built for remote teams' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', fontFamily: 'var(--font-body)', overflow: 'hidden'
    }}>
      {/* Top language bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 24px', borderBottom: '1px solid var(--border)',
        background: 'rgba(6,11,24,0.8)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,var(--brand),#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
            <img src="/logo.png" alt="RT" style={{ width: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Remote<span style={{ color: 'var(--brand)' }}>Team</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={14} style={{ color: 'var(--text3)', marginRight: 2 }} />
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang && setLang(l.code)}
              title={l.name}
              style={{
                background: lang === l.code ? 'var(--brand)' : 'var(--bg3)',
                border: `1px solid ${lang === l.code ? 'var(--brand)' : 'var(--border)'}`,
                color: lang === l.code ? '#fff' : 'var(--text3)',
                borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 62px)' }}>
        {/* Left branding panel */}
        <div className="login-left-panel" style={{
          flex: '0 0 50%', display: 'none', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 70px',
          background: 'linear-gradient(135deg, #07101f 0%, #0e1c38 50%, #0a1528 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden'
        }}>
          {/* Background orbs */}
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(51,102,255,0.18) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20, marginBottom: 40,
              background: 'rgba(51,102,255,0.12)', border: '1px solid rgba(51,102,255,0.25)',
              fontSize: 11, fontWeight: 900, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.15em'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
              Trusted by 1,000+ teams
            </div>

            <h2 style={{ fontSize: 'clamp(30px,3.5vw,50px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 20 }}>
              Your team's <br />
              <span style={{ background: 'linear-gradient(135deg, var(--brand), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>command center.</span>
            </h2>

            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 44, maxWidth: 360 }}>
              Everything your distributed team needs — projects, chat, analytics, and AI — unified in one intelligent workspace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 52 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(51,102,255,0.12)', border: '1px solid rgba(51,102,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{f.text}</span>
                  <Check size={14} style={{ color: '#10b981', marginLeft: 'auto', flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div style={{ padding: '22px 26px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', marginBottom: 14, lineHeight: 1.65 }}>
                "We ship 40% faster since moving to RemoteTeam. It's the first tool our engineers actually love."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>S</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0 }}>Sarah Jenkins</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>VP Engineering, Acme Corp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 24px', overflowY: 'auto',
          background: 'var(--bg)'
        }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            {/* Heading */}
            <div style={{ marginBottom: 36, textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px',
                borderRadius: 20, background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.25)',
                fontSize: 12, fontWeight: 800, color: 'var(--brand)', marginBottom: 18
              }}>
                <Shield size={12} /> Secure Sign In
              </div>
              <h1 style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                {t.welcomeBack}
              </h1>
              <p style={{ color: 'var(--text3)', fontSize: 15, margin: 0 }}>
                {t.enterCreds || 'Enter your credentials to access your workspace'}
              </p>
            </div>

            {/* Form card */}
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '36px 32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    {t.email}
                  </label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    placeholder="name@company.com"
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14,
                      background: 'var(--bg3)', border: `2px solid ${focused === 'email' ? 'var(--brand)' : 'var(--border)'}`,
                      color: 'var(--text)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                      fontFamily: 'var(--font-body)',
                      boxShadow: focused === 'email' ? '0 0 0 3px rgba(51,102,255,0.12)' : 'none'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {t.password}
                    </label>
                    <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700 }}>
                      {t.forgotPass}
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'} required value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      placeholder="••••••••••"
                      style={{
                        width: '100%', padding: '13px 48px 13px 16px', borderRadius: 12, fontSize: 14,
                        background: 'var(--bg3)', border: `2px solid ${focused === 'password' ? 'var(--brand)' : 'var(--border)'}`,
                        color: 'var(--text)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                        fontFamily: 'var(--font-body)',
                        boxShadow: focused === 'password' ? '0 0 0 3px rgba(51,102,255,0.12)' : 'none'
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 800,
                    background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, var(--brand) 0%, #7c3aed 100%)',
                    color: loading ? 'var(--text3)' : '#fff', border: 'none',
                    cursor: loading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: loading ? 'none' : '0 6px 20px rgba(51,102,255,0.38)',
                    transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                    marginTop: 4
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      {t.authorizing || 'Signing in...'}
                    </>
                  ) : (
                    <>{t.establishConn || 'Sign In'} <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text3)', marginTop: 24 }}>
              {t.noAccount}{' '}
              <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 800, textDecoration: 'none' }}>
                {t.signupFree}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
