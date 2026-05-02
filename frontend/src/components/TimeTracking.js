import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const TimeTracking = () => {
  const [activeTask, setActiveTask] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [tasks, setTasks] = useState([]);
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
      toast.success(`Started timer for "${task.title}"`);
    }
  };
  const stopTimer = () => {
    clearInterval(interval);
    toast.success(`Logged ${Math.floor(elapsed / 60)}m ${elapsed % 60}s for "${activeTask.title}"`);
    setActiveTask(null);
    setElapsed(0);
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Time Tracking</h2>
      {activeTask && <div className="mb-4 p-2 bg-purple-100 rounded">Tracking: {activeTask.title} – {Math.floor(elapsed / 60)}m {elapsed % 60}s <button onClick={stopTimer} className="ml-4 bg-red-500 text-white px-2 py-1 rounded">Stop</button></div>}
      <ul className="space-y-2">
        {tasks.map(t => <li key={t.id} className="flex justify-between items-center border-b py-2"><span>{t.title}</span><button onClick={() => startTimer(t)} className="bg-green-600 text-white px-3 py-1 rounded">Start Timer</button></li>)}
      </ul>
    </div>
  );
};
export default TimeTracking;
