import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const ProfileEditor = ({ onClose }) => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '', username: user?.username || '' });
  const [password, setPassword] = useState({ old_password: '', new_password1: '', new_password2: '' });
  const [avatar, setAvatar] = useState(null);

  const updateProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let k in form) data.append(k, form[k]);
    if (avatar) data.append('avatar', avatar);
    await api.patch('/accounts/profile/update/', data);
    toast.success('Profile updated');
    onClose();
  };
  const changePassword = async (e) => {
    e.preventDefault();
    await api.post('/accounts/change_password/', password);
    toast.success('Password changed');
    setPassword({ old_password: '', new_password1: '', new_password2: '' });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded w-full max-w-md"><h2 className="text-2xl font-bold mb-4">Edit Profile</h2><form onSubmit={updateProfile}><input type="text" placeholder="First Name" value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} className="w-full border p-2 mb-2 rounded" /><input type="text" placeholder="Last Name" value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} className="w-full border p-2 mb-2 rounded" /><input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border p-2 mb-2 rounded" /><input type="file" onChange={e=>setAvatar(e.target.files[0])} className="w-full mb-2" /><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Save Changes</button></form><hr className="my-4" /><h3 className="text-xl font-bold mb-2">Change Password</h3><form onSubmit={changePassword}><input type="password" placeholder="Old Password" value={password.old_password} onChange={e=>setPassword({...password,old_password:e.target.value})} className="w-full border p-2 mb-2 rounded" /><input type="password" placeholder="New Password" value={password.new_password1} onChange={e=>setPassword({...password,new_password1:e.target.value})} className="w-full border p-2 mb-2 rounded" /><input type="password" placeholder="Confirm New Password" value={password.new_password2} onChange={e=>setPassword({...password,new_password2:e.target.value})} className="w-full border p-2 mb-2 rounded" /><button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">Change Password</button></form><button onClick={onClose} className="mt-4 text-gray-500 underline">Cancel</button></div></div>
  );
};
export default ProfileEditor;
