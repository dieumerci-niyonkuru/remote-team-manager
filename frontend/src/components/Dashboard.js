import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api';
import Workspaces from './modules/Workspaces';
import Projects from './modules/Projects';
import Tasks from './modules/Tasks';
import Chat from './chat/Chat';
import Analytics from './Analytics';
import CalendarView from './Calendar';
import Integrations from './Integrations';
import TimeTracking from './TimeTracking';
import OKRs from './OKRs';
import FileManager from './FileManager';
import AuditLogs from './AuditLogs';
import Profile from './Profile';
import { FaHome, FaUsers, FaTasks, FaComments, FaChartLine, FaCalendarAlt, FaPlug, FaHourglassHalf, FaBullseye, FaFolderOpen, FaHistory, FaUserEdit, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import TypingSpeed from './widgets/TypingSpeed';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('workspaces');
  const [workspace, setWorkspace] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: <FaHome />, comp: <TypingSpeed /> },
    { id: 'workspaces', label: 'Workspaces', icon: <FaUsers />, comp: <Workspaces workspace={workspace} setWorkspace={setWorkspace} /> },
    { id: 'projects', label: 'Projects', icon: <FaTasks />, comp: <Projects workspace={workspace} /> },
    { id: 'tasks', label: 'Tasks', icon: <FaTasks />, comp: <Tasks workspace={workspace} /> },
    { id: 'chat', label: 'Chat', icon: <FaComments />, comp: <Chat workspace={workspace} /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine />, comp: <Analytics workspace={workspace} /> },
    { id: 'calendar', label: 'Calendar', icon: <FaCalendarAlt />, comp: <CalendarView workspace={workspace} /> },
    { id: 'integrations', label: 'Integrations', icon: <FaPlug />, comp: <Integrations /> },
    { id: 'timetracking', label: 'Time Tracking', icon: <FaHourglassHalf />, comp: <TimeTracking workspace={workspace} /> },
    { id: 'okrs', label: 'OKRs', icon: <FaBullseye />, comp: <OKRs workspace={workspace} /> },
    { id: 'files', label: 'Files', icon: <FaFolderOpen />, comp: <FileManager workspace={workspace} /> },
    { id: 'audit', label: 'Audit Logs', icon: <FaHistory />, comp: <AuditLogs /> },
    { id: 'profile', label: 'Profile', icon: <FaUserEdit />, comp: <Profile /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <button onClick={() => setSidebarOpen(true)} className="bg-purple-600 text-white p-2 rounded-md shadow-lg">
          <FaBars size={20} />
        </button>
      </div>

      {/* Sidebar drawer for mobile / desktop */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed md:relative z-40 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">RTM</span>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white"><FaTimes /></button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`flex items-center w-full px-4 py-3 rounded transition ${activeTab === item.id ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
              <button onClick={logout} className="flex items-center w-full px-4 py-3 hover:bg-gray-700 rounded mt-4">
                <FaSignOutAlt className="text-xl" />
                <span className="ml-3">Logout</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold capitalize dark:text-white">{activeTab}</h1>
            {workspace && <p className="text-sm text-gray-500">Working in: {workspace.name}</p>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-200 hidden sm:inline">Welcome, {user?.first_name || user?.username}!</span>
            <img src={user?.avatar || 'https://img.icons8.com/fluency/48/teamwork.png'} alt="Avatar" className="w-8 h-8 rounded-full" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {menuItems.find(i => i.id === activeTab)?.comp}
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
