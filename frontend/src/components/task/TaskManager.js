import React, { useState, useEffect } from 'react';
import api from '../../api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaUpload, FaFile, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TaskManager = ({ workspaceId }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      api.get(`/projects/?workspace=${workspaceId}`).then(res => setProjects(res.data));
      api.get('/users/').then(res => setUsers(res.data));
    }
  }, [workspaceId]);

  useEffect(() => {
    if (selectedProject) {
      api.get(`/tasks/?project=${selectedProject.id}`).then(res => setTasks(res.data));
    }
  }, [selectedProject]);

  const addTask = async () => {
    if (!newTitle) return;
    await api.post('/tasks/', { title: newTitle, project: selectedProject.id, due_date: dueDate, priority, assignee: assigneeId || null });
    setNewTitle('');
    setDueDate(null);
    setPriority('medium');
    setAssigneeId('');
    const res = await api.get(`/tasks/?project=${selectedProject.id}`);
    setTasks(res.data);
    toast.success('Task created');
  };

  const updateProgress = async (taskId, progress) => {
    await api.patch(`/tasks/${taskId}/`, { progress });
    const res = await api.get(`/tasks/?project=${selectedProject.id}`);
    setTasks(res.data);
  };

  const uploadFile = async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task', taskId);
    setUploading(true);
    await api.post('/task-files/', formData);
    setUploading(false);
    toast.success('File uploaded');
    const res = await api.get(`/tasks/?project=${selectedProject.id}`);
    setTasks(res.data);
  };

  return (
    <div>
      <select onChange={e => setSelectedProject(projects.find(p => p.id === parseInt(e.target.value)))} className="border p-2 rounded mb-4">
        <option value="">Select Project</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {selectedProject && (
        <div>
          <div className="bg-white p-4 rounded shadow mb-4">
            <input type="text" className="border p-2 w-full mb-2" placeholder="Task title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <div className="flex gap-2 mb-2">
              <DatePicker selected={dueDate} onChange={date => setDueDate(date)} className="border p-2 rounded" placeholderText="Due date" />
              <select className="border p-2 rounded" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <select className="border p-2 rounded" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
            <button onClick={addTask} className="bg-green-600 text-white px-4 py-2 rounded">Add Task</button>
          </div>
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between">
                  <h4 className="font-bold">{task.title}</h4>
                  <span className="text-sm text-gray-500">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span>Progress:</span>
                    <input type="range" min="0" max="100" value={task.progress || 0} onChange={e => updateProgress(task.id, e.target.value)} className="flex-1" />
                    <span>{task.progress || 0}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="cursor-pointer text-blue-600"><FaUpload className="inline mr-1" /> Upload file
                    <input type="file" className="hidden" onChange={e => uploadFile(task.id, e.target.files[0])} disabled={uploading} />
                  </label>
                  {task.files && task.files.map(f => (
                    <div key={f.id} className="text-sm flex items-center gap-2 mt-1"><FaFile /> {f.filename}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default TaskManager;
