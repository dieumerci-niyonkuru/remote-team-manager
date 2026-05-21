import * as tokens from '../../styles/tokens';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { getT } from '../../i18n';
import Avatar from '../common/Avatar';
import CreateWorkspaceModal from '../workspaces/CreateWorkspaceModal';
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
  ChevronLeft,
  ChevronDown,
  Users,
  Mail,
  PieChart,
  LogOut,
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { Tooltip } from '../common/Tooltip';
import { Badge } from '../common/Badge';
import FocusTrap from '../common/FocusTrap';
import { useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { theme, setTheme, workspaces, activeWorkspace, setActiveWorkspace, user, status, isSyncing, logout } = useStore();
  const t = getT('en');
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = React.useState(false);
  const [showCreateWsModal, setShowCreateWsModal] = React.useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  React.useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  }, [location.pathname]);

  const userRole = activeWorkspace?.role || 'member';
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const mainLinks = [
    { to: '/dashboard', label: t.dashboard, icon: <LayoutDashboard size={20} /> },
    { to: '/workspaces', label: t.workspaces, icon: <Briefcase size={20} /> },
    { to: `/workspaces/${activeWorkspace?.id}`, label: 'Workspace Details', icon: <Blocks size={20} /> },
    { to: '/projects', label: t.projects, icon: <FolderKanban size={20} /> },
    { to: '/tasks', label: t.tasks, icon: <CheckSquare size={20} /> },
    { to: '/team', label: 'Members', icon: <Users size={20} /> },
    { to: '/invitations', label: 'Invitations', icon: <Mail size={20} />, badge: true },
  ];

  const adminLinks = isAdmin ? [
    { to: '/settings', label: 'Workspace Settings', icon: <Settings size={20} /> },
    { to: '/analytics', label: 'Intelligence', icon: <PieChart size={20} /> },
  ] : [];

  const commLinks = [
    { to: '/chat', label: t.channels, icon: <Hash size={20} /> },
    { to: '/chat', label: t.directMessages, icon: <MessageSquare size={20} /> },
    { to: '/calendar', label: t.calendar, icon: <Calendar size={20} /> },
  ];

  const toolsLinks = [
    { to: '/wiki', label: t.wiki, icon: <BookOpen size={20} /> },
    { to: '/integrations', label: t.integrations, icon: <Blocks size={20} /> },
    { to: '/audit', label: 'Audit Logs', icon: <Hash size={20} /> },
  ];

  const bottomLinks = [
    { to: '/notifications', label: t.notifications, icon: <Bell size={20} /> },
    { to: '/settings', label: t.settings, icon: <Settings size={20} /> },
    { to: '/profile', label: t.profile, icon: <UserCircle size={20} /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111e3b] dark:bg-[#060b18] text-gray-300 border-r border-gray-800 transition-all duration-300">
      
      {/* Brand Logo */}
      <div className={`px-6 py-8 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div 
          className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20"
          style={{ borderRadius: tokens.radius.lg }}
        >
          <img src="/logo.png" alt="RemoteTeam" className="w-7 h-7 object-contain" />
        </div>
        {!collapsed && (
          <span className="text-xl font-black text-white tracking-tighter">Remote<span className="text-blue-500">Team</span></span>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="px-3 py-4 border-b border-gray-800 relative">
        <button 
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className={`flex items-center gap-3 w-full p-2 bg-gray-800/50 hover:bg-gray-800 transition-all ${collapsed ? 'justify-center' : ''}`}
          style={{ borderRadius: tokens.radius.lg }}
        >
          <div 
            className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold"
            style={{ borderRadius: tokens.radius.md }}
          >
            {activeWorkspace?.name?.charAt(0) || 'W'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Workspace</p>
                <p className="text-sm font-semibold text-white truncate">{activeWorkspace?.name || 'Select Workspace'}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {showWorkspaceMenu && !collapsed && (
          <div 
            className="absolute top-full left-3 right-3 mt-2 bg-gray-900 border border-gray-800 z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2"
            style={{ borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.lg }}
          >
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => { setActiveWorkspace(ws); setShowWorkspaceMenu(false); }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${activeWorkspace?.id === ws.id ? 'bg-blue-600/10 text-blue-500' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                  {ws.name.charAt(0)}
                </div>
                <span className="text-sm font-medium truncate">{ws.name}</span>
              </button>
            ))}
            <div className="border-t border-gray-800 mt-1 pt-1">
              <button 
                onClick={() => { setShowCreateWsModal(true); setShowWorkspaceMenu(false); }}
                className="w-full px-4 py-2 text-xs font-bold text-blue-500 hover:bg-blue-600/10 text-left transition-colors"
              >
                + Create New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <NavGroup links={mainLinks} collapsed={collapsed} />
        
        {isAdmin && (
          <>
            {!collapsed && <div className="px-4 mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Administration</div>}
            {collapsed && <div className="h-px bg-gray-800 mx-4 my-4"></div>}
            <NavGroup links={adminLinks} collapsed={collapsed} />
          </>
        )}
        
        {!collapsed && <div className="px-4 mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Communication</div>}
        {collapsed && <div className="h-px bg-gray-800 mx-4 my-4"></div>}
        <NavGroup links={commLinks} collapsed={collapsed} />
        
        {!collapsed && <div className="px-4 mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Tools</div>}
        {collapsed && <div className="h-px bg-gray-800 mx-4 my-4"></div>}
        <NavGroup links={toolsLinks} collapsed={collapsed} />
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-800">
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'open' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {status === 'open' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
            </div>
            {isSyncing && (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                Syncing
              </div>
            )}
          </div>
        )}
        <NavGroup links={bottomLinks} collapsed={collapsed} />
        
        {/* User Profile Section */}
        <div className={`mt-4 pt-4 border-t border-gray-800 flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar user={user} size={collapsed ? 36 : 40} className="shadow-lg" status="online" />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{user?.email}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <ThemeSwitcher />
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          )}
          {collapsed && (
             <button 
               onClick={logout}
               className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
             >
                <LogOut size={12} />
             </button>
          )}
          <CreateWorkspaceModal 
            isOpen={showCreateWsModal} 
            onClose={() => setShowCreateWsModal(false)}
            onCreated={(newWs) => setActiveWorkspace(newWs)}
          />
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Menu Header Space */}
      <div className="md:hidden h-14 bg-[#111e3b] dark:bg-[#060b18] border-b border-gray-800 flex items-center px-3 shrink-0">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-white/5 text-white shadow-lg border border-gray-700"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute right-[-14px] top-10 z-[110] w-7 h-7 bg-[#111e3b] border border-gray-800 rounded-full items-center justify-center text-gray-500 hover:text-white hover:border-blue-500/50 transition-all shadow-xl"
      >
        <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
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
        className={`fixed md:sticky top-0 left-0 h-screen z-[100] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-lg md:shadow-none
          ${collapsed ? 'w-[80px]' : 'w-72'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="relative h-full">
          {mobileOpen ? (
            <FocusTrap>
              <SidebarContent />
            </FocusTrap>
          ) : (
            <SidebarContent />
          )}
           {/* Mobile Close Button (Inside) */}
           <button 
             onClick={() => setMobileOpen(false)}
             className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
           >
             <X size={20} />
           </button>
        </div>
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
          style={{ borderRadius: tokens.radius.lg }}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group relative
            ${isActive ? 'bg-blue-600/10 text-white font-bold' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-100'}
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? link.label : ''}
        >
          {({ isActive }) => (
            <Tooltip content={link.label} position="right">
              <div className="flex items-center gap-4 w-full relative">
                {isActive && (
                  <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-8 bg-brand rounded-r-full shadow-[0_0_15px_rgba(51,102,255,0.8)]" />
                )}
                <span className={`shrink-0 transition-all duration-300 ${isActive ? 'scale-110 text-white' : 'text-text-tertiary group-hover:scale-110 group-hover:text-white'}`}>
                  {link.icon}
                </span>
                {!collapsed && (
                  <span className={`flex-1 truncate text-sm font-black tracking-tight transition-colors ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>
                    {link.label}
                  </span>
                )}
                {link.badge && !collapsed && (
                  <Badge variant="primary" size="xs" className="animate-pulse">New</Badge>
                )}
              </div>
            </Tooltip>
          )}
        </NavLink>
      ))}
    </div>
  );
}
