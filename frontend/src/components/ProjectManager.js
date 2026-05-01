import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const ProjectManager = ({ workspaceId }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    const res = await api.get(`/projects/?workspace=${workspaceId}`);
    setProjects(res.data);
  };
  useEffect(() => { if (workspaceId) fetchProjects(); }, [workspaceId]);

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/projects/${editing.id}/`, { name, description });
      toast.success('Project updated');
    } else {
      await api.post('/projects/', { name, description, workspace: workspaceId });
      toast.success('Project created');
    }
    fetchProjects();
    setShowModal(false);
    setEditing(null);
    setName('');
    setDescription('');
  };
  const del = async (id) => {
    if (window.confirm('Delete project?')) {
      await api.delete(`/projects/${id}/`);
      toast.success('Deleted');
      fetchProjects();
    }
  };
  return (
    <div><div className="flex justify-between mb-4"><h2 className="text-2xl font-bold">Projects</h2><button onClick={() => { setEditing(null); setName(''); setDescription(''); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaPlus /> New Project</button></div>
      <div className="grid md:grid-cols-2 gap-4">{projects.map(p => (<div key={p.id} className="bg-white p-4 rounded shadow"><h3 className="text-xl font-semibold">{p.name}</h3><p className="text-gray-600">{p.description}</p><div className="flex gap-2 mt-2"><button onClick={() => { setEditing(p); setName(p.name); setDescription(p.description||''); setShowModal(true); }} className="text-blue-600"><FaEdit /></button><button onClick={() => del(p.id)} className="text-red-600"><FaTrash /></button></div></div>))}</div>
      {showModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-6 rounded w-96"><h3 className="text-xl font-bold mb-4">{editing ? 'Edit Project' : 'Create Project'}</h3><form onSubmit={submit}><input type="text" placeholder="Name" className="w-full border p-2 mb-2 rounded" value={name} onChange={e => setName(e.target.value)} required /><textarea placeholder="Description" className="w-full border p-2 mb-4 rounded" value={description} onChange={e => setDescription(e.target.value)} /><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? 'Update' : 'Create'}</button></div></form></div></div>)}
    </div>
  );
};
export default ProjectManager;
