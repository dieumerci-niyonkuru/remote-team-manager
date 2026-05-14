import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../store';
import { useT } from '../../i18n';
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  CheckSquare,
  Hash,
  MessageSquare,
  Calendar,
  BarChart2,
  BookOpen,
  Bell,
  Blocks,
  Settings,
  UserCircle,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';

export default function Sidebar() {
  const { theme, lang } = useStore();
  const t = useT(lang);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainLinks = [
    { to: '/dashboard', label: t.dashboard, icon: <LayoutDashboard size={20} /> },
    { to: '/workspaces', label: t.workspaces, icon: <Briefcase size={20} /> },
    { to: '/projects', label: t.projects, icon: <FolderKanban size={20} /> },
    { to: '/tasks', label: t.tasks, icon: <CheckSquare size={20} /> },
  ];

  const commLinks = [
    { to: '/channels', label: t.channels, icon: <Hash size={20} /> },
    { to: '/chat', label: t.directMessages, icon: <MessageSquare size={20} /> },
    { to: '/calendar', label: t.calendar, icon: <Calendar size={20} /> },
  ];

  const toolsLinks = [
    { to: '/analytics', label: t.analytics, icon: <BarChart2 size={20} /> },
    { to: '/wiki', label: t.wiki, icon: <BookOpen size={20} /> },
    { to: '/integrations', label: t.integrations, icon: <Blocks size={20} /> },
  ];

  const bottomLinks = [
    { to: '/notifications', label: t.notifications, icon: <Bell size={20} /> },
    { to: '/settings', label: t.settings, icon: <Settings size={20} /> },
    { to: '/profile', label: t.profile, icon: <UserCircle size={20} /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111e3b] dark:bg-[#060b18] text-gray-300 border-r border-gray-800 transition-all duration-300">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
             </svg>
          </div>
          <span className="font-bold text-white tracking-tight whitespace-nowrap">RTM App</span>
        </div>
        
        {/* Collapse Button (Desktop Only) */}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <NavGroup links={mainLinks} collapsed={collapsed} />
        
        {!collapsed && <div className="px-4 mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Communication</div>}
        {collapsed && <div className="h-px bg-gray-800 mx-4 my-4"></div>}
        <NavGroup links={commLinks} collapsed={collapsed} />
        
        {!collapsed && <div className="px-4 mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Tools</div>}
        {collapsed && <div className="h-px bg-gray-800 mx-4 my-4"></div>}
        <NavGroup links={toolsLinks} collapsed={collapsed} />
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-800">
        <NavGroup links={bottomLinks} collapsed={collapsed} />
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#111e3b] text-white shadow-lg border border-gray-700"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-[100] transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <SidebarContent />

        {/* Mobile Close Button */}
        <button 
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-3 right-[-48px] p-2 text-white bg-gray-800 rounded-lg shadow-lg"
        >
          <X size={24} />
        </button>
      </aside>
    </>
  );
}

// NavGroup Component
function NavGroup({ links, collapsed }) {
  return (
    <div className="flex flex-col gap-1 px-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
            ${isActive ? 'bg-blue-600/10 text-blue-500 font-semibold' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? link.label : ''}
        >
          <span className="shrink-0">{link.icon}</span>
          {!collapsed && (
            <span className="truncate text-[14px] leading-tight">
              {link.label}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
