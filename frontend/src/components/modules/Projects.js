import React, { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaFileUpload } from 'react-icons/fa';

const Projects = ({ workspace }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    if (!workspace) return;
    const res = await api.get(`/projects/?workspace=${workspace.id}`);
    setProjects(res.data);
  };
  useEffect(() => { fetchProjects(); }, [workspace]);

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/projects/${editing.id}/`, { name, description });
      toast.success('Project updated');
    } else {
      await api.post('/projects/', { name, description, workspace: workspace.id });
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

  const uploadFile = async (projectId, file) => {
    const formData = new FormData();
    formData.append('content_type', 'project');
    formData.append('object_id', projectId);
    formData.append('file', file);
    await api.post('/file-attachments/', formData);
    toast.success('File uploaded');
    fetchProjects();
  };

  return (
    <div>
      <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Projects</h2>{workspace && <button onClick={() => { setEditing(null); setName(''); setDescription(''); setShowModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaPlus /> New Project</button>}</div>
      {!workspace && <p className="text-gray-500">Select a workspace first.</p>}
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map(p => (
          <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex justify-between">
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(p); setName(p.name); setDescription(p.description || ''); setShowModal(true); }} className="text-blue-500"><FaEdit /></button>
                <button onClick={() => del(p.id)} className="text-red-500"><FaTrash /></button>
                <label className="cursor-pointer text-green-500"><FaFileUpload /><input type="file" className="hidden" onChange={e => uploadFile(p.id, e.target.files[0])} /></label>
              </div>
            </div>
            <p className="text-gray-500 mt-2">{p.description}</p>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Project' : 'Create Project'}</h3>
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
export default Projects;
