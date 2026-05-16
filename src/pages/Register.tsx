import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import { useT } from '../i18n';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Rocket, Mail, Lock, User as UserIcon, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

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
    email: '', first_name: '', last_name: '', password: '', password2: '', role: 'viewer', username: ''
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
    // Ensure username is set to email if blank
    const finalForm = { ...form, username: form.username || form.email };
    Object.entries(finalForm).forEach(([k, v]) => formData.append(k, v));
    if (avatar) formData.append('avatar', avatar);

    try {
      const { data } = await auth.register(formData);
      // Auto-login if backend returns tokens
      if (data.data?.access) {
        localStorage.setItem('rtm_access', data.data.access);
        localStorage.setItem('rtm_refresh', data.data.refresh);
        setUser(data.data.user);
        toast.success('Account created! Welcome aboard. 🚀');
        navigate('/onboarding');
      } else {
        toast.success('Account created! Please sign in.');
        navigate('/login');
      }
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
    <div className="min-h-screen bg-[#060b18] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-violet/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <Card variant="glass" className="p-12 space-y-10">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-flex w-16 h-16 rounded-3xl bg-brand items-center justify-center text-white shadow-lg shadow-brand/20 mb-4 hover:scale-110 transition-transform">
               <Rocket size={32} />
            </Link>
            <h1 className="text-4xl font-black tracking-tight">{t.createAccountTitle}</h1>
            <p className="text-text-secondary font-medium">{t.createAccountDesc}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
             {/* Avatar Selection */}
            <div className="flex justify-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-24 h-24 rounded-[32px] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden bg-white/5 transition-all hover:border-brand/50 hover:bg-white/10"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-text-tertiary">
                     <div className="text-[10px] font-black uppercase tracking-widest group-hover:text-brand transition-colors">{t.addPhoto}</div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label={t.firstName} 
                placeholder="John" 
                value={form.first_name} 
                onChange={e => updateForm('first_name', e.target.value)} 
                error={errors.first_name} 
                leftIcon={<UserIcon size={16} />}
              />
              <Input 
                label={t.lastName} 
                placeholder="Doe" 
                value={form.last_name} 
                onChange={e => updateForm('last_name', e.target.value)} 
                error={errors.last_name} 
                leftIcon={<UserIcon size={16} />}
              />
            </div>

            <Input 
              label={t.email} 
              type="email" 
              placeholder="name@company.com" 
              value={form.email} 
              onChange={e => updateForm('email', e.target.value)} 
              error={errors.email} 
              leftIcon={<Mail size={16} />}
            />

            {/* Role Selection Grid */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{t.chooseRole}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ROLES.map(r => (
                  <div 
                    key={r.value} 
                    onClick={() => updateForm('role', r.value)} 
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2
                      ${form.role === r.value ? 'bg-brand/10 border-brand' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <img src={r.icon} alt={r.label} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                    <div className="font-black text-[10px] uppercase tracking-tighter text-white">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label={t.password} 
                type="password" 
                placeholder="••••••••" 
                value={form.password} 
                onChange={e => updateForm('password', e.target.value)} 
                error={errors.password} 
                leftIcon={<Lock size={16} />}
              />
              <Input 
                label={t.confirmPass} 
                type="password" 
                placeholder="••••••••" 
                value={form.password2} 
                onChange={e => updateForm('password2', e.target.value)} 
                error={errors.password2} 
                leftIcon={<Lock size={16} />}
              />
            </div>

            <Button 
              type="submit" 
              loading={loading} 
              className="w-full py-5 text-lg font-black"
            >
              {loading ? t.creatingAccount : t.signUp} <ArrowRight className="ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-text-tertiary">
            {t.hasAccount} <Link to="/login" className="text-brand font-black hover:underline">{t.signinHere}</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
