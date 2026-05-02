import React, { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { FaPlay, FaPause, FaStopwatch, FaClock, FaCheck, FaSpinner, FaComment, FaThumbsUp, FaLightbulb, FaTrash, FaFileUpload } from 'react-icons/fa';

const Tasks = ({ workspace }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeLogs, setTimeLogs] = useState({});

  useEffect(() => {
    if (workspace) {
      api.get(`/projects/?workspace=${workspace.id}`).then(res => setProjects(res.data));
    }
  }, [workspace]);

  useEffect(() => {
    if (selectedProject) {
      api.get(`/tasks/?project=${selectedProject.id}`).then(res => setTasks(res.data));
      api.get('/timetracking/logs/').then(res => {
        const logs = {};
        res.data.forEach(log => { logs[log.task_id] = (logs[log.task_id] || 0) + log.duration_seconds; });
        setTimeLogs(logs);
      });
    }
  }, [selectedProject]);

  const addTask = async () => {
    if (!title.trim() || !selectedProject) return;
    await api.post('/tasks/', { title, description, project: selectedProject.id, estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null });
    toast.success('Task added');
    setTitle('');
    setDescription('');
    setEstimatedMinutes('');
    const res = await api.get(`/tasks/?project=${selectedProject.id}`);
    setTasks(res.data);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    await api.patch(`/tasks/${taskId}/`, { status: newStatus });
    toast.success(`Task marked as ${newStatus}`);
    const res = await api.get(`/tasks/?project=${selectedProject.id}`);
    setTasks(res.data);
    if (newStatus === 'done') {
      toast.success('Task completed! Notification sent.');
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Delete task?')) {
      await api.delete(`/tasks/${taskId}/`);
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
    toast.success('File uploaded');
  };

  const startTimer = async (taskId) => {
    try {
      await api.post('/timetracking/start/', { task_id: taskId });
      setActiveTimer(taskId);
      toast.success('Timer started');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start timer');
    }
  };

  const pauseTimer = async (taskId) => {
    await api.post('/timetracking/pause/', { task_id: taskId });
    setActiveTimer(null);
    toast.success('Timer paused');
    // refresh time logs
    const res = await api.get('/timetracking/logs/');
    const logs = {};
    res.data.forEach(log => { logs[log.task_id] = (logs[log.task_id] || 0) + log.duration_seconds; });
    setTimeLogs(logs);
  };

  const addComment = async (taskId) => {
    const comment = prompt('Enter your comment:');
    if (comment) await api.post('/comments/', { task: taskId, content: comment });
    toast.success('Comment added');
  };

  const addSuggestion = async (taskId) => {
    const suggestion = prompt('Enter your suggestion:');
    if (suggestion) await api.post('/suggestions/', { task: taskId, content: suggestion });
    toast.success('Suggestion added');
  };

  const likeTask = async (taskId) => {
    await api.post('/reactions/', { task: taskId, emoji: '👍' });
    toast.success('Liked');
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0h';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-4">
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
              <textarea placeholder="Description" className="w-full border rounded p-2 mb-2" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              <input type="number" placeholder="Estimated minutes" className="w-full border rounded p-2 mb-2" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} />
              <button onClick={addTask} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaStopwatch /> Add Task</button>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {tasks.map(task => {
              const spent = timeLogs[task.id] || 0;
              const estimate = task.estimated_minutes ? task.estimated_minutes * 60 : 0;
              const percent = estimate ? Math.min(100, (spent / estimate) * 100) : 0;
              return (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  <div className="flex justify-between items-start">
                    <div><h3 className="text-xl font-bold">{task.title}</h3><p className="text-gray-500">{task.description}</p></div>
                    <button onClick={() => deleteTask(task.id)} className="text-red-500"><FaTrash /></button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => addComment(task.id)} className="bg-gray-200 dark:bg-gray-700 p-2 rounded"><FaComment /> Comment</button>
                    <button onClick={() => addSuggestion(task.id)} className="bg-gray-200 dark:bg-gray-700 p-2 rounded"><FaLightbulb /> Suggest</button>
                    <button onClick={() => likeTask(task.id)} className="bg-gray-200 dark:bg-gray-700 p-2 rounded"><FaThumbsUp /> Like</button>
                    <button onClick={() => updateTaskStatus(task.id, 'todo')} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">To Do</button>
                    <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">In Progress</button>
                    <button onClick={() => updateTaskStatus(task.id, 'done')} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Done</button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {activeTimer === task.id ? (
                      <button onClick={() => pauseTimer(task.id)} className="bg-orange-500 text-white px-3 py-1 rounded"><FaPause /> Pause</button>
                    ) : (
                      <button onClick={() => startTimer(task.id)} className="bg-green-600 text-white px-3 py-1 rounded"><FaPlay /> Start</button>
                    )}
                    <label className="cursor-pointer bg-purple-600 text-white px-3 py-1 rounded"><FaFileUpload /><input type="file" className="hidden" onChange={e => uploadFile(task.id, e.target.files[0])} /></label>
                    <span className="text-sm">Spent: {formatDuration(spent)}</span>
                    {task.estimated_minutes && <span className="text-sm"> / Est: {task.estimated_minutes} min</span>}
                  </div>
                  {task.estimated_minutes && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
export default Tasks;
