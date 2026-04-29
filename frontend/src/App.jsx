import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import WorkspaceDetail from './pages/WorkspaceDetail'
import Workspaces from './pages/Workspaces'
import Team from './pages/Team'
import Activity from './pages/Activity'
import Chat from './pages/Chat'
import Knowledge from './pages/Knowledge'
import Employees from './pages/Employees'
import Performance from './pages/Performance'
import Calendar from './pages/Calendar'
import Files from './pages/Files'
import Analytics from './pages/Analytics'
import Support from './pages/Support'

const Protected = ({ children }) => {
  const { isAuth } = useStore()
  return isAuth ? children : <Navigate to="/login" replace />
}
const Public = ({ children }) => {
  const { isAuth } = useStore()
  return !isAuth ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { theme } = useStore()
  return (
    <div className={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Public><Login /></Public>} />
            <Route path="/register" element={<Public><Register /></Public>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/workspaces" element={<Protected><Workspaces /></Protected>} />
            <Route path="/workspaces/:id" element={<Protected><WorkspaceDetail /></Protected>} />
            <Route path="/team" element={<Protected><Team /></Protected>} />
            <Route path="/activity" element={<Protected><Activity /></Protected>} />
            <Route path="/chat" element={<Protected><Chat /></Protected>} />
            <Route path="/knowledge" element={<Protected><Knowledge /></Protected>} />
            <Route path="/employees" element={<Protected><Employees /></Protected>} />
            <Route path="/performance" element={<Protected><Performance /></Protected>} />
            <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
            <Route path="/files" element={<Protected><Files /></Protected>} />
            <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
            <Route path="/support" element={<Protected><Support /></Protected>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  )
}
