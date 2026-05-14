import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Mail, Check, X, Briefcase, Clock, Shield } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await api.get('/invitations/');
      setInvitations(res.data);
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.post(`/invitations/${id}/accept/`);
      toast.success('Joined workspace successfully!');
      fetchInvitations();
      // Optionally refresh workspaces in store
    } catch (err) {
      toast.error('Failed to accept invitation');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.delete(`/invitations/${id}/`);
      toast.success('Invitation declined');
      fetchInvitations();
    } catch (err) {
      toast.error('Failed to reject invitation');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Mail className="text-blue-500" size={32} />
          Invitations
        </h1>
        <p className="text-gray-400 mt-1 font-medium">Manage requests to join workspaces and teams.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : invitations.length === 0 ? (
        <div className="bg-gray-800/30 border border-dashed border-gray-700 rounded-3xl p-16 text-center">
           <Mail className="text-gray-600 mx-auto mb-4" size={48} />
           <h3 className="text-xl font-bold text-white mb-2">No pending invitations</h3>
           <p className="text-gray-500 text-sm">When someone invites you to a workspace, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map(invite => (
            <div key={invite.id} className="bg-gray-800/40 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-700 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                     <Briefcase size={24} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white">Join <span className="text-blue-400">{invite.workspace_name}</span></h3>
                     <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        Invited by <span className="text-gray-300 font-bold">{invite.invited_by_name}</span> • 
                        <Shield size={12} className="text-purple-500" />
                        Role: {invite.role}
                     </p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-[10px] font-bold text-gray-500 mr-4">
                     <Clock size={12} />
                     Expires: {new Date(invite.expires_at).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => handleAccept(invite.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                     <Check size={18} />
                     Accept
                  </button>
                  <button 
                    onClick={() => handleReject(invite.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600/20 hover:text-red-500 text-gray-400 px-5 py-2.5 rounded-xl font-bold transition-all border border-gray-700 hover:border-red-500/50"
                  >
                     <X size={18} />
                     Decline
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
