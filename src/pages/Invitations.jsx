import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Mail, Check, X, Clock, Shield, UserPlus, Globe, Copy } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Invitations() {
  const { user, activeWorkspace } = useStore();
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const [received, sent] = await Promise.all([
        api.get('/invites/received/'),
        activeWorkspace ? api.get(`/invites/sent/?workspace=${activeWorkspace.id}`) : Promise.resolve({ data: [] })
      ]);
      setReceivedInvites(received.data);
      setSentInvites(sent.data);
    } catch (err) {
      console.error('Failed to fetch invites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/invites/${id}/${action}/`);
      toast.success(`Invitation ${action}ed`);
      fetchInvites();
    } catch (err) {
      toast.error(`Failed to ${action} invitation`);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
          <Mail size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Invitations Hub</h1>
          <p className="text-gray-400">Manage your workspace access and team requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Pending Requests for YOU */}
        {receivedInvites.length > 0 && (
          <section>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserPlus size={14} />
              Received Invitations
            </h2>
            <div className="space-y-3">
              {receivedInvites.map(invite => (
                <div key={invite.id} className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 flex items-center justify-between hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-black">
                      {invite.workspace_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{invite.workspace_name}</p>
                      <p className="text-xs text-gray-400 font-medium">Invited by <span className="text-blue-500 font-bold">{invite.invited_by_name}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleAction(invite.id, 'accept')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      <Check size={18} />
                      Accept
                    </button>
                    <button 
                      onClick={() => handleAction(invite.id, 'reject')}
                      className="bg-gray-800 hover:bg-red-600/20 hover:text-red-500 text-gray-400 px-4 py-2.5 rounded-xl font-bold transition-all border border-gray-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sent Invitations (If Admin) */}
        {activeWorkspace && (
          <section>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe size={14} />
              Active Workspace Invites ({activeWorkspace.name})
            </h2>
            <div className="bg-gray-800/20 border border-gray-800 rounded-[32px] overflow-hidden">
               <div className="divide-y divide-gray-800/50">
                 {sentInvites.map(invite => (
                   <div key={invite.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{invite.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black uppercase text-gray-500 px-2 py-0.5 rounded bg-gray-800 border border-gray-700">{invite.role}</span>
                             <span className="text-[10px] text-gray-600 font-bold">• {new Date(invite.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        {invite.accepted ? (
                           <div className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase flex items-center gap-2">
                              <Check size={12} />
                              Joined
                           </div>
                        ) : (
                           <div className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase flex items-center gap-2">
                              <Clock size={12} />
                              Pending
                           </div>
                        )}
                        <button className="p-2 hover:bg-red-600/10 text-gray-600 hover:text-red-500 rounded-xl transition-all">
                           <X size={18} />
                        </button>
                     </div>
                   </div>
                 ))}
                 {sentInvites.length === 0 && (
                   <div className="p-12 text-center">
                     <p className="text-sm text-gray-500 font-bold">No active invitations for this workspace.</p>
                   </div>
                 )}
               </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
