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
      toast.success('Welcome back!');
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
    { icon: <Zap size={16} />, text: 'Real-time task collaboration' },
    { icon: <Shield size={16} />, text: 'Secure & encrypted data' },
    { icon: <Globe size={16} />, text: 'Multi-language support' },
    { icon: <Users size={16} />, text: 'Built for remote teams' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', fontFamily: 'var(--font-body)', overflow: 'hidden'
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
            <img src="/logo.png" alt="RT" style={{ width: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Remote<span style={{ color: 'var(--brand)' }}>Team</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Globe size={13} style={{ color: 'var(--text3)', marginRight: 4 }} />
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang && setLang(l.code)}
              title={l.name}
              style={{
                background: lang === l.code ? 'var(--brand)' : 'transparent',
                border: `1px solid ${lang === l.code ? 'var(--brand)' : 'var(--border)'}`,
                color: lang === l.code ? '#fff' : 'var(--text3)',
                borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 3
              }}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        {/* Left branding panel */}
        <div className="login-left-panel" style={{
          flex: '0 0 50%', display: 'none', flexDirection: 'column',
          justifyContent: 'center', padding: '48px 56px',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 16, marginBottom: 32,
              background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.15)',
              fontSize: 11, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
              Trusted by remote teams
            </div>

            <h2 style={{ fontSize: 'clamp(26px,3vw,44px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Your team's<br />
              <span style={{ color: 'var(--brand)' }}>command center.</span>
            </h2>

            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 340 }}>
              Projects, tasks, chat, analytics, and AI — unified in one intelligent workspace for distributed teams.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{f.text}</span>
                  <Check size={13} style={{ color: 'var(--success)', marginLeft: 'auto', flexShrink: 0 }} />
                </div>
              ))}
            </div>

            <div style={{ padding: '18px 22px', borderRadius: 14, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text2)', marginBottom: 12, lineHeight: 1.65 }}>
                "Our team went from scattered tools to full visibility in a week. It's the first platform engineers actually enjoy using."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>DM</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Dieu Merci N.</p>
                  <p style={{ fontSize: 10, color: 'var(--text3)', margin: 0 }}>Founder & CEO, RemoteTeam</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '40px 24px', overflowY: 'auto',
          background: 'var(--bg)'
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px',
                borderRadius: 16, background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.15)',
                fontSize: 11, fontWeight: 700, color: 'var(--brand)', marginBottom: 16
              }}>
                <Shield size={11} /> Secure Sign In
              </div>
              <h1 style={{ fontSize: 'clamp(24px,3.5vw,30px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                {t('auth.login.title', 'Welcome back')}
              </h1>
              <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>
                {t('auth.login.subtitle', 'Enter your credentials to access your workspace')}
              </p>
            </div>

            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '28px 24px',
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    {t('common.email', 'Email')}
                  </label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    placeholder="name@company.com"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      background: 'var(--bg3)', border: `1.5px solid ${focused === 'email' ? 'var(--brand)' : 'var(--border)'}`,
                      color: 'var(--text)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {t('auth.login.password', 'Password')}
                    </label>
                    <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>
                      {t('auth.login.forgot', 'Forgot password?')}
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'} required value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      placeholder="Enter your password"
                      style={{
                        width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10, fontSize: 14,
                        background: 'var(--bg3)', border: `1.5px solid ${focused === 'password' ? 'var(--brand)' : 'var(--border)'}`,
                        color: 'var(--text)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    background: loading ? 'var(--bg3)' : 'var(--brand)',
                    color: loading ? 'var(--text3)' : '#fff', border: 'none',
                    cursor: loading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'var(--font-body)',
                    marginTop: 2
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      {t('auth.login.authorizing', 'Signing in...')}
                    </>
                  ) : (
                    <>{t('auth.login.submit', 'Sign In')} <ArrowRight size={15} /></>
                  )}
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 20 }}>
              {t('auth.login.no_account', "Don't have an account?")}{' '}
              <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>
                {t('auth.login.sign_up', 'Sign up free')}
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
