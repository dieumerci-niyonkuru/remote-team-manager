import { useStore } from '../store'
export default function Settings() {
  const { theme, setTheme } = useStore()
  return (
    <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <h1>Settings</h1>
        <div style={{ marginTop: '1rem' }}>
          <label>Theme: </label>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn btn-secondary">
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </div>
  )
}
