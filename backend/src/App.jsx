import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store'
import Layout from './components/layout/Layout'

// ⚡ Code-split every page — loads only what user visits
const Home          = lazy(() => import('./pages/Home'))
const Login         = lazy(() => import('./pages/Login'))
const Register      = lazy(() => import('./pages/Register'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const WorkspaceDetail = lazy(() => import('./pages/WorkspaceDetail'))
const Workspaces    = lazy(() => import('./pages/Workspaces'))
const Team          = lazy(() => import('./pages/Team'))
const Activity      = lazy(() => import('./pages/Activity'))
const Chat          = lazy(() => import('./pages/Chat'))
const Calendar      = lazy(() => import('./pages/Calendar'))
const HR            = lazy(() => import('./pages/HR'))
const Files         = lazy(() => import('./pages/Files'))
const AIAssistant   = lazy(() => import('./pages/AIAssistant'))
const Automations   = lazy(() => import('./pages/Automations'))
const Wiki          = lazy(() => import('./pages/Wiki'))
const Search        = lazy(() => import('./pages/Search'))
const Integrations  = lazy(() => import('./pages/Integrations'))
const About         = lazy(() => import('./pages/About'))
const Settings      = lazy(() => import('./pages/Settings'))
const Notifications = lazy(() => import('./pages/Notifications'))

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

export default function App() {
  const { theme } = useStore()
  return (
    <div className={theme}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Public><Login /></Public>} />
              <Route path="/register" element={<Public><Register /></Public>} />
              <Route path="/about" element={<About />} />
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
              <Route path="/integrations" element={<Protected><Integrations /></Protected>} />
              <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style:{ borderRadius:10, fontSize:13, fontFamily:'Plus Jakarta Sans, sans-serif' }, duration:3000 }} />
    </div>
  )
}
