import React from 'react';
import { Link } from 'react-router-dom';
const TaskManagement = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center">
    <img src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=500&fit=crop" alt="Task Management" className="rounded-xl shadow-lg mb-6 w-full" />
    <h1 className="text-3xl font-bold mb-4 dark:text-white">Task Management</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Organize tasks with Kanban boards, set deadlines, assign subtasks, and track progress in real time.</p>
    <Link to="/features" className="text-purple-600 hover:underline">← Back to Features</Link>
  </div>
);
export default TaskManagement;
