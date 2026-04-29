import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { auth } from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser, theme } = useStore()
  const [form, setForm] = useState({ first_name: '', last_name: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ first_name: user.first_name || '', last_name: user.last_name || '' })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await auth.me() // update via PATCH
      // Actually we need a PATCH endpoint; for now just simulate
      toast.success('Profile updated! (demo)')
    } catch (err) {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 32 }}>
          <h2>Profile</h2>
          <form onSubmit={handleSubmit}>
            <div><label className="label">Email</label><input className="input" value={user?.email || ''} disabled /></div>
            <div><label className="label">First Name</label><input className="input" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
            <div><label className="label">Last Name</label><input className="input" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
            <button type="submit" className="btn-primary" disabled={loading}>Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  )
}
