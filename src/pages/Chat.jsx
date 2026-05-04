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
  const [typing, setTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const ws = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setShowSidebar(true)
    }
    window.addEventListener('resize', handleResize)
    loadSidebar()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadSidebar = async () => {
    try {
      const [chRes, dmRes] = await Promise.all([chat.channels(), chat.dms()])
      setChannels(chRes.data)
      setDms(dmRes.data)
      if (chRes.data.length > 0 && !activeChannel) selectChannel(chRes.data[0])
    } catch (err) { toast.error('System synchronization failed') }
  }

  const selectChannel = async (channel) => {
    setActiveChannel(channel)
    if (isMobile) setShowSidebar(false)
    try {
      const res = await chat.messages({ channel: channel.id })
      setMessages(res.data)
      connectWebSocket(channel.id)
    } catch (err) { toast.error('Failed to link channel') }
  }

  const connectWebSocket = (channelId) => {
    if (ws.current) ws.current.close()
    const token = localStorage.getItem('rtm_access')
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${wsScheme}://${window.location.host}/ws/chat/${channelId}/?token=${token}`
    ws.current = new WebSocket(wsUrl)
    
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'typing') {
        if (data.user_id !== user.id) {
          setTyping(true)
          setTimeout(() => setTyping(false), 3000)
        }
      } else {
        setMessages(prev => [...prev, data])
        setTyping(false)
      }
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !ws.current) return
    ws.current.send(JSON.stringify({ message: inputText }))
    setInputText('')
  }

  return (
    <div className={theme} style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--bg)', position:'relative', overflow:'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: isMobile ? '100%' : 280, 
        background: 'var(--bg2)', 
        borderRight: '1px solid var(--border)', 
        display: (isMobile && !showSidebar) ? 'none' : 'flex', 
        flexDirection: 'column',
        position: isMobile ? 'absolute' : 'relative',
        inset: isMobile ? 0 : 'auto',
        zIndex: 10
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', letterSpacing:'-0.02em' }}>Communication</h2>
        </div>
        
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing:1, marginBottom: 12, paddingLeft: 12 }}>Nodes</div>
            {channels.map(c => (
              <button key={c.id} onClick={() => selectChannel(c)}
                style={{ 
                  width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 12, border: 'none', marginBottom:4,
                  background: activeChannel?.id === c.id ? 'var(--brand)' : 'transparent',
                  color: activeChannel?.id === c.id ? '#fff' : 'var(--text2)',
                  fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                }}>
                # {c.name}
              </button>
            ))}
          </div>

          <div>
             <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing:1, marginBottom: 12, paddingLeft: 12 }}>Direct Links</div>
             {dms.length === 0 && <div style={{ fontSize:13, color:'var(--text3)', paddingLeft:12 }}>No active links.</div>}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div style={{ 
        flex: 1, 
        display: (isMobile && showSidebar) ? 'none' : 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg)',
        width: '100%'
      }}>
        {activeChannel ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(var(--bg-card-rgb), 0.5)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', gap:16 }}>
              {isMobile && <button onClick={() => setShowSidebar(true)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>⬅</button>}
              <div className="activity-dot" />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{activeChannel.name}</h3>
            </div>
            
            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap:20 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, maxWidth:isMobile ? '100%' : '80%' }}>
                  <div style={{ width: 40, height: 40, borderRadius:12, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'var(--brand)', flexShrink:0 }}>
                    {(m.username || m.user?.first_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom:4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{m.username || m.user?.first_name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight:700 }}>{new Date(m.created_at || m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.6, background:'var(--bg2)', padding:'12px 16px', borderRadius:'0 16px 16px 16px' }}>
                      {m.content || m.message}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: 24, background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
                <input className="input" style={{ flex: 1, borderRadius: 16, padding: '16px 20px', background:'var(--bg2)', border:'none' }} 
                  placeholder="Transmit message..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 16, width:56, height:56, display:'flex', alignItems:'center', justifyContent:'center', padding:0 }} disabled={!inputText.trim()}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'var(--text3)' }}>
             <div style={{ fontSize:64 }}>💬</div>
             <div style={{ fontWeight:800 }}>SELECT A FREQUENCY TO START</div>
             {isMobile && <button onClick={() => setShowSidebar(true)} className="btn btn-primary">Show Channels</button>}
          </div>
        )}
      </div>
    </div>
  )
}
