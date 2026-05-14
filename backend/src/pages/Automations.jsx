import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { automation, ws } from '../services/api'
import toast from 'react-hot-toast'

export default function Automations() {
  const { theme } = useStore()
  const [rules, setRules] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ trigger: 'task_done', action: 'notify_manager', workspace: '' })

  useEffect(() => {
    Promise.all([automation.list(), ws.list()])
      .then(([aRes, wRes]) => {
        setRules(aRes.data)
        setWorkspaces(wRes.data.data || wRes.data)
      })
      .catch(() => toast.error('Failed to load automations'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreateRule = async (e) => {
    e.preventDefault()
    if (!form.workspace) { toast.error('Select a workspace'); return }
    try {
      const res = await automation.create(form)
      setRules([...rules, res.data])
      setShowCreate(false)
      toast.success('Automation rule active! ⚡')
    } catch {
      toast.error('Failed to create automation')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return
    try {
      await automation.delete(id)
      setRules(rules.filter(r => r.id !== id))
      toast.success('Rule deleted')
    } catch {
      toast.error('Failed to delete rule')
    }
  }

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--text)' }}>
              Workflow Automation
            </h1>
            <p style={{ color: 'var(--text2)', marginTop: 4 }}>Create smart rules to automate repetitive tasks in your team.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Rule</button>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rules.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-icon">⚡</div>
                <div className="empty-title">No automations yet</div>
                <div className="empty-desc">Create IF-THIS-THEN-THAT rules to make your project run on autopilot.</div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Rule</button>
              </div>
            ) : rules.map(rule => (
              <div key={rule.id} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>When</span>
                    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {rule.trigger === 'task_done' ? 'Task is marked Done' : 'Deadline is near'}
                    </div>
                  </div>
                  <div style={{ color: 'var(--brand)', fontSize: 20 }}>➔</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Then</span>
                    <div style={{ background: 'var(--brand-bg)', color: 'var(--brand)', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                      {rule.action === 'notify_manager' ? 'Notify the Manager' : 'Assign default member'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="badge badge-green">Active</span>
                  <button onClick={() => handleDelete(rule.id)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18 }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="card scale-in" style={{ width: '100%', maxWidth: 500, padding: 36 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>⚡ Create Automation</h3>
            <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="label">Workspace</label>
                <select className="input" value={form.workspace} onChange={e => setForm({...form, workspace: e.target.value})} required>
                  <option value="">Select Workspace</option>
                  {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">IF (Trigger)</label>
                <select className="input" value={form.trigger} onChange={e => setForm({...form, trigger: e.target.value})}>
                  <option value="task_done">Task is marked as Done</option>
                  <option value="deadline_near">Deadline is near</option>
                  <option value="task_created">New task is created</option>
                </select>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 24 }}>⬇</div>
              <div>
                <label className="label">THEN (Action)</label>
                <select className="input" value={form.action} onChange={e => setForm({...form, action: e.target.value})}>
                  <option value="notify_manager">Send Notification to Manager</option>
                  <option value="assign_member">Assign to Default Member</option>
                  <option value="log_time">Auto-log 1 hour of time</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Activate Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
