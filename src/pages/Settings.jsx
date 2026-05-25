import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import {
  User, Shield, Bell, Palette, CreditCard,
  Globe, LogOut, Save, Moon, Sun, Laptop,
  Eye, EyeOff, CheckCircle2, XCircle, Upload,
  Camera, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { auth as authApi } from '../services/api';
import { Avatar, Input, Textarea, Button } from '../components/ui';

/* ── Password strength meter ──────────────────────────────── */
function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)             s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;
  if (pw.length >= 14)            s++;
  return s;
}
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#10b981'];

function PasswordStrength({ password }) {
  const s = getStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i <= s ? STRENGTH_COLORS[s] : 'var(--bg3)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color: STRENGTH_COLORS[s] }}>
        {STRENGTH_LABELS[s]}
      </span>
    </div>
  );
}

/* ── Toggle switch ────────────────────────────────────────── */
function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      aria-pressed={on}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: on ? 'var(--brand)' : 'var(--bg3)',
        position: 'relative', transition: 'background 0.25s ease', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: on ? '#fff' : 'var(--text3)',
        transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

/* ── Inline validation helper ─────────────────────────────── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <span style={{ fontSize: 11, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
      <XCircle size={12} /> {msg}
    </span>
  );
}
function FieldOk({ msg }) {
  if (!msg) return null;
  return (
    <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
      <CheckCircle2 size={12} /> {msg}
    </span>
  );
}

/* ── Avatar drag-and-drop upload ──────────────────────────── */
function AvatarUpload({ user, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await authApi.updateProfile(fd);
      toast.success('Avatar updated!');
      if (onUpload) onUpload(url);
    } catch {
      toast.error('Failed to update avatar');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      {/* Avatar preview */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--brand)', background: 'var(--bg3)' }}>
          {preview ? (
            <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Avatar user={user} size={82} />
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          flex: 1, minWidth: 180, minHeight: 80, borderRadius: 14,
          border: `2px dashed ${dragging ? 'var(--brand)' : 'var(--border2)'}`,
          background: dragging ? 'var(--brand-bg)' : 'var(--bg3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', gap: 6, padding: '16px 24px',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        <Upload size={20} color={dragging ? 'var(--brand)' : 'var(--text3)'} />
        <span style={{ fontSize: 12, fontWeight: 700, color: dragging ? 'var(--brand)' : 'var(--text2)', textAlign: 'center' }}>
          {dragging ? 'Drop to upload' : 'Drag & drop or click to change'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>PNG, JPG, GIF · max 4 MB</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files[0]; if (f) handleFile(f); }} />
    </div>
  );
}

/* ── Tab definition ───────────────────────────────────────── */
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: <User size={16} /> },
  { id: 'security',      label: 'Security',      icon: <Shield size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'appearance',    label: 'Appearance',    icon: <Palette size={16} /> },
  { id: 'billing',       label: 'Billing',       icon: <CreditCard size={16} /> },
];

/* ── Notification preference rows ─────────────────────────── */
const DEFAULT_NOTIF_PREFS = [
  { key: 'email',     title: 'Email Notifications',   desc: 'Daily summaries and critical alerts via email.',               on: true },
  { key: 'push',      title: 'Push Notifications',    desc: 'Real-time updates in browser or desktop.',                    on: true },
  { key: 'dm',        title: 'Direct Messages',       desc: 'Notify me when someone sends a direct message.',              on: true },
  { key: 'mention',   title: 'Mentions',              desc: 'Notify me when someone @mentions me.',                        on: true },
  { key: 'tasks',     title: 'Task Assignments',      desc: 'When a task is assigned to or updated by me.',                on: true },
  { key: 'invite',    title: 'Workspace Invites',     desc: 'When I\'m invited to a new workspace.',                       on: true },
  { key: 'marketing', title: 'Product Updates',       desc: 'News about features, announcements, and tips.',               on: false },
];

