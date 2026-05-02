import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [bio, setBio] = useState(user?.bio || '');

  const updateAvatar = async (e) => {
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append('avatar', file);
    await api.patch('/accounts/profile/update/', fd);
    toast.success('Avatar updated');
    await login(); // refresh user
  };

  const updateBio = async () => {
    await api.patch('/accounts/profile/update/', { bio });
    toast.success('Bio updated');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
      <h2 className="text-2xl font-bold">Profile Settings</h2>
      <div className="flex items-center gap-4">
        <img src={user?.avatar || 'https://img.icons8.com/fluency/48/teamwork.png'} className="w-16 h-16 rounded-full" alt="avatar" />
        <label className="cursor-pointer bg-purple-600 text-white px-3 py-1 rounded">Upload Avatar<input type="file" className="hidden" onChange={updateAvatar} /></label>
      </div>
      <div>
        <label className="block font-bold">Bio</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700" rows={3} />
        <button onClick={updateBio} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Save Bio</button>
      </div>
    </div>
  );
};
export default Profile;
