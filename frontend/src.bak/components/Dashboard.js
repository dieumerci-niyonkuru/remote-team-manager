import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WorkspaceSelector from './WorkspaceSelector';
import ProjectManager from './ProjectManager';
import TaskManager from './task/TaskManager';
import Chat from './chat/Chat';
import ProfileEditor from './ProfileEditor';
import MemberSearch from './MemberSearch';
import { FaHome, FaUsers, FaTasks, FaComments, FaUserTie, FaUserEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    api.get('/workspaces/').then(res => setWorkspaces(res.data)).catch(console.error);
  }, []);

  const selectWorkspace = (ws) => {
    setWorkspace(ws);
    toast.success(`Switched to ${ws.name}`);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="p-4 text-xl font-bold border-b">RTM</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'home' ? 'bg-purple-100 dark:bg-purple-900' : ''}`}><FaHome /> Home</button>
          <button onClick={() => setActiveTab('workspaces')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'workspaces' ? 'bg-purple-100 dark:bg-purple-900' : ''}`}><FaUsers /> Workspaces</button>
          <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'projects' ? 'bg-purple-100 dark:bg-purple-900' : ''}`}><FaTasks /> Projects</button>
          <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'tasks' ? 'bg-purple-100 dark:bg-purple-900' : ''}`}><FaTasks /> Tasks</button>
          <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${activeTab === 'chat' ? 'bg-purple-100 dark:bg-purple-900' : ''}`}><FaComments /> Chat</button>
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><FaUserEdit /> Profile</button>
          <button onClick={logout} className="w-full bg-red-600 text-white p-2 rounded mt-4">Logout</button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold capitalize">{activeTab} {workspace && `- ${workspace.name}`}</h1>
          <div><MemberSearch /></div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'home' && <HomePage workspaces={workspaces} onSelect={selectWorkspace} refresh={() => api.get('/workspaces/').then(res => setWorkspaces(res.data))} />}
          {activeTab === 'workspaces' && <WorkspaceSelector workspaces={workspaces} onSelect={selectWorkspace} refresh={() => api.get('/workspaces/').then(res => setWorkspaces(res.data))} />}
          {activeTab === 'projects' && workspace && <ProjectManager workspaceId={workspace.id} />}
          {activeTab === 'tasks' && workspace && <TaskManager workspaceId={workspace.id} />}
          {activeTab === 'chat' && workspace && <Chat workspaceId={workspace.id} />}
        </main>
      </div>
      {showProfile && <ProfileEditor onClose={() => setShowProfile(false)} />}
    </div>
  );
};

const HomePage = ({ workspaces, onSelect, refresh }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Your Workspaces</h2>
      <button onClick={() => { refresh(); }} className="bg-purple-600 text-white px-4 py-2 rounded">+ Create Workspace</button>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      {workspaces.map(ws => (
        <div key={ws.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition" onClick={() => onSelect(ws)}>
          <h3 className="text-xl font-bold mb-2">{ws.name}</h3>
          <p className="text-gray-600 dark:text-gray-300">{ws.description || 'No description'}</p>
          <div className="mt-4 text-sm text-purple-600">Click to open →</div>
        </div>
      ))}
    </div>
  </div>
);
export default Dashboard;
