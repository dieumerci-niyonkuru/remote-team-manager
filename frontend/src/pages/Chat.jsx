import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws, chat } from '../services/api'
import toast from 'react-hot-toast'

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
    if (activeWs) loadChannels()
  }, [activeWs])

  const loadChannels = async () => {
    try {
      const res = await chat.channels(activeWs.id)
      setChannels(res.data.data || [])
      if (res.data.data?.length) {
        setActiveChannel(res.data.data[0])
        loadMessages(res.data.data[0].id)
      }
    } catch (err) { console.error(err) }
  }

  const loadMessages = async (channelId) => {
    try {
      const res = await chat.messages(channelId)
      setMessages(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !activeChannel) return
    setSending(true)
    try {
      const res = await chat.sendMessage(activeChannel.id, { content: newMsg })
      setMessages([...messages, res.data.data])
      setNewMsg('')
    } catch (err) { toast.error('Failed to send') } finally { setSending(false) }
  }

  const createChannel = async (e) => {
    e.preventDefault()
    if (!newChannel.name.trim()) { toast.error('Channel name required'); return }
    setSending(true)
    try {
      const res = await chat.createChannel(activeWs.id, newChannel)
      setChannels([...channels, res.data.data])
      setActiveChannel(res.data.data)
      setMessages([])
      setShowNewChannel(false)
      setNewChannel({ name: '', description: '' })
      toast.success('Channel created!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setSending(false) }
  }

  const deleteChannel = async (channelId) => {
    if (!confirm('Delete this channel?')) return
    try {
      await chat.deleteChannel(activeWs.id, channelId)
      setChannels(channels.filter(ch => ch.id !== channelId));
      if (activeChannel?.id === channelId) {
        setActiveChannel(channels.find(ch => ch.id !== channelId) || null);
      }
      toast.success('Channel deleted')
    } catch (err) { toast.error('Failed to delete channel') }
  }

  if (loading) return <div className={theme} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  return (
    <div className={theme} style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
          <select value={activeWs?.id || ''} onChange={e => setActiveWs(workspaces.find(w => w.id === e.target.value))} className="input" style={{ width: '100%' }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, padding: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 'bold', fontSize: 12 }}>Channels</span>
            <button className="btn-sm" onClick={() => setShowNewChannel(true)}>+</button>
          </div>
          {channels.map(ch => (
            <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div
                onClick={() => { setActiveChannel(ch); loadMessages(ch.id) }}
                style={{ flex: 1, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: activeChannel?.id === ch.id ? 'var(--brand-bg)' : 'transparent', color: activeChannel?.id === ch.id ? '#3366ff' : 'var(--text2)' }}
              >
                # {ch.name}
              </div>
              <button onClick={() => deleteChannel(ch.id)} className="btn-icon" style={{ fontSize: 12 }}>🗑</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeChannel ? (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
              <h3># {activeChannel.name}</h3>
              <small>{activeChannel.description}</small>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: 12 }}>
                  <strong>{msg.sender?.first_name} {msg.sender?.last_name}:</strong> {msg.content}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input type="text" className="input" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
              <button type="submit" className="btn-primary" disabled={sending}>Send</button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Select a channel to start chatting</div>
        )}
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowNewChannel(false)}>
          <div className="modal-content">
            <h3>Create Channel</h3>
            <form onSubmit={createChannel}>
              <input className="input" placeholder="Channel name" value={newChannel.name} onChange={e => setNewChannel({ ...newChannel, name: e.target.value })} required />
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
