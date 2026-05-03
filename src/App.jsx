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
import Calendar from './pages/Calendar'
import HR from './pages/HR'
import Files from './pages/Files'
import AIAssistant from './pages/AIAssistant'
import Automations from './pages/Automations'
import Wiki from './pages/Wiki'
import Search from './pages/Search'

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
            <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
            <Route path="/hr" element={<Protected><HR /></Protected>} />
            <Route path="/files" element={<Protected><Files /></Protected>} />
            <Route path="/ai" element={<Protected><AIAssistant /></Protected>} />
            <Route path="/automations" element={<Protected><Automations /></Protected>} />
            <Route path="/wiki" element={<Protected><Wiki /></Protected>} />
            <Route path="/search" element={<Protected><Search /></Protected>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style:{ borderRadius:10, fontSize:13, fontFamily:'Plus Jakarta Sans, sans-serif' }, duration:3000 }} />
    </div>
  )
}
