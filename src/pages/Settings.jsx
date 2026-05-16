import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  CreditCard, 
  Globe, 
  LogOut,
  Save,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import toast from 'react-hot-toast';
import { auth as api } from '../services/api';
import Avatar from '../components/common/Avatar';
import Input from '../components/common/Input';

export default function Settings() {
  const { user, logout } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
  });

  const handleSave = async () => {
    try {
      await api.updateProfile(formData);
      toast.success('Profile saved! Please refresh to see changes.');
    } catch (e) {
      toast.error('Failed to save profile');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-1 font-medium">Manage your account preferences and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-gray-800/40 hover:text-white'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <div className="pt-6">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/20 border border-gray-800 rounded-[32px] p-8 md:p-10">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar user={user} size={80} className="shadow-2xl" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                      <span className="text-[10px] font-black uppercase">Change</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('avatar', file);
                            try {
                              await api.updateProfile(formData);
                              toast.success('Avatar updated! Refresh to see.');
                            } catch {
                              toast.error('Failed to update avatar');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</h3>
                    <p className="text-gray-500 text-sm font-medium">{user?.email}</p>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">{user?.role || 'Member'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  <Input label="First Name" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                  <Input label="Last Name" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Input label="Bio" multiline rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                </div>

                <div className="pt-6 flex justify-end">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20">
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Color Theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ThemeCard active id="dark" label="Deep Space" icon={<Moon size={24} />} />
                    <ThemeCard id="light" label="Cloudy Day" icon={<Sun size={24} />} />
                    <ThemeCard id="system" label="System Sync" icon={<Laptop size={24} />} />
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-lg font-bold text-white">Interface Density</h3>
                   <div className="flex gap-4">
                      <button className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center hover:border-blue-500 transition-all">
                        <p className="text-sm font-bold text-white">Default</p>
                        <p className="text-[10px] text-gray-500 mt-1">Comfortable spacing</p>
                      </button>
                      <button className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center hover:border-blue-500 transition-all">
                        <p className="text-sm font-bold text-white">Compact</p>
                        <p className="text-[10px] text-gray-500 mt-1">Maximum data density</p>
                      </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-[24px] text-white">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Current Plan</p>
                    <h2 className="text-3xl font-black mt-2">Enterprise Pro</h2>
                    <p className="text-sm mt-4 font-medium opacity-80">Your plan includes unlimited workspaces and full AI automation capabilities.</p>
                    <div className="mt-8 flex items-center justify-between">
                       <div className="text-sm font-black">$49.00 <span className="opacity-60 font-normal">/ month</span></div>
                       <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold text-sm">Manage Billing</button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Password & Authentication</h3>
                  <p className="text-sm text-gray-500 mb-6">Manage your password and secure your account with two-factor authentication.</p>
                  
                  <div className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all">Update Password</button>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Two-Factor Authentication (2FA)</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-800 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-gray-500 rounded-full absolute left-0.5 top-0.5"></div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-800">
                  <h3 className="text-lg font-bold text-rose-500 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data.</p>
                  <button className="border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white px-6 py-2 rounded-xl text-sm font-bold transition-all">Delete Account</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Notification Preferences</h3>
                  <p className="text-sm text-gray-500 mb-8">Choose what we notify you about and how we deliver those notifications.</p>

                  <div className="space-y-6">
                    {[
                      { title: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.', active: true },
                      { title: 'Push Notifications', desc: 'Get real-time updates directly in your browser or desktop app.', active: true },
                      { title: 'Direct Messages', desc: 'Notify me when someone sends me a direct message.', active: true },
                      { title: 'Mentions', desc: 'Notify me when someone mentions me in a task or channel.', active: true },
                      { title: 'Marketing Updates', desc: 'Receive news about product updates and new features.', active: false }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-blue-600' : 'bg-gray-800'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${item.active ? 'left-6' : 'left-0.5 bg-gray-500'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ id, label, icon, active }) {
  return (
    <button className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${active ? 'bg-blue-600/10 border-blue-500/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
      <div className={`mb-4 ${active ? 'text-blue-500' : 'text-gray-500'}`}>
        {icon}
      </div>
      <p className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{label}</p>
    </button>
  );
}
