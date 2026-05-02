import React, { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaFileUpload } from 'react-icons/fa';

const Tasks = ({ workspace }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (workspace) {
      api.get(`/projects/?workspace=${workspace.id}`).then(res => setProjects(res.data));
    }
  }, [workspace]);

  useEffect(() => {
    if (selectedProject) {
      api.get(`/tasks/?project=${selectedProject.id}`).then(res => setTasks(res.data));
    }
  }, [selectedProject]);

  const addTask = async () => {
    if (!title.trim()) return;
    await api.post('/tasks/', { title, description, project: selectedProject.id });
    toast.success('Task added');
    setTitle('');
    setDescription('');
    const res = await api.get(`/tasks/?project=${selectedProject.id}`);
    setTasks(res.data);
  };

  const deleteTask = async (id) => {
    if (window.confirm('Delete task?')) {
      await api.delete(`/tasks/${id}/`);
      toast.success('Deleted');
      const res = await api.get(`/tasks/?project=${selectedProject.id}`);
      setTasks(res.data);
    }
  };

  const uploadFile = async (taskId, file) => {
    const formData = new FormData();
    formData.append('content_type', 'task');
    formData.append('object_id', taskId);
    formData.append('file', file);
    await api.post('/file-attachments/', formData);
    toast.success('File attached');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      {!workspace && <p className="text-gray-500">Select a workspace first.</p>}
      {workspace && (
        <>
          <select className="border rounded p-2 mb-4" onChange={e => setSelectedProject(projects.find(p => p.id === parseInt(e.target.value)))}>
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {selectedProject && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 mb-6">
              <input type="text" placeholder="Task title" className="w-full border rounded p-2 mb-2" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea placeholder="Description (use @username to mention)" className="w-full border rounded p-2 mb-2" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              <button onClick={addTask} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaPlus /> Add Task</button>
            </div>
          )}
          <div className="space-y-4">
            {tasks.map(t => (
              <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-xl font-bold">{t.title}</h3><p className="text-gray-500">{t.description}</p></div>
                  <div className="flex gap-2">
                    <label className="cursor-pointer text-green-500"><FaFileUpload /><input type="file" className="hidden" onChange={e => uploadFile(t.id, e.target.files[0])} /></label>
                    <button onClick={() => deleteTask(t.id)} className="text-red-500"><FaTrash /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default Tasks;
