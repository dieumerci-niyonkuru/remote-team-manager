import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Briefcase, Users, Settings, Plus, Mail, Shield, UserPlus, Trash2, ChevronRight, Link } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeWorkspace, setActiveWorkspace } = useStore();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [targetProject, setTargetProject] = useState('');

  useEffect(() => {
    fetchWorkspaceData();
    fetchProjects();
  }, [id]);

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects/?workspace=${id}`);
      const data = res.data?.data || res.data || [];
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchWorkspaceData = async () => {
    try {
      const [wsRes, membersRes] = await Promise.all([
        api.get(`/workspaces/${id}/`),
        api.get(`/workspaces/${id}/members/`),
      ]);
      // After the api interceptor, r.data is already unwrapped from {data: ...}
      const wsData = wsRes.data || null;
      const memData = Array.isArray(membersRes.data)
        ? membersRes.data
        : (Array.isArray(membersRes.data?.data) ? membersRes.data.data : []);
      setWorkspace(wsData);
      setMembers(memData);
      if (wsData && activeWorkspace?.id !== wsData.id) {
        setActiveWorkspace(wsData);
      }
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
      const status = err.response?.status;
      if (status === 404) toast.error('Workspace not found');
      else if (status === 403) toast.error('Access denied to this workspace');
      else toast.error('Could not load workspace details');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await api.post(`/workspaces/${id}/invite/`, {
        email: inviteEmail,
        role: 'viewer',
      });
      toast.success(`Invite sent to ${inviteEmail}! 🎉`);
      setInviteEmail('');
      setTargetProject('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send invitation';
      toast.error(msg);
    }
  };

  const handleShareLink = async () => {
    try {
      const res = await api.post('/invites/generate_link/', { workspace: id, role: 'viewer', expires_days: 7 });
      const link = res.data?.join_url || res.data?.accept_url || '';
      if (link) {
        await navigator.clipboard.writeText(link);
        toast.success('Invite link copied to clipboard! 🔗');
      } else {
        toast.error('Could not get invite link');
      }
    } catch (err) {
      toast.error('Failed to generate invite link');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0f1d]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
        <ChevronRight size={14} />
        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/workspaces')}>Workspaces</span>
        <ChevronRight size={14} />
        <span className="text-blue-500">{workspace?.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-gray-800">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-600/20">
            {workspace?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">{workspace?.name}</h1>
            <p className="text-gray-400 max-w-xl">{workspace?.description || 'Build something amazing with your team in this workspace.'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all border border-gray-700">
            <Settings size={20} />
            Workspace Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 mb-8 border-b border-gray-800/50">
        {['overview', 'members', 'projects', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <StatCard title="Total Projects" value={workspace?.project_count || 0} icon={<Briefcase size={24} />} color="blue" />
               <StatCard title="Team Members" value={workspace?.member_count || 0} icon={<Users size={24} />} color="purple" />
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-gray-800/30 border border-gray-800 rounded-3xl overflow-hidden">
               <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Workspace Members</h3>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{members.length} Total</span>
               </div>
               <div className="divide-y divide-gray-800">
                  {members && members.length > 0 ? (
                    members.map(member => (
                      <div key={member.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <Avatar user={member.user} size={40} className="border-2 border-gray-800" />
                          <div>
                            <p className="text-sm font-bold text-white">
                              {member.user?.first_name ? `${member.user.first_name} ${member.user.last_name || ''}` : member.user?.username}
                            </p>
                            <p className="text-xs text-gray-500">{member.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-900 border border-gray-800">
                            <Shield size={14} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase text-gray-400">{member.role}</span>
                          </div>
                          <button className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-5 text-gray-500">No members found.</p>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Sidebar / Actions */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-500" />
                Invite Team
              </h3>
              <p className="text-xs text-blue-200/60 mb-6 font-medium">Add members to collaborate on projects and tasks.</p>
              
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Auto-attach to Project (Optional)</label>
                   <select 
                     value={targetProject}
                     onChange={(e) => setTargetProject(e.target.value)}
                     className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                   >
                     <option value="">No Project (Workspace only)</option>
                     {projects.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                   </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                  Send Invitation
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#0d1425] px-2 text-gray-600">or</span></div>
              </div>

              <button 
                onClick={handleShareLink}
                className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-2xl transition-all border border-gray-700"
              >
                <Link size={18} className="text-blue-500" />
                Copy Invite Link
              </button>
           </div>

           <div className="bg-gray-800/30 border border-gray-800 rounded-3xl p-6">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Workspace Info</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Created At</span>
                  <span className="text-sm font-bold text-white">{workspace && new Date(workspace.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Status</span>
                  <span className="flex items-center gap-1.5 text-green-500 text-sm font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-600/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-600/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} flex items-center justify-between bg-gray-800/20`}>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}
