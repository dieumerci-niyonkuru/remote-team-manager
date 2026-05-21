import { useState } from 'react';
import Modal from '../common/Modal';
import * as tokens from '../../styles/tokens';
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import { Briefcase, Globe, Lock } from 'lucide-react';

export default function CreateWorkspaceModal({ isOpen, onClose, onCreated }) {
  const { addWorkspace } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', slug: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Workspace name is required');

    setLoading(true);
    try {
      const res = await ws.create({
        ...form,
        slug: form.name.toLowerCase().replace(/\s+/g, '-')
      });
      toast.success('Workspace created successfully! 🏢');
      addWorkspace(res.data);
      onCreated?.(res.data);
      onClose();
    } catch (err) {
      toast.error('Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workspace">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-8">
           <div className={`w-20 h-20 rounded-[${tokens.radius.lg}px] bg-blue-600/10 border-2 border-blue-600/20 flex items-center justify-center text-blue-500`}>
              <Briefcase size={40} />
           </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Workspace Name</label>
          <input 
            type="text"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="e.g. Acme Corp"
            className={`w-full bg-[#060b18] border border-gray-800 rounded-[${tokens.radius.lg}px] px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all font-medium`}
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Description</label>
          <textarea 
            rows="3"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Briefly describe your workspace..."
            className={`w-full bg-[#060b18] border border-gray-800 rounded-[${tokens.radius.lg}px] px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all resize-none font-medium`}
          />
        </div>

        <div className={`p-4 rounded-[${tokens.radius.lg}px] bg-amber-500/5 border border-amber-500/20`}>
           <p className="text-[11px] text-amber-500 font-bold uppercase mb-1">Important</p>
           <p className="text-xs text-amber-200/60 leading-relaxed">You will be automatically assigned as the <strong>Owner</strong> of this workspace and can invite team members later.</p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[${tokens.radius.lg}px] shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50`}
        >
          {loading ? 'Initializing Workspace...' : 'Launch Workspace'}
        </button>
      </form>
    </Modal>
  );
}
