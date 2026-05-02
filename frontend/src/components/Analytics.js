import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [completionRate, setCompletionRate] = useState(0);
  const [taskStats, setTaskStats] = useState({ todo: 0, in_progress: 0, done: 0 });
  const [timeData, setTimeData] = useState([]);

  useEffect(() => {
    api.get('/tasks/').then(res => {
      const tasks = res.data;
      const todo = tasks.filter(t => t.status === 'todo').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const done = tasks.filter(t => t.status === 'done').length;
      setTaskStats({ todo, in_progress: inProgress, done });
      const total = tasks.length;
      setCompletionRate(total ? Math.round((done / total) * 100) : 0);
    });
    // Mock time data – replace with real time tracking API
    setTimeData([5, 8, 12, 9, 15, 18, 22]);
  }, []);

  const dataBar = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{ label: 'Tasks', data: [taskStats.todo, taskStats.in_progress, taskStats.done], backgroundColor: ['#f97316', '#3b82f6', '#10b981'] }]
  };
  const dataLine = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Hours Tracked', data: timeData, borderColor: '#8b5cf6', fill: false }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><h3 className="font-semibold mb-2">Task Status</h3><Bar data={dataBar} /></div>
        <div><h3 className="font-semibold mb-2">Weekly Hours</h3><Line data={dataLine} /></div>
      </div>
      <div className="mt-6 text-center"><p className="text-lg">Task Completion Rate: <strong>{completionRate}%</strong></p></div>
    </div>
  );
};
export default Analytics;
