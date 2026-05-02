import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const TimeTracking = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  let interval;

  useEffect(() => {
    api.get('/tasks/').then(res => setTasks(res.data));
    return () => clearInterval(interval);
  }, []);

  const startTimer = (task) => {
    if (activeTask) toast.error('Stop current timer first');
    else {
      setActiveTask(task);
      setElapsed(0);
      interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
      toast.success(`Timer started for "${task.title}"`);
    }
  };

  const stopTimer = () => {
    clearInterval(interval);
    toast.success(`Logged ${Math.floor(elapsed / 60)}m ${elapsed % 60}s for "${activeTask.title}"`);
    setActiveTask(null);
    setElapsed(0);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const secsRem = secs % 60;
    return `${mins}m ${secsRem}s`;
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Time Tracking</h2>
      {activeTask && (
        <div className="mb-4 p-2 bg-blue-100 rounded flex justify-between items-center">
          <span>Tracking: {activeTask.title} – {formatTime(elapsed)}</span>
          <button onClick={stopTimer} className="bg-red-500 text-white px-3 py-1 rounded">Stop</button>
        </div>
      )}
      <div className="grid gap-3">
        {tasks.map(t => (
          <div key={t.id} className="border p-3 rounded flex justify-between items-center">
            <div><span className="font-semibold">{t.title}</span> {t.due_date && <span className="text-sm text-gray-500 ml-2">Due {new Date(t.due_date).toLocaleDateString()}</span>}</div>
            <button onClick={() => startTimer(t)} className="bg-green-600 text-white px-3 py-1 rounded">Start Timer</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TimeTracking;
