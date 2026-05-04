import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { useStore } from '../store'
import { ws, proj, task } from '../services/api'
import toast from 'react-hot-toast'

export default function Calendar() {
  const { theme } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    loadAllTasks()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadAllTasks = async () => {
    try {
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
    } catch (e) { toast.error('Failed to sync timeline data') } finally { setLoading(false) }
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
    <div className={theme} style={{ background: 'var(--bg)', minHeight: '100vh', padding: isMobile ? '40px 16px' : '80px 24px' }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap:'wrap', gap:20 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'var(--text)', letterSpacing:'-0.03em' }}>Project Timeline</h1>
            <p style={{ color: 'var(--text2)', marginTop: 8, fontWeight:500 }}>Synchronize team goals and delivery milestones.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background:'var(--bg-card)', padding:'8px 16px', borderRadius:16, border:'1px solid var(--border)' }}>
            <button className="btn-icon" onClick={prevMonth}>⬅</button>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', minWidth: 140, textAlign: 'center' }}>
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button className="btn-icon" onClick={nextMonth}>➡</button>
          </div>
        </div>

        <div className="card glass" style={{ padding: isMobile ? 12 : 32, overflowX: isMobile ? 'auto' : 'visible' }}>
          <div style={{ minWidth: isMobile ? 600 : 'auto' }}>
            {/* Week days header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 16 }}>
              {weekDays.map(d => (
                <div key={d} style={{ textAlign: 'center', fontWeight: 900, color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing:1 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
              {days.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, monthStart)
                const isToday = isSameDay(day, new Date())
                const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day))

                return (
                  <div key={i} style={{ 
                    minHeight: isMobile ? 100 : 140, 
                    border: isToday ? '2px solid var(--brand)' : '1px solid var(--border)', 
                    borderRadius: 20, 
                    padding: 12, 
                    background: isCurrentMonth ? 'rgba(var(--bg-card-rgb), 0.4)' : 'transparent',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    transition: '0.2s'
                  }}>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 900, 
                      color: isToday ? '#fff' : (isCurrentMonth ? 'var(--text)' : 'var(--text3)'),
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28, height: 28,
                      borderRadius: 10,
                      background: isToday ? 'var(--brand)' : 'transparent'
                    }}>
                      {format(day, 'd')}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {dayTasks.map(t => (
                        <div key={t.id} style={{ 
                          fontSize: 10, padding: '6px 8px', borderRadius: 8, 
                          background: t.status === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(51,102,255,0.1)', 
                          color: t.status === 'done' ? '#10b981' : 'var(--brand)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          fontWeight: 800, border: '1px solid transparent'
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
