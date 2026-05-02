import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaUserPlus, FaFolderOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';

const WorkspaceSelector = ({ workspaces, onSelect, refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/workspaces/${editing.id}/`, { name, description });
      toast.success('Workspace updated');
    } else {
      await api.post('/workspaces/', { name, description });
      toast.success('Workspace created');
    }
    refresh();
    setShowModal(false);
    setEditing(null);
    setName('');
    setDescription('');
  };

  const del = async (id) => {
    if (window.confirm('Delete this workspace?')) {
      await api.delete(`/workspaces/${id}/`);
      toast.success('Deleted');
      refresh();
    }
  };

  const sendInvite = async (wsId) => {
    if (!inviteEmail) return;
    await api.post(`/workspaces/${wsId}/invite/`, { email: inviteEmail });
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInvite(null);
  };

  const edit = (ws) => {
    setEditing(ws);
    setName(ws.name);
    setDescription(ws.description || '');
    setShowModal(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Your Workspaces</h2>
        <button onClick={() => { setEditing(null); setName(''); setDescription(''); setShowModal(true); }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105">
          <FaPlus /> Create Workspace
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map(ws => (
          <motion.div key={ws.id} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 cursor-pointer" onClick={() => onSelect(ws)}>
              <div className="flex items-center gap-2 mb-2">
                <FaFolderOpen className="text-purple-500 text-xl" />
                <h3 className="text-xl font-semibold dark:text-white">{ws.name}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{ws.description || 'No description'}</p>
              <div className="text-purple-600 text-sm font-medium">Click to open →</div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex justify-end gap-3">
              <button onClick={() => edit(ws)} className="text-blue-500 hover:text-blue-700 transition" title="Edit"><FaEdit /></button>
              <button onClick={() => del(ws.id)} className="text-red-500 hover:text-red-700 transition" title="Delete"><FaTrash /></button>
              <button onClick={() => setShowInvite(ws.id)} className="text-green-500 hover:text-green-700 transition" title="Invite"><FaUserPlus /></button>
            </div>
            {showInvite === ws.id && (
              <div className="px-5 pb-4 flex gap-2">
                <input type="email" placeholder="Email address" className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-700" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <button onClick={() => sendInvite(ws.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Send</button>
                <button onClick={() => setShowInvite(null)} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Cancel</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{editing ? 'Edit Workspace' : 'Create Workspace'}</h3>
            <form onSubmit={submit}>
              <input type="text" placeholder="Name" className="w-full border rounded p-2 mb-3 dark:bg-gray-700" value={name} onChange={e => setName(e.target.value)} required />
              <textarea placeholder="Description" className="w-full border rounded p-2 mb-4 dark:bg-gray-700" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded dark:border-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkspaceSelector;
