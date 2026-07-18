import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useStore } from '../../store'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import CommandPalette from '../common/CommandPalette'
import CreateWorkspaceModal from '../workspaces/CreateWorkspaceModal'

import ErrorBoundary from '../ErrorBoundary'
import { ws } from '../../services/api'
import { a11yStyles } from '../../styles/a11y'
import { ChevronDown, Plus, Check } from 'lucide-react'

export default function Layout({ showFooter = true }) {
  const { theme, isAuth, setWorkspaces, workspaces, activeWorkspace, setActiveWorkspace } = useStore()
  const [showWsMenu, setShowWsMenu] = useState(false)
  const [showCreateWs, setShowCreateWs] = useState(false)
  
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  React.useEffect(() => {
    if (isAuth) {
      ws.list().then(res => {
        const data = res.data.data || res.data || []
        setWorkspaces(data)
        if (data.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data[0])
        }
      }).catch(err => console.error('Failed to load workspaces', err))
    }
  }, [isAuth])

  React.useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-ws-switcher]')) setShowWsMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <style dangerouslySetInnerHTML={{ __html: a11yStyles }} />
      <div id="main-content" className={`${theme} min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-500`}>
      {isAuth ? (
        // Authenticated Dashboard Layout
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#0b1429] dark:bg-[#060b18]">
          <Sidebar />
          
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <CommandPalette />

            {/* Workspace Switcher Bar */}
            {workspaces.length > 0 && (
              <div data-ws-switcher style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setShowWsMenu(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '6px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, background: 'var(--brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 900, flexShrink: 0,
                  }}>
                    {activeWorkspace?.name?.charAt(0) || 'W'}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeWorkspace?.name || 'Select Workspace'}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text3)', transition: 'transform 0.2s', transform: showWsMenu ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
                </button>

                {showWsMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 300, overflowY: 'auto',
                    background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)', zIndex: 200,
                  }}>
                    {workspaces.map(w => (
                      <button
                        key={w.id}
                        onClick={() => { setActiveWorkspace(w); setShowWsMenu(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '8px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                          background: activeWorkspace?.id === w.id ? 'var(--brand-bg)' : 'transparent',
                          color: activeWorkspace?.id === w.id ? 'var(--brand)' : 'var(--text2)',
                          transition: '0.15s',
                        }}
                        onMouseEnter={e => { if (activeWorkspace?.id !== w.id) e.currentTarget.style.background = 'var(--bg3)'; }}
                        onMouseLeave={e => { if (activeWorkspace?.id !== w.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: 6, background: activeWorkspace?.id === w.id ? 'var(--brand)' : 'var(--bg3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: activeWorkspace?.id === w.id ? '#fff' : 'var(--text3)', fontSize: 10, fontWeight: 700, flexShrink: 0,
                        }}>
                          {w.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
                        {activeWorkspace?.id === w.id && <Check size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', padding: '4px 8px' }}>
                      <button
                        onClick={() => { setShowCreateWs(true); setShowWsMenu(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                          padding: '8px 10px', border: 'none', cursor: 'pointer', borderRadius: 6,
                          background: 'transparent', color: 'var(--brand)', fontSize: 12, fontWeight: 700,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Plus size={14} /> Create New Workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>

          <CreateWorkspaceModal
            isOpen={showCreateWs}
            onClose={() => setShowCreateWs(false)}
            onCreated={(newWs) => { setActiveWorkspace(newWs); setWorkspaces(prev => [...prev, newWs]); }}
          />
        </div>
      ) : (
        // Public Marketing Layout
        <div className="flex flex-col min-h-screen relative">
          <Header />
          <main className="flex-1">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
          {showFooter && <Footer />}
        </div>
      )}

      {/* Global CSS for Tailwind Scrollbars */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }
      `}</style>
    </div></>
  )
}
