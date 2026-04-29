import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws, proj, task } from '../services/api'

export default function Calendar() {
  const { theme } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [tasksWithDue, setTasksWithDue] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div className={theme} style={{ padding: '2rem', textAlign: 'center' }}>Loading calendar...</div>

  const countries = ['Rwanda', 'Kenya', 'Nigeria', 'South Africa', 'USA', 'UK', 'France', 'Germany', 'Canada', 'India', 'Brazil', 'Australia', 'Remote']

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '2rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h1>📅 Calendar View</h1>
          <select value={activeWs?.id || ''} onChange={e => setActiveWs(workspaces.find(w => w.id === e.target.value))} className="input" style={{ width: 200 }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        {tasksWithDue.length === 0 ? (
          <div className="card empty-state">No tasks with due dates.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {tasksWithDue.map(t => (
              <div key={t.id} className="card" style={{ padding: 16 }}>
                <h3>{t.title}</h3>
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
