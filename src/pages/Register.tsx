import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import { getT } from '../i18n';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, User as UserIcon, Globe, Check, Eye, EyeOff } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'rw', label: 'RW', flag: '🇷🇼', name: 'Kinyarwanda' },
];

export default function Register() {
  const { setUser, lang = 'en', setLang } = useStore();
  const t = getT(lang || 'en');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/onboarding';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Role values must match User.ROLE_CHOICES in apps/accounts/models.py
  const ROLES = [
    { value: 'developer',       label: t('team.role.developer', 'Developer'),       desc: t('team.role.developer_desc', 'Create & update tasks'), color: '#3366ff' },
    { value: 'project_manager', label: t('team.role.manager',   'Manager'),         desc: t('team.role.manager_desc',   'Manage projects & team'), color: '#10b981' },
    { value: 'designer',        label: t('team.role.designer',  'Designer'),        desc: t('team.role.designer_desc',  'Design UI/UX assets'),    color: '#f59e0b' },
    { value: 'member',          label: t('team.role.viewer',    'Member'),          desc: t('team.role.viewer_desc',    'Read-only access'),       color: '#6366f1' },
  ];

  const [form, setForm] = React.useState({
    email: '', first_name: '', last_name: '', password: '', password2: '', role: 'developer', username: ''
  });
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [focused, setFocused] = React.useState<string | null>(null);
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
    const required   = t('error.required',          'This field is required.');
    const invalidEmail = t('error.invalid_email',   'Please enter a valid email address.');
    const passMin    = t('error.too_short',          'Minimum 8 characters required.');
    const passMismatch = t('error.password_mismatch','Passwords do not match.');
    const e: Record<string, string> = {};
    if (!form.first_name) e.first_name = required;
    if (!form.last_name)  e.last_name  = required;
    if (!form.email)      e.email      = required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = invalidEmail;
    if (!form.password)   e.password   = required;
    else if (form.password.length < 8)  e.password  = passMin;
    if (form.password !== form.password2) e.password2 = passMismatch;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const formData = new FormData();
    const finalForm = { ...form, username: form.username || form.email };
    Object.entries(finalForm).forEach(([k, v]) => formData.append(k, v));
    if (avatar) formData.append('avatar', avatar);

    try {
      const { data } = await auth.register(formData);
      // After interceptor unwraps, data = { user, access, refresh }
      if (data?.access) {
        localStorage.setItem('rtm_access', data.access);
        localStorage.setItem('rtm_refresh', data.refresh);
        setUser(data.user);
        toast.success('Account created! Welcome aboard. 🚀');
        navigate(nextPath === '/onboarding' ? '/onboarding' : nextPath);
      } else {
        toast.success('Account created! Please sign in.');
        navigate(nextPath !== '/onboarding' ? `/login?next=${encodeURIComponent(nextPath)}` : '/login');
      }
    } catch (err: any) {
      if (!err.response) {
        // Network error — backend unreachable
        toast.error('Cannot connect to the server. Make sure the backend is running.');
        return;
      }
      const errData = err.response?.data;
      let msg = 'Registration failed. Please check your details.';
      if (errData) {
        if (errData.message) {
          msg = errData.message;
        } else if (typeof errData === 'object') {
          // DRF field errors: { field: ["msg"] } or { field: "msg" }
          const entries = Object.entries(errData);
          if (entries.length > 0) {
            const [field, val] = entries[0];
            const text = Array.isArray(val) ? val[0] : val;
            // Show field name only for non-technical fields
            const skipField = ['non_field_errors', 'detail'];
            msg = skipField.includes(field) ? String(text) : `${field}: ${text}`;
          }
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 11, fontSize: 14,
    background: 'var(--bg3)', border: `2px solid ${focused === field ? 'var(--brand)' : errors[field] ? '#ef4444' : 'var(--border)'}`,
    color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
    boxShadow: focused === field ? '0 0 0 3px rgba(51,102,255,0.12)' : 'none'
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      {/* Top nav bar */}
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
            <button key={l.code} onClick={() => setLang && setLang(l.code)} title={l.name}
              style={{
                background: lang === l.code ? 'var(--brand)' : 'var(--bg3)',
                border: `1px solid ${lang === l.code ? 'var(--brand)' : 'var(--border)'}`,
                color: lang === l.code ? '#fff' : 'var(--text3)',
                borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4
              }}>
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background decorations */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(51,102,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Form container */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 24px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              {t('auth.register.title', 'Create your account')}
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>{t('auth.register.subtitle', 'Join thousands of distributed teams today.')}</p>
          </div>

          {/* Card */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 22, padding: '36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Avatar upload */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                <div onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 88, height: 88, borderRadius: 26, border: `2px dashed ${avatarPreview ? 'var(--brand)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    overflow: 'hidden', background: 'var(--bg3)', transition: 'all 0.2s', position: 'relative'
                  }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: 8 }}>
                      <UserIcon size={22} style={{ color: 'var(--text3)', marginBottom: 4 }} />
                      <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('auth.register.add_photo', 'Add Photo')}</div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
              </div>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {([[
                  'first_name', t('auth.register.first_name', 'First Name'), 'John'
                ], [
                  'last_name',  t('auth.register.last_name',  'Last Name'),  'Doe'
                ]] as [string, string, string][]).map(([field, label, ph]) => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <UserIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                      <input value={form[field as keyof typeof form]} onChange={e => updateForm(field, e.target.value)}
                        onFocus={() => setFocused(field)} onBlur={() => setFocused(null)}
                        placeholder={ph} style={inputStyle(field)} />
                    </div>
                    {errors[field] && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors[field]}</p>}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{t('common.email', 'Email')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    placeholder="name@company.com" style={inputStyle('email')} />
                </div>
                {errors.email && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</p>}
              </div>

              {/* Role selection */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{t('auth.register.choose_role', 'Your Role')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {ROLES.map(r => (
                    <div key={r.value} onClick={() => updateForm('role', r.value)}
                      style={{
                        padding: '12px 8px', borderRadius: 14,
                        border: `2px solid ${form.role === r.value ? r.color : 'var(--border)'}`,
                        background: form.role === r.value ? `${r.color}15` : 'var(--bg3)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', position: 'relative'
                      }}>
                      {form.role === r.value && (
                        <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={10} color="#fff" />
                        </div>
                      )}
                      <div style={{ fontSize: 18, marginBottom: 4 }}>
                        {r.value === 'developer' ? '💻' : r.value === 'project_manager' ? '📊' : r.value === 'designer' ? '🎨' : '👁️'}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: form.role === r.value ? r.color : 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passwords */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{t('auth.login.password', 'Password')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => updateForm('password', e.target.value)}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      style={{ ...inputStyle('password'), paddingRight: 40 }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password
                    ? <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.password}</p>
                    : <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>Min 8 characters</p>
                  }
                </div>
                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{t('auth.register.confirm_password', 'Confirm Password')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
                    <input
                      type={showPass2 ? 'text' : 'password'}
                      value={form.password2}
                      onChange={e => updateForm('password2', e.target.value)}
                      onFocus={() => setFocused('password2')} onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      style={{ ...inputStyle('password2'), paddingRight: 40 }}
                    />
                    <button type="button" onClick={() => setShowPass2(v => !v)} tabIndex={-1}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                      {showPass2 ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password2 && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.password2}</p>}
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
                  marginTop: 4, fontFamily: 'var(--font-body)'
                }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    {t('auth.register.creating', 'Creating account…')}
                  </>
                ) : (
                  <>{t('auth.register.submit', 'Create Account')} <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text3)', marginTop: 20 }}>
            {t('auth.register.have_account', 'Already have an account?')}{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 800, textDecoration: 'none' }}>{t('auth.login.sign_up', 'Sign in')}</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
