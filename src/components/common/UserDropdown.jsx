import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { auth } from '../../services/api'
import toast from 'react-hot-toast'

export default function UserDropdown({ user, mobile }) {
  const [open, setOpen] = useState(false)
  const { logout } = useStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await auth.logout(localStorage.getItem('rtm_refresh')) } catch {}
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const items = [
    { icon: '👤', label: 'Profile', onClick: () => navigate('/profile') },
    { icon: '⚙️', label: 'Settings', onClick: () => navigate('/settings') },
    { icon: '🔔', label: 'Notifications', onClick: () => navigate('/notifications') },
    { icon: '🚪', label: 'Logout', onClick: handleLogout, danger: true },
  ]

  if (mobile) {
    return (
      <div className="mobile-user-menu">
        <div className="mobile-user-title">Account</div>
        {items.map(item => (
          <button key={item.label} onClick={item.onClick} className="mobile-user-btn" style={{ color: item.danger ? '#ef4444' : 'inherit' }}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="user-dropdown">
      <div className="user-avatar" onClick={() => setOpen(!open)}>
        {user?.first_name?.[0]}{user?.last_name?.[0]}
      </div>
      {open && (
        <div className="user-dropdown-menu">
          {items.map(item => (
            <div key={item.label} className="user-dropdown-item" style={{ color: item.danger ? '#ef4444' : 'inherit' }} onClick={() => { setOpen(false); item.onClick() }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
