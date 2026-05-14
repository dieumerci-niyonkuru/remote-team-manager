import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { chat } from '../services/api'
import toast from 'react-hot-toast'

const MOCK_CHANNELS = [
  { id: 'general', name: 'general', icon: '🌐', type: 'channel' },
  { id: 'engineering', name: 'engineering', icon: '🛠️', type: 'channel' },
  { id: 'design', name: 'design', icon: '🎨', type: 'channel' }
]

const MOCK_DMS = [
  { id: 'sarah', name: 'Sarah Connor', icon: '👩‍💻', status: 'online' },
  { id: 'john', name: 'John Doe', icon: '👨‍🚀', status: 'away' },
  { id: 'ai', name: 'AI Copilot', icon: '🤖', status: 'online' }
]

export default function Chat() {
  const { user, theme } = useStore()
  const [channels, setChannels] = useState(MOCK_CHANNELS)
  const [dms, setDms] = useState(MOCK_DMS)
  const [activeTab, setActiveTab] = useState('general')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showSidebar, setShowSidebar] = useState(true)
  const scrollRef = useRef()
  const wsRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setShowSidebar(true)
    }
    window.addEventListener('resize', handleResize)
    connectWS()
    return () => {
      window.removeEventListener('resize', handleResize)
      if (wsRef.current) wsRef.current.close()
    }
  }, [activeTab])

  const connectWS = () => {
    if (wsRef.current) wsRef.current.close()
    const token = localStorage.getItem('rtm_access')
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${protocol}://remote-team-manager-production.up.railway.app/ws/chat/${activeTab}/?token=${token}`
    
    wsRef.current = new WebSocket(wsUrl)
    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setMessages(prev => [...prev, data])
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const msg = {
      message: input,
      type: 'chat_message'
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    } else {
      const localMsg = {
        id: Date.now(),
        user: { first_name: user?.first_name || 'You', avatar: user?.avatar },
        content: input,
        timestamp: new Date().toISOString(),
        reactions: []
      }
      setMessages(prev => [...prev, localMsg])
    }
    setInput('')
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const addReaction = (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId || (m.timestamp && m.content === m.content)) { 
        const reactions = m.reactions || []
        const existing = reactions.find(r => r.emoji === emoji)
        if (existing) {
          return { ...m, reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) }
        }
        return { ...m, reactions: [...reactions, { emoji, count: 1 }] }
      }
      return m
    }))
  }

  const SidebarItem = ({ item, isActive, onClick }) => (
    <div onClick={onClick} style={{ 
      padding: '12px 16px', borderRadius: 14, cursor: 'pointer', marginBottom: 4, transition: '0.2s',
      background: isActive ? 'var(--brand)' : 'transparent',
      display: 'flex', alignItems: 'center', gap: 12
    }} className="nav-link-hover">
      <span style={{ fontSize: 18 }}>{item.icon}</span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: isActive ? '#fff' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </div>
        {item.status && <div style={{ fontSize: 10, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text3)', textTransform: 'uppercase', fontWeight: 700 }}>{item.status}</div>}
      </div>
      {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
    </div>
  )

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 80px)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        
        {/* Sidebar */}
        <div style={{ 
          width: isMobile ? '100%' : 300, 
          borderRight: '1px solid var(--border)', 
          background: 'var(--bg2)', 
          display: (isMobile && !showSidebar) ? 'none' : 'flex',
          flexDirection: 'column',
          position: isMobile ? 'absolute' : 'relative',
          inset: 0, zIndex: 10
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--brand)' }}>⚡</span> Intelligence
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px' }}>
            <div style={{ padding: '0 8px 12px', fontSize: 11, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2 }}>Channels</div>
            {channels.map(c => (
              <SidebarItem key={c.id} item={c} isActive={activeTab === c.id} onClick={() => { setActiveTab(c.id); if (isMobile) setShowSidebar(false) }} />
            ))}

            <div style={{ padding: '32px 8px 12px', fontSize: 11, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2 }}>Direct Nodes</div>
            {dms.map(d => (
              <SidebarItem key={d.id} item={d} isActive={activeTab === d.id} onClick={() => { setActiveTab(d.id); if (isMobile) setShowSidebar(false) }} />
            ))}
          </div>

          <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
               <div style={{ width: 44, height: 44, borderRadius: 14, overflow: 'hidden', border: '2px solid var(--brand)' }}>
                  {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ background: 'var(--bg)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
               </div>
               <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap' }}>{user?.first_name || 'Operator'}</div>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 800, textTransform:'uppercase' }}>● Fully Connected</div>
               </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ 
          flex: 1, display: (isMobile && showSidebar) ? 'none' : 'flex', flexDirection: 'column', background: 'var(--bg)' 
        }}>
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(var(--bg-rgb), 0.5)', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {isMobile && <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)' }}>☰</button>}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', letterSpacing:'-0.02em' }}>
                  #{channels.find(c => c.id === activeTab)?.name || dms.find(d => d.id === activeTab)?.name || 'General'}
                </h3>
                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 800 }}>8 NODES ACTIVE IN FREQUENCY</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
               <button className="btn-icon">📞</button>
               <button className="btn-icon">📹</button>
               <button className="btn-icon">🛰️</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                 <div style={{ fontSize: 64, marginBottom: 24 }}>📡</div>
                 <div style={{ fontWeight: 900, color: 'var(--text)', letterSpacing: 2 }}>ESTABLISHING LINK...</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={m.id || i} style={{ display: 'flex', gap: 18, animation: 'slideInUp 0.3s ease-out' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: 'var(--bg2)', border:'1px solid var(--border)' }}>
                  {(m.user?.avatar || m.avatar) ? <img src={m.user?.avatar || m.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{m.user?.first_name || m.username || m.sender}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>{new Date(m.timestamp || m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ background: 'var(--bg2)', padding: '14px 20px', borderRadius: '0 20px 20px 20px', color: 'var(--text2)', lineHeight: 1.6, fontSize: 15, maxWidth: '85%', display: 'inline-block', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
                    {m.content || m.message || m.text}
                  </div>
                  
                  {/* Reactions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {(m.reactions || []).map(r => (
                      <div key={r.emoji} onClick={() => addReaction(m.id, r.emoji)} style={{ padding: '6px 12px', borderRadius: 10, background: 'var(--brand-bg)', border: '1px solid var(--brand)', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', transition:'0.2s' }}>
                        <span>{r.emoji}</span>
                        <span style={{ fontWeight: 900, color: 'var(--brand)', fontSize: 11 }}>{r.count}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', gap:4, opacity:0.3 }} className="reaction-trigger">
                      {['👍', '🔥', '🚀', '❤️'].map(e => (
                        <button key={e} onClick={() => addReaction(m.id, e)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, padding: 4 }}>{e}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '32px', borderTop: '1px solid var(--border)', background: 'rgba(var(--bg-rgb), 0.3)' }}>
            <form onSubmit={sendMessage} style={{ position: 'relative', maxWidth: 1000, margin: '0 auto' }}>
              <input 
                className="input" 
                style={{ padding: '20px 120px 20px 32px', borderRadius: 20, fontSize: 16, background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }} 
                placeholder={`Type a transmission to #${activeTab}...`} 
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 12 }}>
                 <button type="button" className="btn-icon" style={{ fontSize:20 }}>📎</button>
                 <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 900, letterSpacing:1 }}>SEND</button>
              </div>
            </form>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 16, fontWeight: 800, textAlign:'center', letterSpacing:0.5 }}>
              PRESS ENTER TO TRANSMIT · SHIFT+ENTER FOR NEW LINE · USE @MENTIONS TO TARGET NODES
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
