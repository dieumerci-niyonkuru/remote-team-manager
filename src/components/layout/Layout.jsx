import { Outlet } from 'react-router-dom'
import { useStore } from '../../store'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ showFooter = true }) {
  const { theme } = useStore()
  return (
    <div className={theme} style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      <Header />
      <main style={{ flex:1 }}><Outlet /></main>
      {showFooter && <Footer />}
    </div>
  )
}
