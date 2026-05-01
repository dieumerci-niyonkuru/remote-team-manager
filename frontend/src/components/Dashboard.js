import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Chat from './Chat';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (activeTab === 'teams') {
      api.get('/workspaces/').then(res => setTeams(res.data)).catch(console.error);
    }
    if (activeTab === 'tasks') {
      api.get('/tasks/').then(res => setTasks(res.data)).catch(console.error);
    }
  }, [activeTab]);

  const tabs = ['home', 'teams', 'tasks', 'chat', 'hr', 'ai'];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">🚀 Remote Team Manager</div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">👋 {user?.first_name || user?.username}</span>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg">Logout</button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 bg-white border-b px-6 py-3">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full transition ${activeTab === tab ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {tab === 'home' && '🏠 Home'}
            {tab === 'teams' && '👥 Teams'}
            {tab === 'tasks' && '✅ Tasks'}
            {tab === 'chat' && '💬 Chat'}
            {tab === 'hr' && '📄 HR'}
            {tab === 'ai' && '🤖 AI'}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'home' && (
          <div className="text-center bg-white rounded-2xl shadow p-8">
            <h1 className="text-3xl font-bold">Welcome back, {user?.first_name || user?.username}!</h1>
            <p className="text-gray-500 mt-2">Your remote team workspace – everything in one place.</p>
          </div>
        )}
        {activeTab === 'teams' && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">Workspaces</h2>
            {teams.length === 0 ? <p>No workspaces yet.</p> : <ul>{teams.map(t => <li key={t.id}>{t.name}</li>)}</ul>}
          </div>
        )}
        {activeTab === 'tasks' && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            {tasks.length === 0 ? <p>No tasks assigned.</p> : <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>}
          </div>
        )}
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'hr' && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">HR Management</h2>
            <p>Employee profiles, payroll, job postings – coming soon.</p>
          </div>
        )}
        {activeTab === 'ai' && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">🤖 AI Assistant</h2>
            <p>Smart task suggestions, summaries, and natural language Q&A – coming soon.</p>
          </div>
        )}
      </div>

      <footer className="bg-gray-800 text-white text-center py-4 mt-8">
        <p>&copy; 2025 Remote Team Manager. Built with Django + React. Empowering remote teams worldwide.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
