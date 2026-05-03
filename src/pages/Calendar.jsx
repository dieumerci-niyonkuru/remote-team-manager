import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { useStore } from '../store'
import { task, proj, ws } from '../services/api'

export default function Calendar() {
  const { theme } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllTasks()
  }, [])

  const loadAllTasks = async () => {
    try {
      // Simplistic approach: fetch all tasks from all workspaces
      // In a real large app, this would be a dedicated backend endpoint for the calendar
      const workspacesRes = await ws.list()
      const workspaces = workspacesRes.data.data
      let allTasks = []
      
      for (const w of workspaces) {
        const pRes = await proj.list(w.id)
        for (const p of pRes.data.data) {
          const tRes = await task.list(w.id, p.id)
          allTasks = [...allTasks, ...tRes.data.data]
        }
      }
      setTasks(allTasks)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--text)' }}>
            Calendar
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-secondary" onClick={prevMonth}>&larr;</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', minWidth: 140, textAlign: 'center' }}>
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button className="btn btn-secondary" onClick={nextMonth}>&rarr;</button>
          </div>
        </div>

        <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
          <div style={{ minWidth: 800 }}>
            {/* Week days header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
              {weekDays.map(d => (
                <div key={d} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {days.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, monthStart)
                const isToday = isSameDay(day, new Date())
                
                // Find tasks due on this day
                const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day))

                return (
                  <div key={i} style={{ 
                    minHeight: 120, 
                    border: isToday ? '2px solid var(--brand)' : '1px solid var(--border)', 
                    borderRadius: 12, 
                    padding: 8, 
                    background: isCurrentMonth ? 'var(--bg-card)' : 'var(--bg2)',
                    opacity: isCurrentMonth ? 1 : 0.5
                  }}>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: isToday ? 800 : 600, 
                      color: isToday ? 'var(--brand)' : 'var(--text)',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: isToday ? 'var(--brand-bg)' : 'transparent'
                    }}>
                      {format(day, 'd')}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dayTasks.map(t => (
                        <div key={t.id} style={{ 
                          fontSize: 11, padding: '4px 6px', borderRadius: 4, 
                          background: t.status === 'done' ? 'rgba(34,197,94,0.1)' : 'var(--brand-bg)', 
                          color: t.status === 'done' ? '#16a34a' : 'var(--brand)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          fontWeight: 600
                        }} title={t.title}>
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
