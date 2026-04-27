import { useStore } from '../store'
export default function Notifications() {
  const { theme } = useStore()
  return (
    <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <h1>Notifications</h1>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p>No new notifications</p>
        </div>
      </div>
    </div>
  )
}
