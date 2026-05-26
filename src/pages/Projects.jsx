import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { FolderKanban, Plus, MoreVertical, LayoutGrid, List as ListIcon, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';

export default function Projects() {
  const { activeWorkspace } = useStore();
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState('grid');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', description: '', project_type: 'Software Development' });
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (activeWorkspace) {
      fetchProjects();
    }
  }, [activeWorkspace]);

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects/?workspace=${activeWorkspace.id}`);
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setProjects(list);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!activeWorkspace?.id) {
      toast.error('Please select a workspace first');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/projects/', { ...formData, workspace: activeWorkspace.id });
      const created = Array.isArray(res.data) ? res.data[0] : (res.data?.data || res.data);
      setProjects([created, ...projects]);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', project_type: 'Software Development' });
      toast.success('Project created! 🚀');
    } catch (err) {
      toast.error('Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock size={16} className="text-blue-500" />;
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'on_hold': return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 max-w-7xl mx-auto bg-[#060b18]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <FolderKanban className="text-blue-500" size={36} />
            Projects
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Manage and track your team's initiatives in {activeWorkspace?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 p-1 rounded-xl flex items-center border border-white/5 backdrop-blur-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="px-6 py-3 font-black text-sm uppercase tracking-widest"
            leftIcon={<Plus size={18} />}
          >
            New Project
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 animate-pulse">
          <div className="w-16 h-16 rounded-3xl border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Syncing Projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card variant="glass" className="border-dashed border-white/10 p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-gray-500">
            <FolderKanban size={40} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Zero Projects Found</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-10 font-medium">Start by creating your first project to organize your team's workspace intelligence.</p>
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>Initialize Project Node</Button>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} viewMode={viewMode} getStatusIcon={getStatusIcon} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Project Node">
        <form onSubmit={handleCreate} className="space-y-8 py-4">
          <Input 
            label="Project Title"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Project Orion, Q4 Engineering"
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Project Classification</label>
            <select 
              value={formData.project_type}
              onChange={e => setFormData({...formData, project_type: e.target.value})}
              className="w-full bg-[#0b1429] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
            >
              <option value="Software Development">Software Development</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Business Strategy">Business Strategy</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Intelligence Overview</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Primary objectives and scope..."
              rows={4}
              className="w-full bg-[#0b1429] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" 
            />
          </div>
          <Button 
            disabled={creating}
            type="submit" 
            fullWidth
            className="py-4 font-black"
            loading={creating}
          >
            Create Project
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function ProjectCard({ project, viewMode, getStatusIcon }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-[#0d1425]/40 border border-white/5 hover:border-blue-500/30 rounded-[24px] p-5 transition-all flex items-center gap-6 group backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
          <FolderKanban size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-white truncate group-hover:text-blue-400 transition-colors tracking-tight leading-none mb-2">{project.name}</h3>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{project.project_type}</p>
        </div>
        <div className="hidden md:flex flex-col items-end px-6 border-r border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            {getStatusIcon(project.status)}
            <span>{project.status}</span>
          </div>
        </div>
        <div className="w-64 hidden lg:block px-6 border-r border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Progress</span>
            <span className="text-[10px] font-black text-white">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${project.progress || 0}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-500 px-6">
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-white">{project.task_count || 0}</span>
            <span className="text-[10px] uppercase font-black tracking-tighter">Tasks</span>
          </div>
        </div>
        <button className="p-3 hover:bg-white/5 rounded-xl text-gray-600 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    );
  }

  return (
    <Card 
      variant="glass" 
      className="flex flex-col group h-full !p-0 overflow-hidden border-white/5 hover:border-blue-500/30 transition-all duration-500"
    >
      <div className="p-8 flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
          <FolderKanban size={100} />
        </div>
        
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl">
            <FolderKanban size={28} />
          </div>
          <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
            <MoreVertical size={22} />
          </button>
        </div>
        
        <div className="mb-8 flex-1 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
              {project.project_type}
            </span>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 text-[10px] font-black text-gray-500 border border-white/5 uppercase tracking-widest">
              {getStatusIcon(project.status)}
              <span>{project.status}</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors tracking-tighter leading-tight">{project.name}</h3>
          <p className="text-gray-400 text-sm font-medium line-clamp-3 leading-relaxed">{project.description || 'No detailed intelligence overview provided for this project.'}</p>
        </div>

        <div className="space-y-6 pt-8 border-t border-white/5 relative z-10">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Intelligence Velocity</span>
              <span className="text-sm font-black text-white">{project.progress || 0}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out" 
                style={{ width: `${project.progress || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 rounded-2xl border-4 border-[#0b1429] bg-gray-800 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                  {i}
                </div>
              ))}
              <div className="w-9 h-9 rounded-2xl border-4 border-[#0b1429] bg-white/5 backdrop-blur-xl flex items-center justify-center text-[10px] font-black text-gray-400">
                +{project.member_count || 0}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trajectory Units</p>
              <p className="text-2xl font-black text-white tracking-tighter">{project.task_count || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
