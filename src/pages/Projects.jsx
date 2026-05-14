import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { FolderKanban, Plus, MoreVertical, LayoutGrid, List as ListIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export default function Projects() {
  const { activeWorkspace } = useStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', project_type: 'Software Development' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects();
    }
  }, [activeWorkspace]);

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects/?workspace=${activeWorkspace.id}`);
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/projects/', { ...formData, workspace: activeWorkspace.id });
      setProjects([res.data, ...projects]);
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
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'on_hold': return <AlertCircle size={16} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="text-blue-500" size={32} />
            Projects
          </h1>
          <p className="text-gray-400 mt-1">Manage and track your team's initiatives in {activeWorkspace?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 p-1 rounded-lg flex items-center border border-gray-700">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-gray-800/50 border border-dashed border-gray-700 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="text-gray-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 max-w-xs mx-auto mb-6">Start by creating your first project to organize your team's work.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-blue-500 font-bold hover:underline">+ Create your first project</button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} viewMode={viewMode} getStatusIcon={getStatusIcon} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Project Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Website Redesign, Q4 Marketing"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Project Type</label>
            <select 
              value={formData.project_type}
              onChange={e => setFormData({...formData, project_type: e.target.value})}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="Software Development">Software Development</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Business Strategy">Business Strategy</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Brief overview of the project goals..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
            />
          </div>
          <button 
            disabled={creating}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ProjectCard({ project, viewMode, getStatusIcon }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 transition-all flex items-center gap-4 group">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
          <FolderKanban size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate group-hover:text-blue-400 transition-colors">{project.name}</h3>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{project.project_type}</p>
        </div>
        <div className="hidden md:flex flex-col items-end px-4 border-r border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {getStatusIcon(project.status)}
            <span className="capitalize">{project.status}</span>
          </div>
        </div>
        <div className="w-48 hidden lg:block px-4 border-r border-gray-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Progress</span>
            <span className="text-[10px] font-bold text-white">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-sm px-4">
          <div className="flex flex-col items-center">
            <span className="font-bold text-white">{project.task_count}</span>
            <span className="text-[10px] uppercase font-bold">Tasks</span>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-500 hover:text-white transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-3xl p-6 transition-all hover:translate-y-[-4px] shadow-lg hover:shadow-2xl hover:shadow-blue-600/10 flex flex-col group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
          <FolderKanban size={24} />
        </div>
        <button className="p-2 hover:bg-gray-700 rounded-xl text-gray-500 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="mb-6 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-md bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-700">
            {project.project_type}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-800 text-[10px] font-bold text-gray-400 border border-gray-700">
            {getStatusIcon(project.status)}
            <span className="capitalize">{project.status}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{project.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{project.description || 'No description provided for this project.'}</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Project Progress</span>
            <span className="text-sm font-bold text-white">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700/50">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-gray-800">
                U{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
              +{project.member_count}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tasks</p>
            <p className="text-lg font-black text-white">{project.task_count}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
