import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Users, Mail, Shield, Search, Filter, MoreHorizontal, UserPlus } from 'lucide-react';
import api from '../services/api';

export default function Team() {
  const { activeWorkspace } = useStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeWorkspace) {
      fetchMembers();
    }
  }, [activeWorkspace]);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/workspaces/${activeWorkspace.id}/members/`);
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
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
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
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
        <div className="flex items-center gap-2 bg-gray-800/40 border border-gray-800 p-1 rounded-xl">
           <button className="px-4 py-2 text-xs font-bold text-white bg-gray-700 rounded-lg shadow-lg">All</button>
           <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">Admins</button>
           <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">Members</button>
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-white border border-gray-700 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-500 shadow-xl">
             {member.user?.username?.charAt(0).toUpperCase()}
          </div>
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
