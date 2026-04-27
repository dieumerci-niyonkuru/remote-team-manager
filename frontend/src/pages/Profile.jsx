import { useStore } from '../store'
export default function Profile() {
  const { user, theme } = useStore()
  return (
    <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <h1>Profile</h1>
        <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Joined:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
