import { useState } from 'react'
import { useStore } from '../store'
import api from '../services/api'
import toast from 'react-hot-toast'

const TIMEZONES = ['UTC', 'Africa/Kigali', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney']
const LANGUAGES = [{ code: 'en', label: '🇺🇸 English' }, { code: 'fr', label: '🇫🇷 Français' }, { code: 'rw', label: '🇷🇼 Kinyarwanda' }]
const CURRENCIES = ['USD', 'EUR', 'RWF', 'GBP', 'JPY', 'AED']

export default function Settings() {
  const { theme, setTheme, lang, setLang, user } = useStore()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    timezone: 'UTC',
    currency: 'USD',
  })
  const [security, setSecurity] = useState({ current_password: '', new_password: '', confirm_password: '', twofa_enabled: false })
  const [notifs, setNotifs] = useState({ email_digest: true, push_alerts: true, task_updates: true, ai_insights: true, mentions: true, deadline_reminders: true })
  const [saving, setSaving] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/users/me/', profile)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally { setSaving(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (security.new_password !== security.confirm_password) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await api.post('/users/change-password/', { old_password: security.current_password, new_password: security.new_password })
      toast.success('Password changed!')
      setSecurity(s => ({...s, current_password:'', new_password:'', confirm_password:''}))
    } catch {
      toast.error('Failed to change password')
    } finally { setSaving(false) }
  }

  const TABS = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'appearance', icon: '🎨', label: 'Appearance' },
    { id: 'security', icon: '🔐', label: 'Security & 2FA' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'billing', icon: '💳', label: 'Billing & Plan' },
  ]

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: 16, width: 220, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12, padding: '0 8px' }}>Settings</div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tab === t.id ? 'var(--brand-bg)' : 'transparent', color: tab === t.id ? 'var(--brand)' : 'var(--text)', fontWeight: tab === t.id ? 700 : 500, fontSize: 14, transition: 'var(--transition)', marginBottom: 2 }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>Profile Settings</h2>
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><label className="label">First Name</label><input className="input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} /></div>
                  <div style={{ flex: 1 }}><label className="label">Last Name</label><input className="input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} /></div>
                </div>
                <div><label className="label">Email Address</label><input className="input" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">Timezone</label>
                    <select className="input" value={profile.timezone} onChange={e => setProfile({...profile, timezone: e.target.value})}>
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label">Currency</label>
                    <select className="input" value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>{saving ? 'Saving...' : '💾 Save Profile'}</button>
              </form>
            </div>
          )}

          {/* APPEARANCE */}
          {tab === 'appearance' && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>Appearance</h2>
              <div style={{ marginBottom: 28 }}>
                <label className="label">Theme</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {[['dark','🌙 Dark'], ['light','☀️ Light']].map(([val, label]) => (
                    <button key={val} onClick={() => setTheme(val)}
                      style={{ padding: '14px 28px', borderRadius: 12, border: `2px solid ${theme === val ? 'var(--brand)' : 'var(--border)'}`, background: theme === val ? 'var(--brand-bg)' : 'transparent', color: theme === val ? 'var(--brand)' : 'var(--text)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'var(--transition)' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Language</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)}
                      style={{ padding: '12px 20px', borderRadius: 12, border: `2px solid ${lang === l.code ? 'var(--brand)' : 'var(--border)'}`, background: lang === l.code ? 'var(--brand-bg)' : 'transparent', color: lang === l.code ? 'var(--brand)' : 'var(--text)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'var(--transition)' }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>Change Password</h2>
                <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div><label className="label">Current Password</label><input className="input" type="password" value={security.current_password} onChange={e => setSecurity({...security, current_password: e.target.value})} required /></div>
                  <div><label className="label">New Password</label><input className="input" type="password" value={security.new_password} onChange={e => setSecurity({...security, new_password: e.target.value})} required /></div>
                  <div><label className="label">Confirm New Password</label><input className="input" type="password" value={security.confirm_password} onChange={e => setSecurity({...security, confirm_password: e.target.value})} required /></div>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>🔒 Update Password</button>
                </form>
              </div>
              <div className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>Two-Factor Authentication (2FA)</h3>
                    <p style={{ color: 'var(--text2)', fontSize: 13 }}>Adds an extra layer of security. You'll need your phone each time you log in.</p>
                  </div>
                  <button onClick={() => { setSecurity(s => ({...s, twofa_enabled: !s.twofa_enabled})); toast.success(security.twofa_enabled ? '2FA disabled' : '2FA enabled! ✅') }}
                    className={`btn ${security.twofa_enabled ? 'btn-danger' : 'btn-primary'}`} style={{ flexShrink: 0 }}>
                    {security.twofa_enabled ? '🔓 Disable 2FA' : '🔐 Enable 2FA'}
                  </button>
                </div>
                {security.twofa_enabled && (
                  <div style={{ marginTop: 20, padding: 16, background: 'var(--brand-bg)', borderRadius: 10, fontSize: 13, color: 'var(--brand)' }}>
                    ✅ 2FA is active. You will be asked for a verification code on each login. Connect an authenticator app (e.g., Google Authenticator) to your account.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>Notification Preferences</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['email_digest', '📧 Weekly Email Digest', 'Receive a summary of activity every Monday'],
                  ['push_alerts', '📱 Push Notifications', 'Receive alerts on your device (requires PWA install)'],
                  ['task_updates', '📋 Task Updates', 'When tasks are created, updated, or completed'],
                  ['ai_insights', '🧠 AI Insights', 'Burnout warnings, project risk alerts'],
                  ['mentions', '@ Mentions', 'When someone mentions you in chat'],
                  ['deadline_reminders', '⏰ Deadline Reminders', '24h and 1h before due dates'],
                ].map(([key, label, desc], i, arr) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{label}</div>
                      <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                    </div>
                    <button onClick={() => { setNotifs(n => ({...n, [key]: !n[key]})); toast.success('Preference updated') }}
                      style={{ width: 48, height: 26, borderRadius: 50, border: 'none', background: notifs[key] ? 'var(--brand)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 3, left: notifs[key] ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'var(--transition)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BILLING */}
          {tab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Current Plan</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: 'var(--brand-bg)', borderRadius: 12, border: '1.5px solid var(--brand)' }}>
                  <div style={{ fontSize: 36 }}>🚀</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--brand)' }}>Free Plan</div>
                    <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>Up to 3 workspaces · Up to 5 members</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => window.location.href='/pricing'}>⬆️ Upgrade Plan</button>
                </div>
              </div>
              <div className="card" style={{ padding: 32 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 16 }}>Payment Methods</h3>
                <div style={{ padding: '16px 20px', background: 'var(--bg2)', borderRadius: 10, color: 'var(--text2)', fontSize: 13, textAlign: 'center' }}>
                  No payment method added. <button style={{ color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => alert('Stripe integration — add your STRIPE_SECRET_KEY to the backend.')}>+ Add Card (Stripe)</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
