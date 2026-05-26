import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Briefcase, Plus, Users, ChevronRight, Globe } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export default function Workspaces() {
  const navigate = useNavigate();
  const { setWorkspaces: setGlobalWorkspaces, setActiveWorkspace } = useStore();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces/');
      // After interceptor, res.data is the already-unwrapped array
      const data = Array.isArray(res.data) ? res.data : [];
      setWorkspaces(data);
      setGlobalWorkspaces(data);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/workspaces/', formData);
      // After interceptor, res.data is the workspace object
      const newWs = res.data;
      const updated = [newWs, ...workspaces];
      setWorkspaces(updated);
      setGlobalWorkspaces(updated);
      if (!workspaces.length) setActiveWorkspace(newWs); // auto-set if first workspace
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      toast.success('Workspace created successfully! 🚀');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to create workspace.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Briefcase className="text-blue-500" size={36} />
            My Workspaces
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Switch between your company and project environments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} />
          Create Workspace
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="bg-gray-800/30 border border-dashed border-gray-700 rounded-[40px] p-16 text-center">
           <div className="w-20 h-20 bg-gray-800 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl">
             <Briefcase className="text-gray-500" size={40} />
           </div>
           <h3 className="text-2xl font-black text-white mb-2">No workspaces found</h3>
           <p className="text-gray-400 max-w-sm mx-auto mb-8 font-medium">Create your first workspace to start collaborating with your team.</p>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all"
           >
             Initialize Workspace
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workspaces.map(workspace => (
            <WorkspaceCard key={workspace.id} workspace={workspace} onClick={() => navigate(`/workspaces/${workspace.id}`)} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Workspace">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Workspace Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Acme Corp, Engineering, Marketing"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="What is this workspace for?"
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
            />
          </div>
          <button 
            disabled={creating}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function WorkspaceCard({ workspace, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-gray-800/40 border border-gray-800 rounded-[32px] p-8 transition-all hover:border-blue-500/50 hover:translate-y-[-6px] hover:shadow-2xl hover:shadow-blue-600/10 cursor-pointer group"
    >
       <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
             {workspace.name.charAt(0)}
          </div>
          <div className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-500 group-hover:text-blue-500 transition-colors">
             <ChevronRight size={20} />
          </div>
       </div>

       <div className="mb-8">
          <h3 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{workspace.name}</h3>
          <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">
            {workspace.description || 'Access projects, tasks, and team collaboration for this workspace.'}
          </p>
       </div>

       <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800/50">
          <div className="flex items-center gap-2">
             <Users size={16} className="text-gray-600" />
             <span className="text-xs font-bold text-gray-400">{workspace.member_count} Members</span>
          </div>
          <div className="flex items-center gap-2">
             <Globe size={16} className="text-gray-600" />
             <span className="text-xs font-bold text-gray-400">Active</span>
          </div>
       </div>
    </div>
  );
}
