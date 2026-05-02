import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (avatar) formData.append('avatar', avatar);
    if (bio !== user?.bio) formData.append('bio', bio);
    try {
      await api.patch('/accounts/profile/update/', formData);
      toast.success('Profile updated');
      await login();
      setAvatar(null);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        <form onSubmit={updateProfile}>
          <div className="flex flex-col items-center gap-4 mb-4">
            <img src={user?.avatar || 'https://img.icons8.com/fluency/48/teamwork.png'} className="w-24 h-24 rounded-full object-cover" alt="avatar" />
            <label className="cursor-pointer bg-purple-600 text-white px-3 py-1 rounded">Upload Avatar<input type="file" className="hidden" onChange={e => setAvatar(e.target.files[0])} /></label>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700" rows={4} />
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full">{loading ? 'Saving...' : 'Save Bio'}</button>
        </form>
      </div>
    </div>
  );
};
export default Profile;
