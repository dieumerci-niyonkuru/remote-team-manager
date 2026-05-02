import React, { useState, useEffect } from 'react';
import api from '../../api';
import MentionInput from '../common/MentionInput';

const TaskManager = ({ workspaceId }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [mention, setMention] = useState('');

  useEffect(() => {
    if (workspaceId) {
      api.get(`/projects/?workspace=${workspaceId}`).then(res => setProjects(res.data));
    }
  }, [workspaceId]);

  useEffect(() => {
    if (selectedProject) {
      api.get(`/tasks/?project=${selectedProject.id}`).then(res => setTasks(res.data));
    }
  }, [selectedProject]);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    await api.post('/tasks/', { title: newTaskTitle, description: mention, project: selectedProject.id });
    setNewTaskTitle('');
    setMention('');
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
            <input type="text" className="border p-2 w-full mb-2" placeholder="Task title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
            <MentionInput value={mention} onChange={setMention} placeholder="Task description (mention @username)" />
            <button onClick={addTask} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Add Task</button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-3 rounded shadow">
                <h4 className="font-bold">{task.title}</h4>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="text-xs text-gray-400 mt-1">Assigned to: {task.assignee?.username || 'unassigned'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
