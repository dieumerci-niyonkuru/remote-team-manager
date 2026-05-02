import React, { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaUsers } from 'react-icons/fa';

const Workspaces = ({ workspace, setWorkspace }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(null);

  const fetch = async () => {
    const res = await api.get('/workspaces/');
    setWorkspaces(res.data);
  };
  useEffect(() => { fetch(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/workspaces/${editing.id}/`, { name, description });
      toast.success('Workspace updated');
    } else {
      const res = await api.post('/workspaces/', { name, description });
      toast.success('Workspace created');
      setWorkspace(res.data);
    }
    fetch();
    setShowModal(false);
    setEditing(null);
    setName('');
    setDescription('');
  };

  const del = async (id) => {
    if (window.confirm('Delete workspace?')) {
      await api.delete(`/workspaces/${id}/`);
      toast.success('Deleted');
      if (workspace?.id === id) setWorkspace(null);
      fetch();
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
      <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Workspaces</h2><button onClick={() => { setEditing(null); setName(''); setDescription(''); setShowModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaPlus /> New Workspace</button></div>
      <div className="grid md:grid-cols-2 gap-6">
        {workspaces.map(ws => (
          <div key={ws.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex justify-between">
              <div className="cursor-pointer flex-1" onClick={() => setWorkspace(ws)}>
                <h3 className="text-xl font-bold">{ws.name}</h3>
                <p className="text-gray-500 mt-1">{ws.description || 'No description'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(ws)} className="text-blue-500"><FaEdit /></button>
                <button onClick={() => del(ws.id)} className="text-red-500"><FaTrash /></button>
                <button onClick={() => setShowInvite(ws.id)} className="text-green-500"><FaUsers /></button>
              </div>
            </div>
            {showInvite === ws.id && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded flex gap-2">
                <input type="email" placeholder="Email" className="flex-1 p-2 rounded border" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <button onClick={() => sendInvite(ws.id)} className="bg-green-600 text-white px-3 py-1 rounded">Invite</button>
                <button onClick={() => setShowInvite(null)} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Workspace' : 'Create Workspace'}</h3>
            <form onSubmit={submit}>
              <input type="text" placeholder="Name" className="w-full border rounded p-2 mb-3" value={name} onChange={e => setName(e.target.value)} required />
              <textarea placeholder="Description" className="w-full border rounded p-2 mb-4" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Workspaces;
