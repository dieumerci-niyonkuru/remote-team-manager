import React, { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store'
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import PresenceHandler from './components/common/PresenceHandler';
import CommandPalette from './components/common/CommandPalette';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
// Note: Settings route moved to the routes section below with proper ProtectedRoute wrapper

// ⚡ Code-split every page — loads only what user visits
const Home          = React.lazy(() => import('./pages/Home'))
const Login         = React.lazy(() => import('./pages/Login'))
const Register      = React.lazy(() => import('./pages/Register'))
const Dashboard     = React.lazy(() => import('./pages/Dashboard'))
const Projects      = React.lazy(() => import('./pages/Projects'))
const WorkspaceDetail = React.lazy(() => import('./pages/WorkspaceDetail'))
const Tasks         = React.lazy(() => import('./pages/Tasks'))
const Workspaces    = React.lazy(() => import('./pages/Workspaces'))
const Team          = React.lazy(() => import('./pages/Team'))
const Invitations   = React.lazy(() => import('./pages/Invitations'))
const Activity      = React.lazy(() => import('./pages/Activity'))
const Chat          = React.lazy(() => import('./pages/Chat'))
const Calendar      = React.lazy(() => import('./pages/Calendar'))
const HR            = React.lazy(() => import('./pages/HR'))
const Files         = React.lazy(() => import('./pages/Files'))
const AIAssistant   = React.lazy(() => import('./pages/AIAssistant'))
const Automations   = React.lazy(() => import('./pages/Automations'))
const Wiki          = React.lazy(() => import('./pages/Wiki'))
const Analytics     = React.lazy(() => import('./pages/Analytics'))
const Search        = React.lazy(() => import('./pages/Search'))
const Integrations  = React.lazy(() => import('./pages/Integrations'))
const Settings      = React.lazy(() => import('./pages/Settings'))
const Notifications = React.lazy(() => import('./pages/Notifications'))
const AuditLogs     = React.lazy(() => import('./pages/AuditLogs'))
const About         = React.lazy(() => import('./pages/About'))
const Onboarding    = React.lazy(() => import('./pages/Onboarding'))
const VideoCall     = React.lazy(() => import('./pages/VideoCall'))
const ForgotPassword  = React.lazy(() => import('./pages/ForgotPassword'))
const JoinWorkspace   = React.lazy(() => import('./pages/JoinWorkspace'))

const PageLoader = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:16 }}>
    <div className="spinner" style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--brand)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    <span style={{ color:'var(--text2)', fontSize:13 }}>Loading...</span>
  </div>
)

const Protected = ({ children }) => {
  const { isAuth } = useStore()
  return isAuth ? children : <Navigate to="/login" replace />
}
const Public = ({ children }) => {
  const { isAuth } = useStore()
  return !isAuth ? children : <Navigate to="/dashboard" replace />
}

// RouterContent lives inside BrowserRouter so useNavigate is available
function RouterContent() {
  const [cmdOpen, setCmdOpen] = useState(false)

  useKeyboardShortcuts([
    { ctrl: true, key: 'k', action: () => setCmdOpen(true) },
  ])

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <React.Suspense fallback={<div className="min-h-screen bg-[#060b18] flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Public><Login /></Public>} />
            <Route path="/register" element={<Public><Register /></Public>} />
            <Route path="/forgot-password" element={<Public><ForgotPassword /></Public>} />
            <Route path="/about" element={<About />} />
            <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/workspaces" element={<Protected><Workspaces /></Protected>} />
            <Route path="/workspaces/:id" element={<Protected><WorkspaceDetail /></Protected>} />
            <Route path="/projects" element={<Protected><Projects /></Protected>} />
            <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
            <Route path="/team" element={<Protected><Team /></Protected>} />
            <Route path="/invitations" element={<Protected><Invitations /></Protected>} />
            <Route path="/activity" element={<Protected><Activity /></Protected>} />
            <Route path="/chat" element={<Protected><Chat /></Protected>} />
            <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
            <Route path="/hr" element={<Protected><HR /></Protected>} />
            <Route path="/files" element={<Protected><Files /></Protected>} />
            <Route path="/ai" element={<Protected><AIAssistant /></Protected>} />
            <Route path="/automations" element={<Protected><Automations /></Protected>} />
            <Route path="/wiki" element={<Protected><Wiki /></Protected>} />
            <Route path="/analytics" element={<ProtectedRoute requiredRoles={['admin','workspace_owner','super_admin']}><Analytics /></ProtectedRoute>} />
            <Route path="/search" element={<Protected><Search /></Protected>} />
            <Route path="/integrations" element={<Protected><Integrations /></Protected>} />
            <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
            <Route path="/audit" element={<ProtectedRoute requiredRoles={['admin','workspace_owner','super_admin']}><AuditLogs /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredRoles={['member','project_manager','admin','workspace_owner','super_admin']}><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<Protected><Settings /></Protected>} />
          </Route>
          <Route path="/call" element={<Protected><VideoCall /></Protected>} />
          <Route path="/join/:token" element={<JoinWorkspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </>
  )
}

export default function App() {
  const { theme } = useStore()
  return (
    <div className={theme}>
      <ErrorBoundary>
        <PresenceHandler>
          <BrowserRouter>
            <RouterContent />
          </BrowserRouter>
        </PresenceHandler>
      </ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ style:{ borderRadius:10, fontSize:13, fontFamily:'Plus Jakarta Sans, sans-serif' }, duration:3000 }} />
    </div>
  )
}
