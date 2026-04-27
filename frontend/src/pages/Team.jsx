import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws } from '../services/api'
import toast from 'react-hot-toast'

export default function Team() {
  const { theme } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteModal, setInviteModal] = useState({ show: false, workspaceId: null })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('developer')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workspacesRes = await ws.list()
        const workspacesData = workspacesRes.data.data
        const withMembers = await Promise.all(workspacesData.map(async w => {
          const membersRes = await ws.members(w.id)
          return { ...w, members: membersRes.data.data }
        }))
        setWorkspaces(withMembers)
      } catch (err) {
        toast.error('Failed to load team data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }
    setSaving(true)
    try {
      await ws.invite(inviteModal.workspaceId, { email: inviteEmail, role: inviteRole })
      toast.success(`Invitation sent to ${inviteEmail}`)
      // Refresh data
      const workspacesRes = await ws.list()
      const workspacesData = workspacesRes.data.data
      const withMembers = await Promise.all(workspacesData.map(async w => {
        const membersRes = await ws.members(w.id)
        return { ...w, members: membersRes.data.data }
      }))
      setWorkspaces(withMembers)
      setInviteModal({ show: false, workspaceId: null })
      setInviteEmail('')
      setInviteRole('developer')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member')
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role) => {
    const map = { owner: 'badge-brand', manager: 'badge-success', developer: 'badge-warning', viewer: 'badge-gray' }
    return map[role] || 'badge-gray'
  }

  if (loading) return <div className={theme} style={{ padding: '2rem', textAlign: 'center' }}>Loading team...</div>

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)', padding: '2rem 1rem' }}>
      <div className="container">
        <h1>👥 Team Members</h1>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem' }}>All members across your workspaces. You can invite new members to each workspace.</p>

        {workspaces.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No workspaces yet. Create a workspace first.</p>
          </div>
        ) : (
          workspaces.map(ws => (
            <div key={ws.id} className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{ws.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text2)', margin: 0 }}>{ws.members.length} members</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setInviteModal({ show: true, workspaceId: ws.id })}>+ Invite Member</button>
              </div>
              <div style={{ padding: '1rem' }}>
                {ws.members.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text3)' }}>No members yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                    {ws.members.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <div className="avatar" style={{ width: '2rem', height: '2rem', fontSize: '0.8rem' }}>{m.user.first_name?.[0]}{m.user.last_name?.[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.user.first_name} {m.user.last_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{m.user.email}</div>
                        </div>
                        <span className={`badge ${getRoleBadge(m.role)}`}>{m.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {inviteModal.show && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setInviteModal({ show: false, workspaceId: null })}>
          <div className="modal-content">
            <h3>Invite Member</h3>
            <input className="input" placeholder="Email address" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ marginTop: '0.5rem' }}>
              <option value="manager">Manager</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '0.25rem' }}>The user must already have an account.</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setInviteModal({ show: false, workspaceId: null })}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleInvite} disabled={saving}>{saving ? 'Inviting...' : 'Invite'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