export default function Settings() {
  const { user, setUser, logout, theme, setTheme, lang = 'en', setLang } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Sync form when store user updates
  React.useEffect(() => {
    setForm({
      username: user?.username || '',
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
    });
  }, [user]);

  // Security form
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});
  const [changingPw, setChangingPw] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);

  /* ── validation ── */
  const validateForm = () => {
    const errs = {};
    if (!form.username.trim())                            errs.username = 'Username is required';
    else if (form.username.length < 3)                    errs.username = 'At least 3 characters';
    if (!form.email.trim())                               errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      if (res?.data?.user) setUser(res.data.user);
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.current)            errs.current = 'Current password is required';
    if (!pwForm.newPw)              errs.newPw  = 'New password is required';
    else if (pwForm.newPw.length < 8) errs.newPw = 'At least 8 characters';
    if (pwForm.newPw !== pwForm.confirm) errs.confirm = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePw()) return;
    setChangingPw(true);
    try {
      await authApi.changePassword({ old_password: pwForm.current, new_password: pwForm.newPw });
      toast.success('Password updated!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwErrors({});
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  /* ── helpers ── */
  const PwInput = ({ id, label, placeholder }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPw[id] ? 'text' : 'password'}
          placeholder={placeholder || '••••••••'}
          value={pwForm[id]}
          onChange={e => { setPwForm(p => ({ ...p, [id]: e.target.value })); setPwErrors(p => ({ ...p, [id]: '' })); }}
          className="input-field"
          style={{ paddingRight: 44 }}
        />
        <button onClick={() => setShowPw(p => ({ ...p, [id]: !p[id] }))}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}>
          {showPw[id] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {id === 'newPw' && <PasswordStrength password={pwForm.newPw} />}
      {id === 'confirm' && pwForm.confirm && !pwErrors.confirm && (
        <FieldOk msg="Passwords match" />
      )}
      <FieldError msg={pwErrors[id]} />
    </div>
  );

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }} className="page-enter">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ color: 'var(--text3)', marginTop: 5, fontSize: 13 }}>Manage your account preferences and configuration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,220px) 1fr', gap: 28, alignItems: 'start' }}
        className="settings-grid">
        {/* ── Sidebar nav ── */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, textAlign: 'left', transition: 'all 0.2s',
                background: activeTab === tab.id ? 'var(--brand)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text3)',
                boxShadow: activeTab === tab.id ? '0 4px 16px rgba(51,102,255,0.3)' : 'none',
              }}
            >
              <span style={{ opacity: activeTab === tab.id ? 1 : 0.7 }}>{tab.icon}</span>
              {tab.label}
              {tab.id === 'notifications' && (
                <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              )}
            </button>
          ))}
          <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <button
              onClick={logout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#ef4444', background: 'transparent', transition: 'all 0.2s' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </nav>

        {/* ── Content panel ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32 }}>

          {/* ─── PROFILE ─── */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
              <SectionHeader title="Profile Information" subtitle="Update your personal details and avatar." />

              {/* Avatar drag-and-drop */}
              <AvatarUpload user={user} onUpload={() => {}} />

              {/* Name + info */}
              <div style={{ paddingLeft: 4 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</p>
                <span className="badge badge-info" style={{ marginTop: 6 }}>{user?.role || 'Member'}</span>
              </div>

              <hr className="divider" />

              {/* Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                {[
                  { key: 'username',   label: 'Username',       type: 'text' },
                  { key: 'email',      label: 'Email Address',   type: 'email' },
                  { key: 'first_name', label: 'First Name',      type: 'text' },
                  { key: 'last_name',  label: 'Last Name',       type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setFormErrors(p => ({ ...p, [f.key]: '' })); }}
                      className="input-field"
                      style={{ borderColor: formErrors[f.key] ? 'var(--danger)' : undefined }}
                    />
                    <FieldError msg={formErrors[f.key]} />
                    {f.key === 'username' && form.username.length >= 3 && !formErrors.username && (
                      <FieldOk msg="Username looks good" />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  className="input-field"
                  style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
                  placeholder="Tell your team a bit about yourself..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 24px', fontSize: 13, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: '0.2s', boxShadow: '0 4px 16px rgba(51,102,255,0.3)' }}>
                  {saving ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <Save size={15} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ─── SECURITY ─── */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
              <SectionHeader title="Password & Authentication" subtitle="Keep your account secure with a strong password and 2FA." />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
                <PwInput id="current" label="Current Password" />
                <PwInput id="newPw"   label="New Password" />
                <PwInput id="confirm" label="Confirm New Password" />

                <button onClick={handleChangePassword} disabled={changingPw}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: changingPw ? 'not-allowed' : 'pointer', opacity: changingPw ? 0.7 : 1, width: 'fit-content', transition: '0.2s', marginTop: 4 }}>
                  {changingPw ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid var(--text)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <Shield size={15} />}
                  Update Password
                </button>
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Two-Factor Authentication</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>Add an extra layer of protection to your account.</p>
                </div>
                <Toggle on={false} onChange={() => toast('2FA setup coming soon')} />
              </div>

              <hr className="divider" />

              <div>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#ef4444', marginBottom: 6 }}>Danger Zone</p>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Permanently delete your account and all associated data.</p>
                <button style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', background: 'transparent', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
              <SectionHeader title="Notification Preferences" subtitle="Choose what we notify you about and how." />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {notifPrefs.map((item, i) => (
                  <div key={item.key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{item.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{item.desc}</p>
                      </div>
                      <Toggle
                        on={item.on}
                        onChange={val => setNotifPrefs(prev => prev.map(p => p.key === item.key ? { ...p, on: val } : p))}
                      />
                    </div>
                    {i < notifPrefs.length - 1 && <div style={{ height: 1, background: 'var(--border)' }} />}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => { setNotifPrefs(DEFAULT_NOTIF_PREFS); toast.success('Preferences reset to defaults'); }}
                  style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          )}

          {/* ─── APPEARANCE ─── */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
              <SectionHeader title="Appearance" subtitle="Customize how the app looks and feels." />

              {/* Theme selector */}
              <div>
                <p style={labelStyle}>Color Theme</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 8 }}>
                  {[
                    { id: 'dark',   label: 'Deep Space', icon: <Moon size={22} /> },
                    { id: 'light',  label: 'Cloudy Day', icon: <Sun size={22} /> },
                    { id: 'system', label: 'System Sync', icon: <Laptop size={22} /> },
                  ].map(t => {
                    const active = (theme || 'dark') === t.id;
                    return (
                      <button key={t.id} onClick={() => setTheme && setTheme(t.id)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '20px 12px', borderRadius: 14, border: `2px solid ${active ? 'var(--brand)' : 'var(--border)'}`, background: active ? 'var(--brand-bg)' : 'var(--bg3)', cursor: 'pointer', transition: 'all 0.2s', color: active ? 'var(--brand)' : 'var(--text3)', position: 'relative' }}>
                        {active && (
                          <span style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, background: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={10} color="#fff" />
                          </span>
                        )}
                        {t.icon}
                        <span style={{ fontSize: 11, fontWeight: 800, color: active ? 'var(--brand)' : 'var(--text2)' }}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="divider" />

              {/* Language selector */}
              <div>
                <p style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={14} style={{ color: 'var(--brand)' }} />
                  Interface Language
                </p>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                  Choose the language for labels, buttons, and navigation.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                  {[
                    { code: 'en', label: 'English',      flag: '🇬🇧', native: 'English' },
                    { code: 'fr', label: 'French',        flag: '🇫🇷', native: 'Français' },
                    { code: 'rw', label: 'Kinyarwanda',  flag: '🇷🇼', native: 'Ikinyarwanda' },
                  ].map(l => {
                    const active = (lang || 'en') === l.code;
                    return (
                      <button key={l.code} onClick={() => setLang && setLang(l.code)}
                        style={{ padding: 16, borderRadius: 12, border: `2px solid ${active ? 'var(--brand)' : 'var(--border)'}`, background: active ? 'var(--brand-bg)' : 'var(--bg3)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{l.flag}</div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{l.native}</p>
                        <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{l.label}</p>
                        {active && <span className="badge badge-info" style={{ marginTop: 6 }}>Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="divider" />

              {/* Interface density */}
              <div>
                <p style={labelStyle}>Interface Density</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {[
                    { id: 'default', label: 'Default', sub: 'Comfortable spacing' },
                    { id: 'compact', label: 'Compact', sub: 'Maximum data density' },
                  ].map(d => (
                    <button key={d.id}
                      style={{ flex: 1, background: 'var(--bg3)', border: '2px solid var(--border)', padding: '14px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{d.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{d.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── BILLING ─── */}
          {activeTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
              <SectionHeader title="Billing & Plan" subtitle="Manage your subscription and payment method." />
              <div style={{ background: 'linear-gradient(135deg, var(--brand), #6b46c1)', borderRadius: 20, padding: '32px 28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Current Plan</p>
                <h2 style={{ fontSize: 28, fontWeight: 900, margin: '8px 0 0', letterSpacing: '-0.02em' }}>Enterprise Pro</h2>
                <p style={{ fontSize: 13, opacity: 0.8, marginTop: 10 }}>Unlimited workspaces and full AI automation capabilities.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
                  <p style={{ fontSize: 14, fontWeight: 900 }}>$49.00 <span style={{ fontWeight: 400, opacity: 0.6, fontSize: 13 }}>/ month</span></p>
                  <button style={{ background: '#fff', color: 'var(--brand)', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>
                    Manage Billing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ── Small helpers ────────────────────────────────────────── */
function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 900,
  color: 'var(--text3)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 7,
};

function ThemeCard({ id, label, icon, active }) {
  return (
    <button className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${active ? 'bg-blue-600/10 border-blue-500/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
      <div className={`mb-4 ${active ? 'text-blue-500' : 'text-gray-500'}`}>{icon}</div>
      <p className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{label}</p>
    </button>
  );
}
