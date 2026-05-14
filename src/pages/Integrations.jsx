import { useState, useEffect } from 'react'
import { useStore } from '../store'
import toast from 'react-hot-toast'
import { integrations as api } from '../services/api'

const INTEGRATIONS = [
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'Link commits to tasks. Track code changes directly in your workspace.',
    color: '#24292e',
    bgColor: 'rgba(36,41,46,0.1)',
    fields: [{ key: 'repo', label: 'Repository URL', placeholder: 'https://github.com/org/repo' }],
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: 'Sync Notion pages as Wiki articles. Keep docs always up-to-date.',
    color: '#000000',
    bgColor: 'rgba(0,0,0,0.07)',
    fields: [{ key: 'api_key', label: 'Notion API Key', placeholder: 'secret_...' }, { key: 'db_id', label: 'Database ID', placeholder: 'Notion database ID' }],
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    icon: '📂',
    description: 'Attach Google Drive files to tasks. Live file sync for your team.',
    color: '#4285F4',
    bgColor: 'rgba(66,133,244,0.1)',
    fields: [{ key: 'folder_id', label: 'Folder ID', placeholder: 'Google Drive folder ID' }],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Forward notifications to a Slack channel. Never miss an update.',
    color: '#4A154B',
    bgColor: 'rgba(74,21,75,0.1)',
    fields: [{ key: 'webhook', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' }],
  },
  {
    id: 'email',
    name: 'Email Notifications',
    icon: '📧',
    description: 'Configure scheduled email reports and digest notifications.',
    color: '#EA4335',
    bgColor: 'rgba(234,67,53,0.1)',
    fields: [{ key: 'email', label: 'Notification Email', placeholder: 'team@yourcompany.com' }],
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    icon: '🔗',
    description: 'Connect any app using webhooks. Fully customizable event system.',
    color: '#3366ff',
    bgColor: 'rgba(51,102,255,0.1)',
    fields: [{ key: 'url', label: 'Webhook Endpoint', placeholder: 'https://yourapp.com/webhook' }],
  },
]

export default function Integrations() {
  const { theme, activeWorkspace } = useStore()
  const [connected, setConnected] = useState({})
  const [configs, setConfigs] = useState({})
  const [dbIntegrations, setDbIntegrations] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeWorkspace) {
      loadIntegrations()
    }
  }, [activeWorkspace])

  const loadIntegrations = async () => {
    try {
      const res = await api.list(activeWorkspace.id)
      setDbIntegrations(res.data)
      const conn = {}
      const cfgs = {}
      res.data.forEach(item => {
        conn[item.type] = item.is_active
        cfgs[item.type] = item.config
      })
      setConnected(conn)
      setConfigs(cfgs)
    } catch (e) {
      console.error('Failed to load integrations:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (id) => {
    setExpanded(expanded === id ? null : id)
  }

  const handleConnect = async (type) => {
    const intg = INTEGRATIONS.find(i => i.id === type)
    const cfg = configs[type] || {}
    if (!intg || !intg.fields.every(f => cfg[f.key])) {
      toast.error('Please fill in all required fields.')
      return
    }

    try {
      const existing = dbIntegrations.find(i => i.type === type)
      if (existing) {
        await api.update(existing.id, { config: cfg, is_active: true })
      } else {
        await api.connect({
          workspace: activeWorkspace.id,
          type: type,
          config: cfg,
          is_active: true
        })
      }
      toast.success(`${intg.name} connected! 🎉`)
      loadIntegrations()
      setExpanded(null)
    } catch (e) {
      toast.error(`Failed to connect ${intg.name}`)
    }
  }

  const handleDisconnect = async (type) => {
    const intg = INTEGRATIONS.find(i => i.id === type)
    const existing = dbIntegrations.find(i => i.type === type)
    if (!existing) return

    try {
      await api.delete(existing.id)
      toast.success(`${intg.name} disconnected.`)
      loadIntegrations()
    } catch (e) {
      toast.error(`Failed to disconnect ${intg.name}`)
    }
  }

  if (loading) return <div className="p-20 text-center text-gray-500 font-bold">Initializing integrations...</div>
  if (!activeWorkspace) return <div className="p-20 text-center text-gray-500 font-bold">Please select a workspace first.</div>

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--text)' }}>
            🔗 Integrations
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: 6 }}>
            Connect your favorite tools to build a unified workflow. All your data, in one place.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {INTEGRATIONS.map(intg => {
            const isConnected = connected[intg.id]
            const isExpanded = expanded === intg.id
            const cfg = configs[intg.id] || {}
            return (
              <div key={intg.id} className="card" style={{ padding: 24, border: isConnected ? `1.5px solid ${intg.color}` : '1px solid var(--border)', transition: 'var(--transition)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: intg.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {intg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {intg.name}
                      {isConnected && <span className="badge badge-green" style={{ fontSize: 10 }}>Connected</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{intg.description}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {intg.fields.map(f => (
                      <div key={f.key}>
                        <label className="label">{f.label}</label>
                        <input
                          className="input"
                          placeholder={f.placeholder}
                          value={cfg[f.key] || ''}
                          onChange={e => setConfigs(prev => ({
                            ...prev,
                            [intg.id]: { ...(prev[intg.id] || {}), [f.key]: e.target.value }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {isConnected ? (
                    <>
                      <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => handleToggle(intg.id)}>
                        ⚙️ Configure
                      </button>
                      <button className="btn btn-danger" style={{ flex: 1, fontSize: 13 }} onClick={() => handleDisconnect(intg.id)}>
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => handleToggle(intg.id)}>
                        {isExpanded ? 'Cancel' : 'Configure'}
                      </button>
                      <button className="btn btn-primary" style={{ flex: 1, fontSize: 13 }} onClick={() => isExpanded ? handleConnect(intg.id) : handleToggle(intg.id)}>
                        {isExpanded ? 'Connect' : `+ Connect ${intg.name}`}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
