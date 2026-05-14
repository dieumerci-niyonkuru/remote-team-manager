import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { hr, ws } from '../services/api'
import toast from 'react-hot-toast'

export default function HR() {
  const { theme } = useStore()
  const [tab, setTab] = useState('jobs') // 'jobs' | 'employees'
  const [jobs, setJobs] = useState([])
  const [employees, setEmployees] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)

  // Create Job Form
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: '', workspace: '' })

  useEffect(() => {
    Promise.all([hr.jobs(), hr.employees(), ws.list()])
      .then(([jRes, eRes, wRes]) => {
        setJobs(jRes.data)
        setEmployees(eRes.data)
        setWorkspaces(wRes.data.data || wRes.data)
      })
      .catch(() => toast.error('Failed to load HR data'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!form.workspace) { toast.error('Select a workspace'); return }
    try {
      const res = await hr.createJob({ ...form, deadline: new Date(Date.now() + 30*86400000).toISOString().split('T')[0] })
      setJobs(prev => [...prev, res.data])
      setShowCreate(false)
      toast.success('Job posted!')
    } catch { toast.error('Failed to post job') }
  }

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--text)' }}>
            HR & Recruitment
          </h1>
          {tab === 'jobs' && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Post Job</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={() => setTab('jobs')}
            style={{ padding: '12px 0', background: 'transparent', border: 'none', borderBottom: tab === 'jobs' ? '2px solid var(--brand)' : '2px solid transparent', color: tab === 'jobs' ? 'var(--brand)' : 'var(--text2)', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'var(--transition)' }}>
            Job Postings
          </button>
          <button 
            onClick={() => setTab('employees')}
            style={{ padding: '12px 0', background: 'transparent', border: 'none', borderBottom: tab === 'employees' ? '2px solid var(--brand)' : '2px solid transparent', color: tab === 'employees' ? 'var(--brand)' : 'var(--text2)', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'var(--transition)' }}>
            Employee Directory
          </button>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        ) : tab === 'jobs' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {jobs.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', color: 'var(--text2)', textAlign: 'center', padding: 40 }}>No job postings active.</div>
            ) : jobs.map(j => (
              <div key={j.id} className="card card-hover" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{j.title}</h3>
                  <span className="badge badge-green">Active</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>{j.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text3)' }}>
                  <span>📍 {j.location}</span>
                  <span>🕒 Due: {new Date(j.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {employees.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', color: 'var(--text2)', textAlign: 'center', padding: 40 }}>No employees found.</div>
            ) : employees.map(e => (
              <div key={e.id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-bg)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                  {e.user?.username?.[0]?.toUpperCase() || 'E'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{e.user?.username || 'Employee'}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 12 }}>{e.position || 'Staff'} • {e.department || 'General'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="card scale-in" style={{ width: '100%', maxWidth: 500, padding: 36 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>Post a Job</h3>
            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Workspace</label>
                <select className="input" value={form.workspace} onChange={e => setForm({...form, workspace: e.target.value})} required>
                  <option value="">Select Workspace</option>
                  {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Job Title</label>
                <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required placeholder="e.g. Remote, US" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Job summary..." />
              </div>
              <div>
                <label className="label">Requirements</label>
                <textarea className="input" rows={3} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} required placeholder="Skills needed..." />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
