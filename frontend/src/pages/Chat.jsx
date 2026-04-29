import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws, chat } from '../services/api'
import toast from 'react-hot-toast'

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '✅', '🚀']

export default function Chat() {
  const { theme } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    ws.list().then(r => {
      setWorkspaces(r.data.data)
      if (r.data.data.length) setActiveWs(r.data.data[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeWs) {
      loadChannels()
    }
  }, [activeWs])

  const loadChannels = async () => {
    try {
      const res = await chat.channels(activeWs.id)
      setChannels(res.data.data || [])
      if (res.data.data?.length) {
        setActiveChannel(res.data.data[0])
        loadMessages(res.data.data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadMessages = async (channelId) => {
    try {
      const res = await chat.messages(channelId)
      setMessages(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !activeChannel) return
    setSending(true)
    try {
      const res = await chat.sendMessage(activeChannel.id, { content: newMsg })
      setMessages([...messages, res.data.data])
      setNewMsg('')
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await chat.addReaction(messageId, emoji)
      loadMessages(activeChannel.id) // refresh to show reactions
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateChannel = async (e) => {
    e.preventDefault()
    if (!newChannel.name.trim()) {
      toast.error('Channel name required')
      return
    }
    setSending(true)
    try {
      const res = await chat.createChannel(activeWs.id, newChannel)
      setChannels([...channels, res.data.data])
      setActiveChannel(res.data.data)
      setMessages([])
      setShowNewChannel(false)
      setNewChannel({ name: '', description: '' })
      toast.success('Channel created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create channel')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className={theme}>Loading...</div>

  return (
    <div className={theme} style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
          <select value={activeWs?.id || ''} onChange={e => setActiveWs(workspaces.find(w => w.id === e.target.value))} className="input" style={{ width: '100%' }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, padding: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 'bold', fontSize: 12, color: 'var(--text2)' }}>Channels</span>
            <button className="btn-sm btn-secondary" onClick={() => setShowNewChannel(true)} style={{ padding: '2px 6px' }}>+</button>
          </div>
          {channels.map(ch => (
            <div
              key={ch.id}
              onClick={() => { setActiveChannel(ch); loadMessages(ch.id) }}
              style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: activeChannel?.id === ch.id ? 'var(--brand-bg)' : 'transparent', color: activeChannel?.id === ch.id ? '#3366ff' : 'var(--text2)', marginBottom: 2 }}
            >
              # {ch.name}
            </div>
          ))}
        </div>
      </div>

      {/* Chat main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeChannel ? (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
              <h3 style={{ margin: 0 }}># {activeChannel.name}</h3>
              <small>{activeChannel.description}</small>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>
                    {msg.sender?.first_name?.[0]}{msg.sender?.last_name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div><strong>{msg.sender?.first_name} {msg.sender?.last_name}</strong> <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(msg.created_at).toLocaleTimeString()}</span></div>
                    <div style={{ marginTop: 4 }}>{msg.content}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {EMOJIS.map(emoji => (
                        <button key={emoji} onClick={() => handleAddReaction(msg.id, emoji)} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', opacity: 0.6 }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>{emoji}</button>
                      ))}
                    </div>
                    {msg.reactions && Object.entries(msg.reactions).length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <span key={emoji} style={{ background: 'var(--brand-bg)', padding: '2px 6px', borderRadius: 12, fontSize: 11 }}>{emoji} {count}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: 8 }}>
              <input className="input" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder={`Message #${activeChannel.name}`} style={{ flex: 1 }} />
              <button type="submit" className="btn-primary" disabled={sending}>Send</button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text2)' }}>Select a channel to start chatting</div>
        )}
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowNewChannel(false)}>
          <div className="modal-content">
            <h3>Create Channel</h3>
            <form onSubmit={handleCreateChannel}>
              <input className="input" placeholder="Channel name" value={newChannel.name} onChange={e => setNewChannel({ ...newChannel, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required />
              <textarea className="input-textarea" placeholder="Description" rows="2" value={newChannel.description} onChange={e => setNewChannel({ ...newChannel, description: e.target.value })} />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowNewChannel(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={sending}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
