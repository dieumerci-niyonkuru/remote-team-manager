import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Users, Mail, Shield, Search, Filter, MoreHorizontal, UserPlus, Zap } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

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
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 max-w-7xl mx-auto bg-[#060b18]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <Users className="text-blue-500" size={36} />
            Network Nodes
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Manage node privileges and synchronization in {activeWorkspace?.name}</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="px-8 py-3 font-black text-sm uppercase tracking-widest"
          leftIcon={<UserPlus size={18} />}
        >
          Authorize New Node
        </Button>
      </div>

      {/* Search Bar */}
      <Card variant="glass" className="mb-10 p-2 border-white/5 shadow-2xl">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Scan for username or neural ID (email)..."
            className="w-full bg-transparent border-none rounded-2xl pl-16 pr-6 py-4 text-sm text-white outline-none focus:ring-0 placeholder:text-gray-600 font-medium"
          />
        </div>
      </Card>

      {/* Members Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 animate-pulse">
          <div className="w-16 h-16 rounded-3xl border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Scanning Active Nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Authorize Node Invitation">
        <form onSubmit={handleInvite} className="space-y-8 py-4">
          <Input 
            label="Neural ID (Email Address)"
            required
            type="email" 
            value={inviteEmail}
            onChange={v => setInviteEmail(v)}
            placeholder="collaborator@network.com"
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Privilege Level</label>
            <select 
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full bg-[#0b1429] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none font-medium"
            >
              <option value="member">Standard Member</option>
              <option value="admin">Admin Controller</option>
            </select>
          </div>
          <Button 
            disabled={sending}
            type="submit" 
            fullWidth
            className="py-4 font-black"
            loading={sending}
            rightIcon={<Mail size={18} />}
          >
            Transmit Invitation
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function MemberCard({ member }) {
  const getRoleStyle = (role) => {
    switch (role) {
      case 'owner': return 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'admin': return 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
      default: return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  return (
    <Card 
      variant="glass" 
      className="p-8 border-white/5 hover:border-blue-500/30 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden shadow-2xl"
    >
       <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-12 transition-all duration-1000">
         <Shield size={120} />
       </div>

       <div className="flex items-start justify-between mb-8 relative z-10">
          <Avatar user={member.user} size={64} className="shadow-2xl ring-4 ring-[#0d1425] border-transparent group-hover:scale-110 transition-transform duration-500" />
          <button className="p-2 hover:bg-white/5 rounded-xl text-gray-700 hover:text-white transition-colors">
             <MoreHorizontal size={24} />
          </button>
       </div>

       <div className="mb-8 relative z-10">
          <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter leading-none mb-3">{member.user?.username}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
             <Mail size={14} className="text-blue-500" />
             {member.user?.email}
          </p>
       </div>

       <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${getRoleStyle(member.role)} tracking-widest`}>
             {member.role}
          </span>
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
             Active Pulse
          </div>
       </div>
    </Card>
  );
}
