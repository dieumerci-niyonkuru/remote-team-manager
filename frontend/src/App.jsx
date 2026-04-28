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

const P = ({ children }) => {
  const { isAuth } = useStore()
  return isAuth ? children : <Navigate to="/login" replace />
}
const Pub = ({ children }) => {
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
            <Route path="/login" element={<Pub><Login /></Pub>} />
            <Route path="/register" element={<Pub><Register /></Pub>} />
            <Route path="/dashboard" element={<P><Dashboard /></P>} />
            <Route path="/workspaces" element={<P><Workspaces /></P>} />
            <Route path="/workspaces/:id" element={<P><WorkspaceDetail /></P>} />
            <Route path="/team" element={<P><Team /></P>} />
            <Route path="/activity" element={<P><Activity /></P>} />
            <Route path="/chat" element={<P><Chat /></P>} />
            <Route path="/knowledge" element={<P><Knowledge /></P>} />
            <Route path="/employees" element={<P><Employees /></P>} />
            <Route path="/performance" element={<P><Performance /></P>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style:{ borderRadius:10, fontSize:13, fontFamily:'Plus Jakarta Sans, sans-serif' }, duration:3000 }} />
    </div>
  )
}
