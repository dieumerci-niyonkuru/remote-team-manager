import React, { useState } from 'react';
import api from '../../api';

const InviteModal = ({ workspaceId, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const submit = async () => {
    await api.post(`/workspaces/${workspaceId}/invite/`, { email, role });
    onInvite();
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h3 className="text-xl font-bold mb-4">Invite Member</h3>
        <input type="email" placeholder="Email" className="w-full border p-2 mb-2 rounded" value={email} onChange={e => setEmail(e.target.value)} />
        <select className="w-full border p-2 mb-4 rounded" value={role} onChange={e => setRole(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="developer">Developer</option>
          <option value="manager">Manager</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={submit} className="px-4 py-2 bg-green-600 text-white rounded">Invite</button>
        </div>
      </div>
    </div>
  );
};
export default InviteModal;
