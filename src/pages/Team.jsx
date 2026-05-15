import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Users, Mail, Shield, Search, Filter, MoreHorizontal, UserPlus } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';

export default function Team() {
  const { activeWorkspace } = useStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchMembers();
    }
  }, [activeWorkspace]);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get(`/workspaces/${activeWorkspace.id}/members/`);
      setMembers(data.data || data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      await api.post(`/workspaces/${activeWorkspace.id}/invite/`, { 
        email: inviteEmail, 
        role: inviteRole 
      });
      toast.success(`Invite sent to ${inviteEmail}! 📧`);
      setIsModalOpen(false);
      setInviteEmail('');
    } catch (err) {
      toast.error('Failed to send invite.');
    } finally {
      setSending(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="text-blue-500" size={32} />
            Team Directory
          </h1>
          <p className="text-gray-400 mt-1">Manage roles and collaborate with your team in {activeWorkspace?.name}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <UserPlus size={20} />
          Invite Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-gray-800/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</label>
            <input 
              required
              type="email" 
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</label>
            <select 
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button 
            disabled={sending}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function MemberCard({ member }) {
  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'admin': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 transition-all hover:border-gray-700 hover:translate-y-[-4px] group">
       <div className="flex items-start justify-between mb-4">
          <Avatar user={member.user} size={56} className="shadow-xl" />
          <button className="p-2 hover:bg-gray-800 rounded-xl text-gray-600 hover:text-white transition-colors">
             <MoreHorizontal size={20} />
          </button>
       </div>

       <div className="mb-6">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{member.user?.username}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
             <Mail size={14} />
             {member.user?.email}
          </p>
       </div>

       <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${getRoleColor(member.role)}`}>
             {member.role}
          </span>
          <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             Online
          </div>
       </div>
    </div>
  );
}
