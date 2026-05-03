import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { chat } from '../services/api'
import toast from 'react-hot-toast'

export default function Chat() {
  const { user, theme } = useStore()
  const [channels, setChannels] = useState([])
  const [dms, setDms] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const ws = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadSidebar()
  }, [])

  const loadSidebar = async () => {
    try {
      const [chRes, dmRes] = await Promise.all([chat.channels(), chat.dms()])
      setChannels(chRes.data)
      setDms(dmRes.data)
      if (chRes.data.length > 0 && !activeChannel) {
        selectChannel(chRes.data[0])
      }
    } catch (err) {
      toast.error('Failed to load chat channels')
    }
  }

  const selectChannel = async (channel) => {
    setActiveChannel(channel)
    try {
      const res = await chat.messages({ channel: channel.id })
      setMessages(res.data)
      connectWebSocket(channel.id)
    } catch (err) {
      toast.error('Failed to load messages')
    }
  }

  const connectWebSocket = (channelId) => {
    if (ws.current) {
      ws.current.close()
    }
    const token = localStorage.getItem('rtm_access')
    // Build websocket URL
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${wsScheme}://${window.location.host}/ws/chat/${channelId}/?token=${token}`
    
    ws.current = new WebSocket(wsUrl)
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages(prev => [...prev, data])
      scrollToBottom()
    }
    
    ws.current.onerror = () => {
      // toast.error('WebSocket connection error')
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !ws.current) return
    ws.current.send(JSON.stringify({ message: inputText }))
    setInputText('')
  }

  return (
    <div className={theme} style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ width: 280, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Chat</h2>
        </div>
        
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 12 }}>
              Channels
            </div>
            {channels.map(c => (
              <button 
                key={c.id}
                onClick={() => selectChannel(c)}
                style={{ 
                  width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none',
                  background: activeChannel?.id === c.id ? 'var(--brand-bg)' : 'transparent',
                  color: activeChannel?.id === c.id ? 'var(--brand)' : 'var(--text)',
                  fontWeight: activeChannel?.id === c.id ? 600 : 500,
                  cursor: 'pointer', transition: 'var(--transition)'
                }}>
                # {c.name}
              </button>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 12 }}>
              Direct Messages
            </div>
            {dms.map(dm => (
              <button 
                key={dm.id}
                style={{ 
                  width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: 'var(--text)', cursor: 'pointer'
                }}>
                👤 DM
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {activeChannel ? (
          <>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}># {activeChannel.name}</h3>
            </div>
            
            {/* Messages */}
            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                    {m.username ? m.username[0].toUpperCase() : (m.user?.first_name ? m.user.first_name[0] : '?')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                        {m.username || m.user?.first_name || 'User'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(m.created_at || m.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5 }}>
                      {m.content || m.message}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: 24, background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
                <input 
                  className="input" 
                  style={{ flex: 1, padding: '14px 18px', borderRadius: 24, background: 'var(--bg-card)' }}
                  placeholder={`Message #${activeChannel.name}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 24, padding: '0 24px' }} disabled={!inputText.trim()}>
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ flex: 1 }}>
            <div className="empty-icon">💬</div>
            <div className="empty-title">Select a channel</div>
            <div className="empty-desc">Choose a channel from the sidebar to start chatting</div>
          </div>
        )}
      </div>
    </div>
  )
}
