import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store'
import Layout from './components/layout/Layout'

// Lazy load pages (code splitting)
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const WorkspaceDetail = lazy(() => import('./pages/WorkspaceDetail'))
const Workspaces = lazy(() => import('./pages/Workspaces'))
const Team = lazy(() => import('./pages/Team'))
const Activity = lazy(() => import('./pages/Activity'))

// Loading spinner
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
    <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid #3366ff', borderRadius: '50%' }}></div>
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

export default function App() {
  const { theme } = useStore()
  return (
    <div className={theme}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Public><Login /></Public>} />
              <Route path="/register" element={<Public><Register /></Public>} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/workspaces" element={<Protected><Workspaces /></Protected>} />
              <Route path="/workspaces/:id" element={<Protected><WorkspaceDetail /></Protected>} />
              <Route path="/team" element={<Protected><Team /></Protected>} />
              <Route path="/activity" element={<Protected><Activity /></Protected>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontSize: 13 }, duration: 3000 }} />
    </div>
  )
}
