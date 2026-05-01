import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WorkspaceSelector from './WorkspaceSelector';
import ProjectManager from './ProjectManager';
import TaskManager from './task/TaskManager';
import Chat from './chat/Chat';
import ProfileEditor from './ProfileEditor';
import { FaHome, FaUsers, FaTasks, FaComments, FaUserTie, FaCog, FaUserEdit } from 'react-icons/fa';
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">RTM</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-800 ${activeTab === 'home' ? 'bg-gray-800' : ''}`}><FaHome /> Home</button>
          <button onClick={() => setActiveTab('workspaces')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-800 ${activeTab === 'workspaces' ? 'bg-gray-800' : ''}`}><FaUsers /> Workspaces</button>
          <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-800 ${activeTab === 'projects' ? 'bg-gray-800' : ''}`}><FaTasks /> Projects</button>
          <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-800 ${activeTab === 'tasks' ? 'bg-gray-800' : ''}`}><FaTasks /> Tasks</button>
          <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-800 ${activeTab === 'chat' ? 'bg-gray-800' : ''}`}><FaComments /> Chat</button>
          <button onClick={() => setActiveTab('hr')} className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-800 ${activeTab === 'hr' ? 'bg-gray-800' : ''}`}><FaUserTie /> HR</button>
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-800"><FaUserEdit /> Profile</button>
          <button onClick={logout} className="w-full bg-red-600 p-2 rounded mt-4">Logout</button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold capitalize">{activeTab} {workspace && `- ${workspace.name}`}</h1>
          <div><span>{user?.first_name || user?.username}</span></div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'home' && <HomePage workspace={workspace} />}
          {activeTab === 'workspaces' && <WorkspaceSelector workspaces={workspaces} onSelect={selectWorkspace} refresh={() => api.get('/workspaces/').then(res => setWorkspaces(res.data))} />}
          {activeTab === 'projects' && workspace && <ProjectManager workspaceId={workspace.id} />}
          {activeTab === 'tasks' && workspace && <TaskManager workspaceId={workspace.id} />}
          {activeTab === 'chat' && workspace && <Chat workspaceId={workspace.id} />}
          {activeTab === 'hr' && <HRPanel />}
        </main>
      </div>
      {showProfile && <ProfileEditor onClose={() => setShowProfile(false)} />}
    </div>
  );
};

const HomePage = ({ workspace }) => (
  <div className="text-center py-16"><h1 className="text-3xl font-bold mb-4">Welcome to your workspace</h1>{workspace ? <p>Current workspace: <strong>{workspace.name}</strong></p> : <p>Select or create a workspace to start.</p>}</div>
);
const HRPanel = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold mb-4">HR Management</h2><p>Employee profiles, payroll, job postings – coming soon.</p></div>;
export default Dashboard;
