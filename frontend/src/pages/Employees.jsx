import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws } from '../services/api'
import api from '../services/api'
import toast from 'react-hot-toast'

const STATUS_BADGE = { active:'badge-green', on_leave:'badge-amber', terminated:'badge-red' }
const TYPE_BADGE = { full_time:'badge-blue', part_time:'badge-cyan', contract:'badge-amber', freelance:'badge-purple' }
const RATING_BADGE = { excellent:'badge-green', good:'badge-blue', satisfactory:'badge-amber', needs_work:'badge-red' }

export default function Employees() {
  const { theme } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [employees, setEmployees] = useState([])
  const [jobs, setJobs] = useState([])
  const [tab, setTab] = useState('employees')
  const [loading, setLoading] = useState(true)
  const [showNewJob, setShowNewJob] = useState(false)
  const [newJob, setNewJob] = useState({ title:'', description:'', location:'Remote', requirements:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ws.list().then(r => {
      setWorkspaces(r.data.data)
      if (r.data.data.length) { setActiveWs(r.data.data[0]); loadData(r.data.data[0].id) }
      setLoading(false)
    })
  }, [])

  const loadData = async wid => {
    try {
      const [emp, j] = await Promise.all([
        api.get(`/workspaces/${wid}/employees/`).catch(() => ({ data:{ data:[] } })),
        api.get(`/workspaces/${wid}/jobs/`).catch(() => ({ data:{ data:[] } })),
      ])
      setEmployees(emp.data.data || [])
      setJobs(j.data.data || [])
    } catch { setEmployees([]); setJobs([]) }
  }

  const createJob = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await api.post(`/workspaces/${activeWs.id}/jobs/`, newJob)
      setJobs(p => [...p, r.data.data])
      setShowNewJob(false)
      setNewJob({ title:'', description:'', location:'Remote', requirements:'' })
      toast.success('Job posted! 🎉')
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const COUNTRIES = ['Rwanda', 'Kenya', 'Nigeria', 'South Africa', 'USA', 'UK', 'France', 'Germany', 'Canada', 'India', 'Remote']

  return (
    <div className={theme} style={{ background:'var(--bg)', minHeight:'calc(100vh - 64px)', padding:'32px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:4 }}>👥 Employees</h1>
            <p style={{ color:'var(--text2)', fontSize:14 }}>Manage your global team, payroll and job postings</p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <select value={activeWs?.id||''} onChange={e => { const w=workspaces.find(x=>x.id===e.target.value); setActiveWs(w); loadData(w.id) }}
              style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--text)', outline:'none' }}>
              {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            {tab==='jobs' && <button className="btn btn-primary" style={{ padding:'8px 16px', fontSize:13 }} onClick={() => setShowNewJob(true)}>+ Post Job</button>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12, marginBottom:24 }}>
          {[
            { icon:'👤', label:'Total Employees', value:employees.length, color:'#3366ff' },
            { icon:'✅', label:'Active', value:employees.filter(e=>e.status==='active').length, color:'#22c55e' },
            { icon:'🌍', label:'Countries', value:[...new Set(employees.map(e=>e.country).filter(Boolean))].length || '—', color:'#8b5cf6' },
            { icon:'📋', label:'Open Jobs', value:jobs.filter(j=>j.status==='open').length, color:'#f59e0b' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'16px 18px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--text)' }}>{s.value}</div>
                <div style={{ fontSize:11, color:'var(--text2)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-nav" style={{ maxWidth:400, marginBottom:20 }}>
          {[['employees','👤 Team'],['jobs','💼 Job Board'],['payroll','💰 Payroll']].map(([key,label]) => (
            <button key={key} className={`tab-item ${tab===key?'active':''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* Employees tab */}
        {tab==='employees' && (
          employees.length===0 ? (
            <div className="card empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-title">No employees yet</div>
              <div className="empty-desc">Add employees to track their profiles, roles and performance</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
              {employees.map(emp => (
                <div key={emp.id} className="card card-hover" style={{ padding:20 }}>
                  <div style={{ display:'flex', gap:14, marginBottom:14 }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16, flexShrink:0 }}>
                      {emp.user?.first_name?.[0]}{emp.user?.last_name?.[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{emp.user?.first_name} {emp.user?.last_name}</div>
                      <div style={{ fontSize:13, color:'var(--text2)' }}>{emp.job_title}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{emp.country} · {emp.timezone}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <span className={`badge ${STATUS_BADGE[emp.status]}`}>{emp.status?.replace('_',' ')}</span>
                    <span className={`badge ${TYPE_BADGE[emp.employment_type]}`}>{emp.employment_type?.replace('_',' ')}</span>
                    {emp.salary && <span className="badge badge-gray">💰 {emp.currency} {Number(emp.salary).toLocaleString()}</span>}
                  </div>
                  {emp.skills?.length > 0 && (
                    <div style={{ marginTop:10, display:'flex', gap:4, flexWrap:'wrap' }}>
                      {emp.skills.slice(0,4).map(s => <span key={s} className="badge badge-gray" style={{ fontSize:10 }}>{s}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Jobs tab */}
        {tab==='jobs' && (
          <div>
            {jobs.length===0 ? (
              <div className="card empty-state">
                <div className="empty-icon">💼</div>
                <div className="empty-title">No job postings yet</div>
                <div className="empty-desc">Post jobs to attract global talent to your remote team</div>
                <button className="btn btn-primary" onClick={() => setShowNewJob(true)}>+ Post First Job</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {jobs.map(job => (
                  <div key={job.id} className="card" style={{ padding:20 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                      <div>
                        <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:6 }}>{job.title}</h3>
                        <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                          <span className={`badge ${job.status==='open'?'badge-green':job.status==='closed'?'badge-red':'badge-gray'}`}>{job.status}</span>
                          <span className="badge badge-gray">📍 {job.location}</span>
                          {job.salary_min && <span className="badge badge-blue">💰 {job.currency} {Number(job.salary_min).toLocaleString()} - {Number(job.salary_max).toLocaleString()}</span>}
                        </div>
                        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, maxWidth:600 }}>{job.description}</p>
                      </div>
                      <div style={{ fontSize:12, color:'var(--text3)', whiteSpace:'nowrap' }}>{new Date(job.created_at).toLocaleDateString()}</div>
                    </div>
                    {job.requirements && (
                      <div style={{ marginTop:12, padding:'10px 14px', background:'var(--bg2)', borderRadius:8, fontSize:13, color:'var(--text2)' }}>
                        <strong style={{ color:'var(--text)' }}>Requirements:</strong> {job.requirements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payroll tab */}
        {tab==='payroll' && (
          <div className="card empty-state">
            <div className="empty-icon">💰</div>
            <div className="empty-title">Payroll Records</div>
            <div className="empty-desc">Track salary payments, generate payslips, and manage compensation across your global team</div>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <span className="badge badge-green">✓ Multi-currency</span>
              <span className="badge badge-blue">✓ Global hiring</span>
              <span className="badge badge-amber">✓ Payment history</span>
            </div>
          </div>
        )}
      </div>

      {/* Post job modal */}
      {showNewJob && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div className="card scale-in" style={{ width:'100%', maxWidth:520, padding:32, maxHeight:'90vh', overflow:'auto' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>💼 Post a Job</h3>
            <form onSubmit={createJob} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="label">Job title *</label>
                <input className="input" placeholder="Senior React Developer" value={newJob.title} onChange={e => setNewJob({...newJob, title:e.target.value})} required />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea className="input" rows={4} style={{ resize:'none' }} placeholder="Describe the role and responsibilities..." value={newJob.description} onChange={e => setNewJob({...newJob, description:e.target.value})} required />
              </div>
              <div>
                <label className="label">Requirements</label>
                <textarea className="input" rows={3} style={{ resize:'none' }} placeholder="5+ years experience, React, TypeScript..." value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements:e.target.value})} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="label">Location</label>
                  <select className="input" value={newJob.location} onChange={e => setNewJob({...newJob, location:e.target.value})}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="input" value={newJob.currency||'USD'} onChange={e => setNewJob({...newJob, currency:e.target.value})}>
                    {['USD','EUR','GBP','RWF','KES','NGN','ZAR'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="label">Min salary</label>
                  <input className="input" type="number" placeholder="50000" value={newJob.salary_min||''} onChange={e => setNewJob({...newJob, salary_min:e.target.value})} />
                </div>
                <div>
                  <label className="label">Max salary</label>
                  <input className="input" type="number" placeholder="80000" value={newJob.salary_max||''} onChange={e => setNewJob({...newJob, salary_max:e.target.value})} />
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex:1 }} onClick={() => setShowNewJob(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={saving}>{saving?'Posting...':'Post Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
