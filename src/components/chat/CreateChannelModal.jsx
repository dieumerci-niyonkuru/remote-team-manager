import { useState } from 'react';
import Modal from '../common/Modal';
import { chat } from '../../services/api';
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import { Hash, Lock, Users } from 'lucide-react';

export default function CreateChannelModal({ isOpen, onClose, onCreated }) {
  const { activeWorkspace } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'public', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Channel name is required');
    if (!activeWorkspace) return toast.error('No active workspace selected');

    setLoading(true);
    try {
      const res = await chat.createChannel({
        ...form,
        workspace: activeWorkspace.id,
        name: form.name.toLowerCase().replace(/\s+/g, '-')
      });
      toast.success('Channel created successfully! 🚀');
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error('Failed to create channel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Channel">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Channel Name</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              {form.type === 'public' ? <Hash size={18} /> : <Lock size={18} />}
            </div>
            <input 
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. engineering"
              className="w-full bg-[#060b18] border border-gray-800 rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <p className="mt-2 text-[11px] text-gray-500 font-medium">Lowercase, no spaces, e.g. marketing-team</p>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Privacy</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setForm({...form, type: 'public'})}
              className={`p-4 rounded-2xl border transition-all text-left ${form.type === 'public' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-[#060b18] border-gray-800 text-gray-500 hover:border-gray-700'}`}
            >
              <Hash size={20} className="mb-2" />
              <p className="text-sm font-bold">Public</p>
              <p className="text-[10px] opacity-70">Anyone in workspace can join</p>
            </button>
            <button 
              type="button"
              onClick={() => setForm({...form, type: 'private'})}
              className={`p-4 rounded-2xl border transition-all text-left ${form.type === 'private' ? 'bg-purple-600/10 border-purple-500 text-purple-500' : 'bg-[#060b18] border-gray-800 text-gray-500 hover:border-gray-700'}`}
            >
              <Lock size={20} className="mb-2" />
              <p className="text-sm font-bold">Private</p>
              <p className="text-[10px] opacity-70">Only invited members</p>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Description (Optional)</label>
          <textarea 
            rows="3"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="What's this channel about?"
            className="w-full bg-[#060b18] border border-gray-800 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all resize-none font-medium"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Channel'}
        </button>
      </form>
    </Modal>
  );
}
