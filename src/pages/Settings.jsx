import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { auth, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Camera, Save, Lock, User } from 'lucide-react';
import { Button } from '../components/common/Button';

const card = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 'clamp(16px, 2vw, 24px)' };
const input = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
const label = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' };
const textarea = { ...input, resize: 'vertical', minHeight: 72 };

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
];

function getInitials(firstName, lastName) {
  const a = (firstName || '').trim();
  const b = (lastName || '').trim();
  if (a && b) return (a[0] + b[0]).toUpperCase();
  if (a) return a.substring(0, 2).toUpperCase();
  if (b) return b.substring(0, 2).toUpperCase();
  return '??';
}

export default function Settings() {
  const { user, setUser, lang = 'en' } = useStore();
  const t = getT(lang || 'en');

  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await auth.updateProfile(fd);
      const data = unwrapData(res);
      setUser(data);
      toast.success('Avatar updated');
    } catch (err) {
      setAvatarPreview(null);
      toast.error(err.response?.data?.detail || 'Failed to upload avatar');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await auth.updateProfile({ first_name: firstName, last_name: lastName, email, bio });
      const data = unwrapData(res);
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPw(true);
    try {
      await auth.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const initials = getInitials(firstName, lastName);
  const displayAvatar = avatarPreview || user?.avatar_url || null;

  return (
    <div className="p-4 md:p-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>{t('settings.title', 'Settings')}</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex md:flex-col gap-1 md:w-48 shrink-0">
          {TABS.map(tb => {
            const Icon = tb.icon;
            const active = tab === tb.id;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className="flex items-center gap-2"
                style={{
                  background: active ? 'var(--brand-bg)' : 'transparent',
                  border: active ? '1px solid rgba(51,102,255,0.2)' : '1px solid transparent',
                  borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600,
                  color: active ? 'var(--brand)' : 'var(--text3)', cursor: 'pointer',
                  textAlign: 'left', transition: '0.15s',
                }}>
                <Icon size={14} /> {tb.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <div style={card}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24, marginTop: 8 }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                <div onClick={handleAvatarClick}
                  style={{
                    width: 80, height: 80, borderRadius: '50%', cursor: 'pointer',
                    background: displayAvatar ? 'transparent' : 'var(--brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden', flexShrink: 0,
                    border: '2px solid var(--border)',
                  }}>
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{initials}</span>
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
                    background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    <Camera size={13} color="#fff" />
                  </div>
                </div>
                <button onClick={handleAvatarClick} style={{
                  background: 'none', border: 'none', color: 'var(--brand)', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', padding: 0,
                }}>Change photo</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
                <div>
                  <label style={label}>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} style={input} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={label}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={input} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={label}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={textarea} />
              </div>
              <div className="flex justify-end">
                <Button variant="primary" leftIcon={<Save size={14} />} onClick={saveProfile} loading={saving}>Save Changes</Button>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div style={card}>
              <div style={{ marginBottom: 24, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <Lock size={16} style={{ color: 'var(--text2)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Change Password</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={input} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={input} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={label}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={input} />
                </div>
                <div className="flex justify-end">
                  <Button variant="primary" leftIcon={<Lock size={14} />} onClick={changePassword} loading={changingPw}>Update Password</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
