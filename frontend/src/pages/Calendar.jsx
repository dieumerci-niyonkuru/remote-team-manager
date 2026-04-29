import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws, proj, task } from '../services/api'

// List of countries (simplified)
const COUNTRIES = [
  '🇺🇸 United States', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇦🇺 Australia', '🇩🇪 Germany',
  '🇫🇷 France', '🇯🇵 Japan', '🇧🇷 Brazil', '🇮🇳 India', '🇰🇪 Kenya', '🇷🇼 Rwanda',
  '🇳🇬 Nigeria', '🇿🇦 South Africa', '🇪🇸 Spain', '🇮🇹 Italy', '🇲🇽 Mexico', '🇰🇷 South Korea'
]

export default function Calendar() {
  const { theme } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [tasksWithDue, setTasksWithDue] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState('')

  useEffect(() => {
    ws.list().then(r => {
      setWorkspaces(r.data.data)
      if (r.data.data.length) setActiveWs(r.data.data[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeWs) return
    const fetchTasks = async () => {
      try {
        const projectsRes = await proj.list(activeWs.id)
        const projects = projectsRes.data.data || []
        let allTasks = []
        for (const p of projects) {
          const tasksRes = await task.list(activeWs.id, p.id)
          const tasks = tasksRes.data.data || []
          allTasks.push(...tasks.filter(t => t.due_date))
        }
        setTasksWithDue(allTasks)
      } catch (err) { console.error(err) }
    }
    fetchTasks()
  }, [activeWs])

  if (loading) return <div className={theme}>Loading calendar...</div>

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '2rem' }}>
      <div className="container">
        <h1>📅 Calendar View</h1>
        <div style={{ display: 'flex', gap: 12, margin: '16px 0', flexWrap: 'wrap' }}>
          <select value={activeWs?.id || ''} onChange={e => setActiveWs(workspaces.find(w => w.id === e.target.value))} className="input" style={{ width: 200 }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="input" style={{ width: 200 }}>
            <option value="">🌍 All countries</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {tasksWithDue.length === 0 ? (
          <div className="card empty-state">No tasks with due dates.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {tasksWithDue.map(t => (
              <div key={t.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>📅</span>
                  <h3 style={{ margin: 0 }}>{t.title}</h3>
                </div>
                <p><strong>Due:</strong> {new Date(t.due_date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {t.status}</p>
                <span className="badge badge-blue">Priority: {t.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
