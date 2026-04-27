import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useStore } from '../../store'
import Header from './Header'
import Footer from './Footer'
import AIAssistant from '../common/AIAssistant'

export default function Layout({ showFooter = true }) {
  const { theme } = useStore()
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header />
      <main style={{ flex: 1 }}><Outlet /></main>
      {showFooter && <Footer />}
      {showBackToTop && (
        <button onClick={scrollToTop} style={{ position: 'fixed', bottom: 24, right: 24, width: 44, height: 44, borderRadius: '50%', background: 'var(--brand)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 20, boxShadow: 'var(--shadow-lg)', zIndex: 99 }}>↑</button>
      )}
      <AIAssistant />
    </div>
  )
}
