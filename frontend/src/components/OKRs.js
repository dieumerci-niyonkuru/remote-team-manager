import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const OKRs = ({ workspace }) => {
  const [objectives, setObjectives] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchObjectives = async () => {
    if (!workspace) return;
    const res = await api.get(`/okr/objectives/?workspace=${workspace.id}`);
    setObjectives(res.data);
  };

  useEffect(() => { fetchObjectives(); }, [workspace]);

  const submitObjective = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/okr/objectives/${editing.id}/`, { title, description, workspace: workspace.id });
      toast.success('Objective updated');
    } else {
      await api.post('/okr/objectives/', { title, description, workspace: workspace.id });
      toast.success('Objective created');
    }
    fetchObjectives();
    setShowModal(false);
    setEditing(null);
    setTitle('');
    setDescription('');
  };

  const deleteObjective = async (id) => {
    if (window.confirm('Delete objective?')) {
      await api.delete(`/okr/objectives/${id}/`);
      toast.success('Deleted');
      fetchObjectives();
    }
  };

  const updateKeyResult = async (krId, value) => {
    await api.patch(`/okr/key-results/${krId}/`, { current_value: value });
    fetchObjectives();
  };

  const addKeyResult = async (objectiveId) => {
    const title = prompt('Key result title?');
    if (title) {
      await api.post('/okr/key-results/', { objective: objectiveId, title, target_value: 100 });
      fetchObjectives();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Objectives & Key Results</h2>
        <button onClick={() => { setEditing(null); setTitle(''); setDescription(''); setShowModal(true); }} className="bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-2"><FaPlus /> New Objective</button>
      </div>
      {!workspace && <p>Select a workspace first.</p>}
      {workspace && objectives.map(obj => (
        <div key={obj.id} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start">
            <div><h3 className="text-xl font-bold">{obj.title}</h3><p className="text-gray-500">{obj.description}</p></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(obj); setTitle(obj.title); setDescription(obj.description || ''); setShowModal(true); }} className="text-blue-500"><FaEdit /></button>
              <button onClick={() => deleteObjective(obj.id)} className="text-red-500"><FaTrash /></button>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {obj.key_results && obj.key_results.map(kr => (
              <div key={kr.id} className="flex items-center gap-2">
                <span className="w-1/3">{kr.title}</span>
                <input type="range" min="0" max={kr.target_value} value={kr.current_value} onChange={e => updateKeyResult(kr.id, parseInt(e.target.value))} className="flex-1" />
                <span>{kr.current_value} / {kr.target_value} {kr.unit}</span>
              </div>
            ))}
            <button onClick={() => addKeyResult(obj.id)} className="text-sm text-purple-600">+ Add Key Result</button>
          </div>
        </div>
      ))}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Objective' : 'New Objective'}</h3>
            <form onSubmit={submitObjective}>
              <input type="text" placeholder="Title" className="w-full border rounded p-2 mb-2" value={title} onChange={e => setTitle(e.target.value)} required />
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
export default OKRs;
