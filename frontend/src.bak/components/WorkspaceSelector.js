import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaUserPlus } from 'react-icons/fa';

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
    <div>
      <div className="flex justify-between mb-4"><h2 className="text-2xl font-bold">Your Workspaces</h2><button onClick={() => { setEditing(null); setName(''); setDescription(''); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaPlus /> New Workspace</button></div>
      <div className="grid gap-4">
        {workspaces.map(ws => (
          <div key={ws.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div className="cursor-pointer" onClick={() => onSelect(ws)}><h3 className="text-xl font-semibold">{ws.name}</h3><p className="text-gray-600">{ws.description}</p></div>
            <div className="flex gap-2"><button onClick={() => edit(ws)} className="text-blue-600"><FaEdit /></button><button onClick={() => del(ws.id)} className="text-red-600"><FaTrash /></button><button onClick={() => setShowInvite(ws.id)} className="text-green-600"><FaUserPlus /></button></div>
            {showInvite === ws.id && <div className="absolute bg-white p-4 shadow rounded z-10"><input type="email" placeholder="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="border p-1 mr-2" /><button onClick={() => sendInvite(ws.id)} className="bg-green-600 text-white px-2 py-1 rounded">Send</button><button onClick={() => setShowInvite(null)} className="ml-2">Cancel</button></div>}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-6 rounded w-96"><h3 className="text-xl font-bold mb-4">{editing ? 'Edit Workspace' : 'Create Workspace'}</h3><form onSubmit={submit}><input type="text" placeholder="Name" className="w-full border p-2 mb-2 rounded" value={name} onChange={e => setName(e.target.value)} required /><textarea placeholder="Description" className="w-full border p-2 mb-4 rounded" value={description} onChange={e => setDescription(e.target.value)} /><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? 'Update' : 'Create'}</button></div></form></div></div>
      )}
    </div>
  );
};
export default WorkspaceSelector;
