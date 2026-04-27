import { useStore } from '../store'
export default function Notifications() {
  const { theme } = useStore()
  return (
    <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <h1>Notifications</h1>
        <p>You have no new notifications.</p>
      </div>
    </div>
  )
}
