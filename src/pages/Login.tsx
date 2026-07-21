import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import { getT } from '../i18n';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { setUser, lang = 'en' } = useStore();
  const t = getT(lang);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', fontFamily: 'var(--font-body)',
    }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 24px', borderBottom: '1px solid var(--border)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, overflow: 'hidden' }}>
            <img src="/logo.png" alt="RT" style={{ width: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Remote<span style={{ color: 'var(--brand)' }}>Team</span>
          </span>
        </Link>
        <Link to="/" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)', textDecoration: 'none' }}>
          Back to home
        </Link>
      </div>

      {/* Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              {t('auth.login.title', 'Welcome back')}
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>
              {t('auth.login.subtitle', 'Sign in to your workspace')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
                {t('common.email', 'Email')}
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
                  background: 'var(--bg3)', border: '1.5px solid var(--border)',
                  color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s', fontFamily: 'var(--font-body)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
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
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10, fontSize: 14,
                    background: 'var(--bg3)', border: '1.5px solid var(--border)',
                    color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s', fontFamily: 'var(--font-body)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: loading ? 'var(--bg3)' : 'var(--brand)',
                color: loading ? 'var(--text3)' : '#fff', border: 'none',
                cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-body)', marginTop: 4,
                transition: 'background 0.2s',
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

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 24 }}>
            {t('auth.login.no_account', "Don't have an account?")}{' '}
            <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>
              {t('auth.login.sign_up', 'Sign up free')}
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
