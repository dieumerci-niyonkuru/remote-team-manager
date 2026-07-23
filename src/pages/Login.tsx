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
      // Layout already offsets the fixed site header by 80px, so subtract it
      // here — otherwise the page overflows a full viewport and pushes the
      // site footer an extra 80px out of reach.
      minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', fontFamily: 'var(--font-body)',
    }}>

      {/* Form area with gradient bg */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px,6vw,40px) clamp(16px,4vw,24px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(51,102,255,0.06), transparent)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1, animation: 'loginFadeIn 0.6s cubic-bezier(0.4,0,0.2,1) both' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 'clamp(26px,5vw,32px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 8px', lineHeight: 1.15 }}>
              {t('auth.login.title', 'Welcome back')}
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: 'clamp(13px,1.4vw,14px)', margin: 0 }}>
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
                  background: 'transparent', border: '1.5px solid var(--border2)',
                  color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'var(--font-body)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(51,102,255,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
                  {t('auth.login.password', 'Password')}
                </label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.7'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
                >
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
                    background: 'transparent', border: '1.5px solid var(--border2)',
                    color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'var(--font-body)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(51,102,255,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex', transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, var(--brand), var(--accent))',
                color: loading ? 'var(--text3)' : '#fff', border: 'none',
                cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-body)', marginTop: 4,
                transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(51,102,255,0.3)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(51,102,255,0.45)'; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(51,102,255,0.3)'; } }}
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
            <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s', display: 'inline-block', padding: '10px 6px', minHeight: 44, lineHeight: '24px' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.7'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
            >
              {t('auth.login.sign_up', 'Sign up free')}
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
