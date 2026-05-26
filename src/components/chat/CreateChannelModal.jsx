import { useState } from 'react';
import Modal from '../common/Modal';
import { chat } from '../../services/api';
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import { Hash, Lock } from 'lucide-react';

export default function CreateChannelModal({ isOpen, onClose, onCreated }) {
  const { activeWorkspace } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', privacy: 'public', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Channel name is required');
    if (!activeWorkspace) return toast.error('No active workspace selected');

    setLoading(true);
    try {
      const res = await chat.createChannel({
        name: form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        // Backend model supports: 'private', 'group', 'workspace'
        // 'public' channels map to room_type 'group'
        room_type: form.privacy === 'private' ? 'private' : 'group',
        workspace: activeWorkspace.id,
      });
      toast.success('Channel created! 🚀');
      if (typeof onCreated === 'function') onCreated(res.data);
      setForm({ name: '', privacy: 'public', description: '' });
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.room_type?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        (err.response?.status === 400 ? 'Validation error — check channel name.' : null) ||
        (err.response?.status === 403 ? 'You don't have permission to create channels here.' : null) ||
        'Failed to create channel.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Channel">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Channel Name */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            Channel Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              {form.privacy === 'private' ? <Lock size={16} /> : <Hash size={16} />}
            </div>
            <input
              type="text"
              autoFocus
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. engineering"
              className="w-full bg-[#060b18] border border-gray-800 rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <p className="mt-2 text-[11px] text-gray-500 font-medium">
            Lowercase, no spaces — e.g. <span className="text-gray-400">marketing-team</span>
          </p>
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Privacy</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, privacy: 'public' })}
              className={`p-4 rounded-2xl border transition-all text-left ${
                form.privacy === 'public'
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                  : 'bg-[#060b18] border-gray-800 text-gray-500 hover:border-gray-700'
              }`}
            >
              <Hash size={20} className="mb-2" />
              <p className="text-sm font-bold">Public</p>
              <p className="text-[10px] opacity-70">Anyone in the workspace</p>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, privacy: 'private' })}
              className={`p-4 rounded-2xl border transition-all text-left ${
                form.privacy === 'private'
                  ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                  : 'bg-[#060b18] border-gray-800 text-gray-500 hover:border-gray-700'
              }`}
            >
              <Lock size={20} className="mb-2" />
              <p className="text-sm font-bold">Private</p>
              <p className="text-[10px] opacity-70">Only invited members</p>
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            Description <span className="text-gray-600">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="What's this channel about?"
            className="w-full bg-[#060b18] border border-gray-800 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all resize-none font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating…
            </>
          ) : (
            'Create Channel 🚀'
          )}
        </button>
      </form>
    </Modal>
  );
}
