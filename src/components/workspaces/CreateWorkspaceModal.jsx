import { useState } from 'react';
import Modal from '../common/Modal';
import { ws } from '../../services/api';   // ← was missing; caused ReferenceError on submit
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';

export default function CreateWorkspaceModal({ isOpen, onClose, onCreated }) {
  const { addWorkspace } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Workspace name is required');

    setLoading(true);
    try {
      const res = await ws.create({
        ...form,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      });
      toast.success('Workspace created! 🏢');
      addWorkspace(res.data);
      onCreated?.(res.data);
      setForm({ name: '', description: '' });
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.name?.[0] ||
        'Failed to create workspace.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workspace">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border-2 border-blue-600/20 flex items-center justify-center text-blue-500">
            <Briefcase size={38} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            Workspace Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Acme Corp"
            className="w-full bg-[#060b18] border border-gray-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="What is this workspace for?"
            className="w-full bg-[#060b18] border border-gray-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all resize-none font-medium"
          />
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-[11px] text-amber-500 font-bold uppercase mb-1">Note</p>
          <p className="text-xs text-amber-200/60 leading-relaxed">
            You will be assigned as <strong>Owner</strong> and can invite members after creation.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating…
            </>
          ) : (
            'Launch Workspace 🚀'
          )}
        </button>
      </form>
    </Modal>
  );
}
