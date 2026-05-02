import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [taskStats, setTaskStats] = useState({ todo: 0, in_progress: 0, done: 0 });
  const [timeData, setTimeData] = useState([]);
  const [taskTimeLabels, setTaskTimeLabels] = useState([]);
  const [taskTimeValues, setTaskTimeValues] = useState([]);

  useEffect(() => {
    // Fetch tasks
    api.get('/tasks/').then(res => {
      const tasks = res.data;
      const todo = tasks.filter(t => t.status === 'todo').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const done = tasks.filter(t => t.status === 'done').length;
      setTaskStats({ todo, in_progress: inProgress, done });
    }).catch(console.error);

    // Fetch time logs
    api.get('/timetracking/logs/').then(res => {
      const logs = res.data;
      const taskMap = {};
      logs.forEach(log => {
        if (!taskMap[log.task_title]) taskMap[log.task_title] = 0;
        taskMap[log.task_title] += log.duration_seconds / 3600; // hours
      });
      setTaskTimeLabels(Object.keys(taskMap));
      setTaskTimeValues(Object.values(taskMap));
    }).catch(console.error);
  }, []);

  const dataBarTaskStatus = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{ label: 'Tasks', data: [taskStats.todo, taskStats.in_progress, taskStats.done], backgroundColor: ['#f97316', '#3b82f6', '#10b981'] }]
  };
  const dataBarTime = {
    labels: taskTimeLabels,
    datasets: [{ label: 'Hours Spent', data: taskTimeValues, backgroundColor: '#8b5cf6' }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><h3 className="font-semibold mb-2">Task Status</h3><Bar data={dataBarTaskStatus} /></div>
        <div><h3 className="font-semibold mb-2">Time per Task (hours)</h3>{taskTimeLabels.length ? <Bar data={dataBarTime} /> : <p>No time logs yet.</p>}</div>
      </div>
    </div>
  );
};
export default Analytics;
