import React, { useState } from 'react';
import api from '../../api';

const WorkspaceManager = ({ workspaces, onSelect, refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createWorkspace = async (e) => {
    e.preventDefault();
    await api.post('/workspaces/', { name, description });
    refresh();
    setShowModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Workspaces</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">+ New Workspace</button>
      </div>
      <div className="grid gap-4">
        {workspaces.map(ws => (
          <div key={ws.id} className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer" onClick={() => onSelect(ws)}>
            <h3 className="text-xl font-semibold">{ws.name}</h3>
            <p className="text-gray-600">{ws.description}</p>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-xl font-bold mb-4">Create Workspace</h3>
            <form onSubmit={createWorkspace}>
              <input type="text" placeholder="Name" className="w-full border p-2 mb-2 rounded" value={name} onChange={e => setName(e.target.value)} required />
              <textarea placeholder="Description" className="w-full border p-2 mb-4 rounded" value={description} onChange={e => setDescription(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManager;
