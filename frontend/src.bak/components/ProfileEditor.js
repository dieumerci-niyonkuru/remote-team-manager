import React, { useState } from 'react';
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
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password1: '', new_password2: '' });
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
      login(); // refresh (will re-fetch)
      onClose();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password1 !== passwordData.new_password2) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await api.post('/accounts/change_password/', passwordData);
      toast.success('Password changed');
      setPasswordData({ old_password: '', new_password1: '', new_password2: '' });
    } catch (err) {
      toast.error('Password change failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={updateProfile}>
          <div className="mb-3 flex justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-purple-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">No avatar</div>
            )}
          </div>
          <input type="file" onChange={e => { setAvatar(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} className="w-full mb-3" />
          <input type="text" placeholder="First Name" className="w-full border rounded p-2 mb-2" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
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
        <h3 className="text-xl font-bold mb-2">Change Password</h3>
        <form onSubmit={changePassword}>
          <input type="password" placeholder="Old Password" className="w-full border rounded p-2 mb-2" value={passwordData.old_password} onChange={e => setPasswordData({...passwordData, old_password: e.target.value})} />
          <input type="password" placeholder="New Password" className="w-full border rounded p-2 mb-2" value={passwordData.new_password1} onChange={e => setPasswordData({...passwordData, new_password1: e.target.value})} />
          <input type="password" placeholder="Confirm New Password" className="w-full border rounded p-2 mb-2" value={passwordData.new_password2} onChange={e => setPasswordData({...passwordData, new_password2: e.target.value})} />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Change Password</button>
        </form>
        <button onClick={onClose} className="mt-4 text-gray-500 underline">Cancel</button>
      </div>
    </div>
  );
};
export default ProfileEditor;

// Add this inside the component (after the change password form)
import QRCode from 'qrcode.react';
// ... existing code ...

// State for 2FA
const [qrCode, setQrCode] = useState('');
const [otpToken, setOtpToken] = useState('');
const [show2faSetup, setShow2faSetup] = useState(false);

const enable2fa = async () => {
  const res = await api.post('/accounts/profile/enable_2fa/');
  setQrCode(res.data.qr_code);
  setShow2faSetup(true);
};

const confirm2fa = async () => {
  await api.post('/accounts/profile/verify_2fa/', { token: otpToken });
  toast.success('2FA enabled');
  setShow2faSetup(false);
};

const disable2fa = async () => {
  await api.post('/accounts/profile/disable_2fa/');
  toast.success('2FA disabled');
};

// Inside the render, after the change password button, add:
// {!user?.otp_enabled ? (
//   <button onClick={enable2fa} className="bg-purple-600 text-white px-4 py-2 rounded">Enable 2FA</button>
// ) : (
//   <button onClick={disable2fa} className="bg-red-600 text-white px-4 py-2 rounded">Disable 2FA</button>
// )}
// {show2faSetup && (
//   <div className="mt-4">
//     <QRCode value={qrCode} />
//     <input type="text" placeholder="Enter 6-digit code" value={otpToken} onChange={e=>setOtpToken(e.target.value)} className="border p-2 mt-2" />
//     <button onClick={confirm2fa} className="bg-green-600 text-white px-4 py-1 rounded ml-2">Verify & Enable</button>
//   </div>
// )}
