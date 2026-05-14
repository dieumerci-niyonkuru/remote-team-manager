import { Outlet } from 'react-router-dom'
import { useStore } from '../../store'
import Header from './Header'
import Footer from './Footer'
import CommandPalette from '../CommandPalette'
import FloatingAI from '../FloatingAI'
import ErrorBoundary from '../ErrorBoundary'

export default function Layout({ showFooter = true }) {
  const { theme } = useStore()
  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      <Header />
      <CommandPalette />
      <FloatingAI />
      <main style={{ flex:1 }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
