import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import { useT } from '../i18n';
import toast from 'react-hot-toast';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (key: string, val: string) => void;
  error?: string;
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, type = 'text', placeholder, value, onChange, error, children }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
    <label className="label" style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
      {label}
    </label>
    {children || (
      <input 
        className={`input ${error ? 'error' : ''}`} 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={e => onChange(name, e.target.value)} 
        style={{ 
          padding: '16px 20px', 
          borderRadius: '12px', 
          fontSize: '15px', 
          width: '100%', 
          boxSizing: 'border-box',
          borderColor: error ? 'var(--error)' : 'var(--border)'
        }} 
      />
    )}
    {error && <div className="error-msg" style={{ marginTop: '6px', fontSize: '12px', color: 'var(--error)' }}>{error}</div>}
  </div>
);

export default function Register() {
  const { setUser, theme, lang } = useStore();
  const t = useT(lang);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ROLES = [
    { value: 'viewer', label: t.viewer, desc: t.viewerDesc, icon: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=100' },
    { value: 'developer', label: t.developer, desc: t.developerDesc, icon: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
    { value: 'manager', label: t.manager, desc: t.managerDesc, icon: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
    { value: 'designer', label: t.designer, desc: t.designerDesc, icon: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
  ];

  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '', password: '', password2: '', role: 'viewer'
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    const e: Record<string, string> = {};
    if (!form.first_name) e.first_name = t.required;
    if (!form.last_name) e.last_name = t.required;
    if (!form.email) e.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invalidEmail;
    if (!form.password) e.password = t.required;
    else if (form.password.length < 8) e.password = t.passMin;
    if (form.password !== form.password2) e.password2 = t.passMismatch;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (avatar) formData.append('avatar', avatar);

    try {
      await auth.register(formData);
      toast.success('Account created successfully. Please log in.');
      navigate('/login');
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Unable to register. Please check your details.';
      if (data) {
        if (data.message) msg = data.message;
        else if (typeof data === 'object') {
          const apiErrors = Object.values(data).flat();
          if (apiErrors.length > 0) msg = String(apiErrors[0]);
        }
      }
      toast.error(msg);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className={theme} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg)', 
      padding: 'clamp(20px, 4vw, 100px) clamp(16px, 3vw, 24px)', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <div className="moving-code-bg" />

      <div className="card glass-premium fade-in" style={{ 
        width: '100%', 
        maxWidth: '600px', 
        padding: 'clamp(24px, 5vw, 56px)', 
        borderRadius: '32px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ 
            display: 'inline-flex', 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--brand), #8b5cf6)', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            margin: '0 auto 24px', 
            boxShadow: '0 10px 20px rgba(51,102,255,0.3)' 
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
            {t.createAccountTitle}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '15px', fontWeight: 500 }}>
            {t.createAccountDesc}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Avatar Selection */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '90px', 
                height: '90px', 
                borderRadius: '24px', 
                border: '2px dashed var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                overflow: 'hidden', 
                position: 'relative', 
                background: 'var(--bg3)', 
                transition: 'all 0.2s' 
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                   <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px' }}>{t.addPhoto}</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
             <FormField name="first_name" label={t.firstName} placeholder="John" value={form.first_name} onChange={updateForm} error={errors.first_name} />
             <FormField name="last_name" label={t.lastName} placeholder="Doe" value={form.last_name} onChange={updateForm} error={errors.last_name} />
          </div>

          <FormField name="email" label={t.email} type="email" placeholder="name@company.com" value={form.email} onChange={updateForm} error={errors.email} />

          {/* Role Selection Grid */}
          <div>
            <label className="label" style={{ marginBottom: '12px', display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t.chooseRole}
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
              gap: '12px' 
            }}>
              {ROLES.map(r => (
                <div key={r.value} onClick={() => updateForm('role', r.value)} style={{ 
                  padding: '12px', 
                  borderRadius: '16px', 
                  background: form.role === r.value ? 'var(--brand-bg)' : 'var(--bg3)', 
                  border: form.role === r.value ? '2px solid var(--brand)' : '2px solid transparent', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '8px',
                  textAlign: 'center'
                }}>
                  <img src={r.icon} alt={r.label} style={{ width: '36px', height: '36px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: form.role === r.value ? 'var(--brand)' : 'var(--text)' }}>{r.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
             <FormField name="password" label={t.password} type="password" placeholder="••••••••" value={form.password} onChange={updateForm} error={errors.password} />
             <FormField name="password2" label={t.confirmPass} type="password" placeholder="••••••••" value={form.password2} onChange={updateForm} error={errors.password2} />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', fontWeight: 700, marginTop: '8px', transition: '0.2s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t.creatingAccount : t.signUp}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginTop: '32px', fontWeight: 500 }}>
          {t.hasAccount} <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>{t.signinHere}</Link>
        </p>
      </div>

      <style>{`
        .glass-premium { 
          background: rgba(var(--bg-card-rgb, 255, 255, 255), 0.9); 
          backdrop-filter: blur(20px); 
          border: 1px solid rgba(150,150,150,0.1); 
        }
        @media (prefers-color-scheme: dark) {
          .glass-premium { background: rgba(var(--bg-card-rgb, 20, 20, 25), 0.8); }
        }
      `}</style>
    </div>
  );
}
