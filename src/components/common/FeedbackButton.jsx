import { useState } from 'react';
import { MessageSquare, Send, X, Star } from 'lucide-react';
import { useStore } from '../../store';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FeedbackButton() {
  const { isAuth, user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'improvement', subject: '', message: '' });

  if (!isAuth) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return toast.error('Please fill all fields');
    
    setLoading(true);
    try {
      await api.post('/feedback/', form);
      toast.success('Thank you for your feedback! 🚀');
      setForm({ type: 'improvement', subject: '', message: '' });
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-24 z-[100] w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-blue-700 transition-all group"
      >
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0b1429] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={18} />
                Share Feedback
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                <select 
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="improvement">Improvement</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject</label>
                <input 
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  placeholder="What's on your mind?"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                <textarea 
                  rows="4"
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="Tell us more details..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Send size={18} />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
