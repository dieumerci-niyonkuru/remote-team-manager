import { useState, useEffect } from 'react';
import * as tokens from '../../styles/tokens';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { getT } from '../../i18n';
import Avatar from '../common/Avatar';
import CreateWorkspaceModal from '../workspaces/CreateWorkspaceModal';
import {
  LayoutDashboard, Briefcase, FolderKanban, CheckSquare, Hash,
  MessageSquare, Calendar, CalendarDays, FolderOpen, BookOpen,
  Bell, Blocks, Settings, Menu, X, ChevronLeft, ChevronDown,
  Users, Mail, PieChart, LogOut, Target,
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { Tooltip } from '../common/Tooltip';
import { Badge } from '../common/Badge';
import FocusTrap from '../common/FocusTrap';

export default function Sidebar() {
  const { theme, setTheme, workspaces, activeWorkspace, setActiveWorkspace, user, status, isSyncing, logout, lang = 'en', setLang } = useStore();
  const t = getT(lang || 'en');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  }, [location.pathname]);

  const userRole = activeWorkspace?.role || 'member';
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const mainLinks = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: <LayoutDashboard size={18} /> },
    { to: '/workspaces', label: t('nav.workspaces', 'Workspaces'), icon: <Briefcase size={18} /> },
    { to: `/workspaces/${activeWorkspace?.id}`, label: 'Workspace Details', icon: <Blocks size={18} /> },
    { to: '/projects', label: t('nav.projects', 'Projects'), icon: <FolderKanban size={18} /> },
    { to: '/tasks', label: t('nav.tasks', 'Tasks'), icon: <CheckSquare size={18} /> },
    { to: '/schedule', label: t('nav.schedule', 'Schedule'), icon: <CalendarDays size={18} /> },
    { to: '/team', label: t('nav.team', 'Team'), icon: <Users size={18} /> },
    { to: '/invitations', label: 'Invitations', icon: <Mail size={18} />, badge: true },
  ];

  const adminLinks = isAdmin ? [
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: <Settings size={18} /> },
    { to: '/analytics', label: t('nav.analytics', 'Analytics'), icon: <PieChart size={18} /> },
  ] : [];

  const commLinks = [
    { to: '/chat', label: t('nav.chat', 'Chat'), icon: <Hash size={18} /> },
    { to: '/calendar', label: t('nav.calendar', 'Calendar'), icon: <Calendar size={18} /> },
    { to: '/files', label: t('nav.files', 'Files'), icon: <FolderOpen size={18} /> },
  ];

  const toolsLinks = [
    { to: '/wiki', label: t('nav.wiki', 'Wiki'), icon: <BookOpen size={18} /> },
    { to: '/okr', label: 'OKRs', icon: <Target size={18} /> },
    { to: '/integrations', label: t('nav.integrations', 'Integrations'), icon: <Blocks size={18} /> },
  ];

  const bottomLinks = [
    { to: '/notifications', label: t('nav.notifications', 'Notifications'), icon: <Bell size={18} /> },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: <Settings size={18} /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg2)', color: 'var(--text2)', borderRight: '1px solid var(--border)', transition: 'all 0.3s' }}>
      
      {/* Brand Logo */}
      <div className={`px-5 py-6 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div 
          className="w-9 h-9 flex items-center justify-center"
          style={{ background: 'var(--brand)', borderRadius: tokens.radius.md }}
        >
          <img src="/logo.png" alt="RemoteTeam" className="w-6 h-6 object-contain" />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Remote<span style={{ color: 'var(--brand)' }}>Team</span></span>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className={`flex items-center gap-3 w-full p-2 transition-all ${collapsed ? 'justify-center' : ''}`}
          style={{ borderRadius: tokens.radius.md, background: 'var(--bg3)', border: '1px solid var(--border)' }}
        >
          <div 
            className="w-7 h-7 flex items-center justify-center text-white shrink-0 font-bold"
            style={{ borderRadius: tokens.radius.sm, background: 'var(--brand)', fontSize: 11 }}
          >
            {activeWorkspace?.name?.charAt(0) || 'W'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Workspace</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeWorkspace?.name || 'Select Workspace'}</p>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text3)', transition: 'transform 0.2s', transform: showWorkspaceMenu ? 'rotate(180deg)' : 'none' }} />
            </>
          )}
        </button>

        {showWorkspaceMenu && !collapsed && (
          <div 
            className="absolute top-full left-3 right-3 mt-1 overflow-hidden py-1"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.md, boxShadow: 'var(--shadow-lg)', zIndex: 50 }}
          >
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => { setActiveWorkspace(ws); setShowWorkspaceMenu(false); }}
                className="flex items-center gap-3 w-full px-3 py-2 text-left transition-colors"
                style={{ background: activeWorkspace?.id === ws.id ? 'var(--brand-bg)' : 'transparent', color: activeWorkspace?.id === ws.id ? 'var(--brand)' : 'var(--text2)' }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                  {ws.name.charAt(0)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.name}</span>
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
              <button 
                onClick={() => { setShowCreateWsModal(true); setShowWorkspaceMenu(false); }}
                className="w-full px-3 py-2 text-left transition-colors"
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}
              >
                + Create New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        <NavGroup links={mainLinks} collapsed={collapsed} />
        
        {isAdmin && (
          <>
            {!collapsed && <div className="px-4 mt-5 mb-1" style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Administration</div>}
            {collapsed && <div style={{ height: 1, background: 'var(--border)', margin: '16px 16px' }}></div>}
            <NavGroup links={adminLinks} collapsed={collapsed} />
          </>
        )}
        
        {!collapsed && <div className="px-4 mt-5 mb-1" style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Communication</div>}
        {collapsed && <div style={{ height: 1, background: 'var(--border)', margin: '16px 16px' }}></div>}
        <NavGroup links={commLinks} collapsed={collapsed} />
        
        {!collapsed && <div className="px-4 mt-5 mb-1" style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tools</div>}
        {collapsed && <div style={{ height: 1, background: 'var(--border)', margin: '16px 16px' }}></div>}
        <NavGroup links={toolsLinks} collapsed={collapsed} />
      </div>

      {/* Bottom Actions */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'open' ? 'var(--success)' : status === 'connecting' ? 'var(--warning)' : 'var(--danger)', boxShadow: status === 'open' ? '0 0 6px var(--success)' : 'none' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {status === 'open' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
            </div>
            {isSyncing && (
              <div className="flex items-center gap-1" style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <div style={{ width: 5, height: 5, background: 'var(--brand)', borderRadius: '50%' }} />
                Syncing
              </div>
            )}
          </div>
        )}
        <NavGroup links={bottomLinks} collapsed={collapsed} />
        
        {/* User Profile Section */}
        <div className={`mt-3 pt-3 flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`} style={{ borderTop: '1px solid var(--border)' }}>
          <Avatar user={user} size={collapsed ? 32 : 36} className="shadow-lg" status="online" />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</p>
                <p style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{user?.email}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1">
                <div style={{ display:'flex', gap:2 }}>
                  {[{c:'en',f:'🇬🇧'},{c:'fr',f:'🇫🇷'},{c:'rw',f:'🇷🇼'}].map(l => (
                    <button key={l.c} onClick={() => setLang && setLang(l.c)}
                      title={l.c.toUpperCase()}
                      style={{
                        background: (lang||'en')===l.c ? 'var(--brand-bg)' : 'transparent',
                        border: `1px solid ${(lang||'en')===l.c ? 'rgba(51,102,255,0.3)' : 'transparent'}`,
                        borderRadius:4, padding:'2px 4px', fontSize:10, cursor:'pointer', transition:'0.15s'
                      }}>{l.f}</button>
                  ))}
                </div>
                <ThemeSwitcher />
                <button onClick={logout} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text3)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-subtle)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; }}
                  title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
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
      {/* Mobile Menu Header */}
      <div className="md:hidden flex items-center px-3 shrink-0" style={{ height: 52, background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute items-center justify-center transition-all"
        style={{ right: -12, top: 40, zIndex: 110, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)' }}
      >
        <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 90 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-[100] transition-all duration-300 shadow-lg md:shadow-none
          ${collapsed ? 'w-[72px]' : 'w-64'} 
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
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text3)' }}
          >
            <X size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}

function NavGroup({ links, collapsed }) {
  return (
    <div className="flex flex-col gap-0.5 px-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={{ borderRadius: tokens.radius.md }}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2 transition-all duration-200 group relative
            ${isActive ? 'font-bold' : 'hover:opacity-90'}
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? link.label : ''}
        >
          {({ isActive }) => (
            <Tooltip content={link.label} position="right">
              <div className="flex items-center gap-3 w-full relative" style={{ color: isActive ? 'var(--brand)' : 'var(--text3)' }}>
                {isActive && (
                  <div className="absolute" style={{ left: -8, top: '50%', transform: 'translateY(-50%)', width: 3, height: 24, background: 'var(--brand)', borderRadius: '0 2px 2px 0' }} />
                )}
                <span className="shrink-0">{link.icon}</span>
                {!collapsed && (
                  <span className="flex-1 truncate" style={{ fontSize: 13, fontWeight: isActive ? 700 : 600 }}>{link.label}</span>
                )}
                {link.badge && !collapsed && (
                  <Badge variant="primary" size="xs">New</Badge>
                )}
              </div>
            </Tooltip>
          )}
        </NavLink>
      ))}
    </div>
  );
}
