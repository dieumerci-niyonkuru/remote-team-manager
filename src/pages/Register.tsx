import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import { getT } from '../i18n';
import toast from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff, User as UserIcon } from 'lucide-react';

export default function Register() {
  const { setUser, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/onboarding';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = React.useState({
    email: '', first_name: '', last_name: '', password: '', password2: '', username: ''
  });
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);
  const [showPass2, setShowPass2] = React.useState(false);

  const updateForm = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const required = t('error.required', 'This field is required.');
    const invalidEmail = t('error.invalid_email', 'Please enter a valid email address.');
    const passMin = t('error.too_short', 'Minimum 8 characters required.');
    const passMismatch = t('error.password_mismatch', 'Passwords do not match.');
    const e: Record<string, string> = {};
    if (!form.first_name) e.first_name = required;
    if (!form.last_name) e.last_name = required;
    if (!form.email) e.email = required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = invalidEmail;
    if (!form.password) e.password = required;
    else if (form.password.length < 8) e.password = passMin;
    if (form.password !== form.password2) e.password2 = passMismatch;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const formData = new FormData();
    const finalForm = { ...form, username: form.username || form.email, role: 'member' };
    Object.entries(finalForm).forEach(([k, v]) => formData.append(k, v));
    if (avatar) formData.append('avatar', avatar);

    try {
      const { data } = await auth.register(formData);
      if (data?.access) {
        localStorage.setItem('rtm_access', data.access);
        localStorage.setItem('rtm_refresh', data.refresh);
        setUser(data.user);
        toast.success('Account created! Welcome aboard.');
        navigate(nextPath === '/onboarding' ? '/onboarding' : nextPath);
      } else {
        toast.success('Account created! Please sign in.');
        navigate(nextPath !== '/onboarding' ? `/login?next=${encodeURIComponent(nextPath)}` : '/login');
      }
    } catch (err: any) {
      if (!err.response) {
        toast.error('Cannot connect to the server. Please check your connection.');
        return;
      }
      const errData = err.response?.data;
      let msg = 'Registration failed. Please check your details.';
      if (errData && typeof errData === 'object') {
        if (errData.detail) msg = String(errData.detail);
        else if (errData.message) msg = String(errData.message);
        else {
          const fieldErrs: Record<string, string> = {};
          for (const [field, val] of Object.entries(errData)) {
            fieldErrs[field] = Array.isArray(val) ? String((val as unknown[])[0]) : String(val);
          }
          setErrors(prev => ({ ...prev, ...fieldErrs }));
          const firstField = Object.keys(fieldErrs)[0];
          if (firstField) {
            msg = ['non_field_errors', 'detail', 'error', '__all__'].includes(firstField)
              ? fieldErrs[firstField]
              : `${firstField.replace(/_/g, ' ')}: ${fieldErrs[firstField]}`;
          }
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%' as const, padding: '12px 14px', borderRadius: 10, fontSize: 14,
    background: 'var(--bg3)', border: `1.5px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
    color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px clamp(16px,4vw,24px)', borderBottom: '1px solid var(--border)',
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
        padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,24px)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(24px,4vw,28px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              {t('auth.register.title', 'Create your account')}
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: 'clamp(13px,1.4vw,14px)', margin: 0 }}>
              {t('auth.register.subtitle', 'Start managing your remote team in minutes.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <div onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 64, height: 64, borderRadius: 16,
                  border: `2px dashed ${avatarPreview ? 'var(--brand)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', background: 'var(--bg3)',
                  transition: 'border-color 0.2s',
                }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={20} style={{ color: 'var(--text3)' }} />
                )}
              </div>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
            </div>

            {/* Name row - stacks on small screens */}
            <div className="register-name-row">
              {([['first_name', t('auth.register.first_name', 'First name')], ['last_name', t('auth.register.last_name', 'Last name')]] as [string, string][]).map(([field, label]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{label}</label>
                  <input value={form[field as keyof typeof form]} onChange={e => updateForm(field, e.target.value)}
                    placeholder={label}
                    style={inputStyle(!!errors[field])}
                    onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                    onBlur={e => { e.target.style.borderColor = errors[field] ? 'var(--danger)' : 'var(--border)'; }}
                  />
                  {errors[field] && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errors[field]}</p>}
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{t('common.email', 'Email')}</label>
              <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                placeholder="name@company.com"
                style={inputStyle(!!errors.email)}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                onBlur={e => { e.target.style.borderColor = errors.email ? 'var(--danger)' : 'var(--border)'; }}
              />
              {errors.email && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errors.email}</p>}
            </div>

            {/* Passwords - stacks on small screens */}
            <div className="register-pw-row">
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{t('auth.login.password', 'Password')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => updateForm('password', e.target.value)}
                    placeholder="Min 8 characters"
                    style={{ ...inputStyle(!!errors.password), padding: '12px 40px 12px 14px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border)'; }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errors.password}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{t('auth.register.confirm_password', 'Confirm')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass2 ? 'text' : 'password'} value={form.password2}
                    onChange={e => updateForm('password2', e.target.value)}
                    placeholder="Repeat password"
                    style={{ ...inputStyle(!!errors.password2), padding: '12px 40px 12px 14px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.password2 ? 'var(--danger)' : 'var(--border)'; }}
                  />
                  <button type="button" onClick={() => setShowPass2(!showPass2)} tabIndex={-1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                    {showPass2 ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password2 && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errors.password2}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: loading ? 'var(--bg3)' : 'var(--brand)',
                color: loading ? 'var(--text3)' : '#fff', border: 'none',
                cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-body)', marginTop: 4, transition: 'background 0.2s',
              }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  {t('auth.register.creating', 'Creating account...')}
                </>
              ) : (
                <>{t('auth.register.submit', 'Create Account')} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 20 }}>
            {t('auth.register.have_account', 'Already have an account?')}{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>{t('auth.login.submit', 'Sign in')}</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .register-name-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .register-pw-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 480px) {
          .register-name-row,
          .register-pw-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
