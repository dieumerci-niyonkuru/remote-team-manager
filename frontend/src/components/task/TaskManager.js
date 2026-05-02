import React, { useState, useEffect } from 'react';
import api from '../../api';

const TaskManager = ({ workspaceId }) => {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    if (workspaceId) api.get('/tasks/').then(res => setTasks(res.data));
  }, [workspaceId]);
  return <div><h2 className="text-2xl font-bold mb-4">Tasks</h2>{tasks.length === 0 ? <p>No tasks yet.</p> : <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>}</div>;
};
export default TaskManager;
