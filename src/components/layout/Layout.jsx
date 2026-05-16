import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useStore } from '../../store'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import CommandPalette from '../CommandPalette'
import FloatingAI from '../FloatingAI'
import FeedbackButton from '../common/FeedbackButton'
import ErrorBoundary from '../ErrorBoundary'
import { ws } from '../../services/api'

export default function Layout({ showFooter = true }) {
  const { theme, isAuth, setWorkspaces, workspaces, activeWorkspace, setActiveWorkspace } = useStore()
  
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

  return (
    <div className={`${theme} min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-500`}>
      {isAuth ? (
        // Authenticated Dashboard Layout
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#0b1429] dark:bg-[#060b18]">
          <Sidebar />
          
          <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <CommandPalette />
            <FloatingAI />
            <FeedbackButton />
            
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
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
    </div>
  )
}
