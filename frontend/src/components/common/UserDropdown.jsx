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
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#aaa' }}>Account</div>
        {items.map(item => (
          <button
            key={item.label}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 16px',
              background: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              marginBottom: '8px',
              cursor: 'pointer',
              color: item.danger ? '#ef4444' : 'white',
            }}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        {user?.first_name?.[0]}{user?.last_name?.[0]}
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: '#0f172a',
            borderRadius: '8px',
            minWidth: '160px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            padding: '8px 0',
            zIndex: 100,
          }}
        >
          {items.map(item => (
            <div
              key={item.label}
              onClick={() => { setOpen(false); item.onClick() }}
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: item.danger ? '#ef4444' : 'white',
              }}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
