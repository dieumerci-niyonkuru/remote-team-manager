import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const ROLES = ['viewer', 'developer', 'manager', 'owner', 'frontend', 'backend', 'devops', 'designer', 'qa', 'product', 'hr'];

const ProfileEditor = ({ onClose }) => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || '',
    role: user?.role || 'viewer',
    profile_visibility: user?.profile_visibility || 'workspace'
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [qrCode, setQrCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [show2fa, setShow2fa] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    for (let k in form) data.append(k, form[k]);
    if (avatar) data.append('avatar', avatar);
    try {
      await api.patch('/accounts/profile/update/', data);
      toast.success('Profile updated');
      // Refresh user context
      const res = await api.get('/accounts/profile/');
      login(); // this will re-fetch user
      onClose();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const enable2fa = async () => {
    const res = await api.post('/accounts/profile/enable_2fa/');
    setQrCode(res.data.qr_code);
    setShow2fa(true);
  };
  const confirm2fa = async () => {
    if (!otpToken) return;
    await api.post('/accounts/profile/verify_2fa/', { token: otpToken });
    toast.success('2FA enabled');
    setShow2fa(false);
    window.location.reload();
  };
  const disable2fa = async () => {
    await api.post('/accounts/profile/disable_2fa/');
    toast.success('2FA disabled');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Profile</h2>
        <form onSubmit={updateProfile}>
          <div className="flex justify-center mb-3">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-purple-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">No avatar</div>
            )}
          </div>
          <input type="file" onChange={e => { setAvatar(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} className="w-full mb-3 text-sm" />
          <input type="text" placeholder="First Name" className="w-full border rounded p-2 mb-2 dark:bg-gray-700 dark:border-gray-600" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
          <input type="text" placeholder="Last Name" className="w-full border rounded p-2 mb-2" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
          <input type="email" placeholder="Email" className="w-full border rounded p-2 mb-2" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <select className="w-full border rounded p-2 mb-2" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
          <select className="w-full border rounded p-2 mb-2" value={form.profile_visibility} onChange={e => setForm({...form, profile_visibility: e.target.value})}>
            <option value="public">Public</option>
            <option value="workspace">Workspace only</option>
            <option value="private">Private</option>
          </select>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded mb-2">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
        <hr className="my-4" />
        <div>
          <h3 className="text-xl font-bold mb-2 dark:text-white">Two‑Factor Authentication</h3>
          {!user?.otp_enabled ? (
            <button onClick={enable2fa} className="bg-purple-600 text-white px-4 py-2 rounded">Enable 2FA</button>
          ) : (
            <button onClick={disable2fa} className="bg-red-600 text-white px-4 py-2 rounded">Disable 2FA</button>
          )}
          {show2fa && qrCode && (
            <div className="mt-4">
              <img src={qrCode} alt="QR" className="border p-2 bg-white inline-block" />
              <input type="text" placeholder="6-digit code" className="border p-2 mt-2 w-full" value={otpToken} onChange={e => setOtpToken(e.target.value)} />
              <button onClick={confirm2fa} className="bg-green-600 text-white px-4 py-1 ml-2 mt-2">Verify & Enable</button>
            </div>
          )}
        </div>
        <button onClick={onClose} className="mt-4 text-gray-500 underline float-right">Cancel</button>
      </div>
    </div>
  );
};
export default ProfileEditor;
