import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaUserCircle, FaCheckCircle, FaCircle } from 'react-icons/fa';

const Profile = () => {
  const { user, login } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    // Check online status via presence heartbeat
    const fetchOnline = async () => {
      try {
        const res = await api.get('/presence/online_users/');
        const onlineUsers = res.data;
        setOnline(onlineUsers.some(u => u.id === user?.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchOnline();
    const interval = setInterval(fetchOnline, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    for (let key in profileData) {
      if (profileData[key]) formData.append(key, profileData[key]);
    }
    if (bio !== user?.bio) formData.append('bio', bio);
    if (avatar) formData.append('avatar', avatar);
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

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => window.history.back()} className="mb-4 flex items-center gap-1 text-purple-600 hover:underline">
        <FaArrowLeft /> Back
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-24"></div>
        <div className="relative px-6 pb-6">
          <div className="flex justify-center -mt-12 mb-4">
            <div className="relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
              ) : (
                <FaUserCircle className="w-24 h-24 text-gray-300 bg-white rounded-full" />
              )}
              <span className="absolute bottom-1 right-1">
                {online ? <FaCheckCircle className="text-green-500 text-xl" /> : <FaCircle className="text-gray-400 text-xl" />}
              </span>
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
            <p className="text-sm mt-1 flex items-center justify-center gap-1">
              {online ? <span className="text-green-500">● Online</span> : <span className="text-gray-500">● Offline</span>}
            </p>
          </div>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" name="first_name" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={profileData.first_name} onChange={handleChange} /></div>
              <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" name="last_name" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={profileData.last_name} onChange={handleChange} /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="email" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={profileData.email} onChange={handleChange} required /></div>
              <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" name="phone" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={profileData.phone} onChange={handleChange} /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Bio / Description</label><textarea rows="3" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." /></div>
            <div><label className="block text-sm font-medium mb-1">Avatar</label><input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} /></div>
            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition">{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;
