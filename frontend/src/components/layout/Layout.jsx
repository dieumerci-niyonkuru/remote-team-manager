import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useStore } from '../../store'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ showFooter = true }) {
  const { theme } = useStore()
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showScrollDown, setShowScrollDown] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      setShowBackToTop(scrolled > 300)
      setShowScrollDown(scrolled < 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

  return (
    <div className={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header />
      <main style={{ flex: 1 }}><Outlet /></main>
      {showFooter && <Footer />}
      {showScrollDown && (
        <button onClick={scrollToBottom} style={{ position: 'fixed', bottom: 24, right: 80, width: 44, height: 44, borderRadius: '50%', background: '#3366ff', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: 'var(--shadow-lg)', transition: '0.2s', zIndex: 99 }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>↓</button>
      )}
      {showBackToTop && (
        <button onClick={scrollToTop} style={{ position: 'fixed', bottom: 24, right: 24, width: 44, height: 44, borderRadius: '50%', background: '#3366ff', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: 'var(--shadow-lg)', transition: '0.2s', zIndex: 99 }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>↑</button>
      )}
    </div>
  )
}
