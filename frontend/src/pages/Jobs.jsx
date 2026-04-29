import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws, jobsApi } from '../services/api'
import toast from 'react-hot-toast'

export default function Jobs() {
  const { theme } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [jobList, setJobList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newJob, setNewJob] = useState({ title: '', description: '', location: 'Remote', requirements: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ws.list().then(r => {
      setWorkspaces(r.data.data)
      if (r.data.data.length) setActiveWs(r.data.data[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeWs) {
      jobsApi.list(activeWs.id).then(r => setJobList(r.data.data || [])).catch(() => setJobList([]))
    }
  }, [activeWs])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!newJob.title.trim() || !newJob.description.trim()) {
      toast.error('Title and description required')
      return
    }
    setSaving(true)
    try {
      const res = await jobsApi.create(activeWs.id, newJob)
      setJobList([...jobList, res.data.data])
      setShowModal(false)
      setNewJob({ title: '', description: '', location: 'Remote', requirements: '' })
      toast.success('Job posted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={theme}>Loading...</div>

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '2rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1>💼 Job Postings</h1>
          <select value={activeWs?.id || ''} onChange={e => setActiveWs(workspaces.find(w => w.id === e.target.value))} className="input" style={{ width: 200 }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Post New Job</button>
        <div style={{ marginTop: 20 }}>
          {jobList.length === 0 ? (
            <div className="card empty-state">No jobs posted yet</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {jobList.map(job => (
                <div key={job.id} className="card" style={{ padding: 16 }}>
                  <h3>{job.title}</h3>
                  <p>{job.description}</p>
                  <small>Location: {job.location} | Status: {job.status}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>Post a Job</h3>
            <form onSubmit={handleCreateJob}>
              <input className="input" placeholder="Job title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required />
              <textarea className="input-textarea" placeholder="Description" rows="4" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} required />
              <input className="input" placeholder="Location" style={{ marginTop: 8 }} value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
              <textarea className="input-textarea" placeholder="Requirements" rows="3" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Posting...' : 'Post Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
