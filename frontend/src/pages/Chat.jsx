import { useEffect, useState, useRef } from 'react'
import { useStore } from '../store'
import { useT } from '../i18n'
import { ws } from '../services/api'
import api from '../services/api'
import toast from 'react-hot-toast'

const EMOJIS = ['👍','❤️','😂','🎉','🔥','👀','✅','🚀']

export default function Chat() {
  const { theme, lang, user } = useStore()
  const t = useT(lang)
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [showReactions, setShowReactions] = useState(null)
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannel, setNewChannel] = useState({ name:'', description:'' })
  const messagesEnd = useRef(null)

  useEffect(() => {
    ws.list().then(r => {
      setWorkspaces(r.data.data)
      if (r.data.data.length) {
        setActiveWs(r.data.data[0])
        loadChannels(r.data.data[0].id)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const loadChannels = async wid => {
    try {
      const r = await api.get(`/workspaces/${wid}/channels/`)
      setChannels(r.data.data || [])
      if (r.data.data?.length) {
        setActiveChannel(r.data.data[0])
        loadMessages(r.data.data[0].id)
      }
    } catch { setChannels([]) }
  }

  const loadMessages = async cid => {
    try {
      const r = await api.get(`/channels/${cid}/messages/`)
      setMessages(r.data.data || [])
    } catch { setMessages([]) }
  }

  const sendMessage = async e => {
    e.preventDefault()
    if (!newMsg.trim() || !activeChannel) return
    try {
      const r = await api.post(`/channels/${activeChannel.id}/messages/`, { content: newMsg })
      setMessages(p => [...p, r.data.data])
      setNewMsg('')
    } catch { toast.error('Failed to send') }
  }

  const addReaction = async (msgId, emoji) => {
    try {
      await api.post(`/messages/${msgId}/reactions/`, { emoji })
      loadMessages(activeChannel.id)
      setShowReactions(null)
    } catch {}
  }

  const createChannel = async e => {
    e.preventDefault()
    try {
      const r = await api.post(`/workspaces/${activeWs.id}/channels/`, newChannel)
      setChannels(p => [...p, r.data.data])
      setActiveChannel(r.data.data)
      setMessages([])
      setShowNewChannel(false)
      setNewChannel({ name:'', description:'' })
      toast.success('Channel created!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div className={theme} style={{ display:'flex', height:'calc(100vh - 64px)', background:'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ width:220, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        {/* Workspace selector */}
        <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)' }}>
          <select value={activeWs?.id||''} onChange={e => {
            const w = workspaces.find(x => x.id===e.target.value)
            setActiveWs(w); loadChannels(w.id)
          }} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 8px', fontSize:12, color:'var(--text)', outline:'none' }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        {/* Channels */}
        <div style={{ flex:1, overflow:'auto', padding:8 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 6px 4px', marginBottom:4 }}>
            <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em' }}>Channels</span>
            <button onClick={() => setShowNewChannel(true)} style={{ background:'none', border:'none', color:'var(--text2)', fontSize:18, cursor:'pointer', lineHeight:1 }}>+</button>
          </div>
          {channels.map(ch => (
            <div key={ch.id} onClick={() => { setActiveChannel(ch); loadMessages(ch.id) }}
              style={{ padding:'7px 10px', borderRadius:8, fontSize:13, fontWeight:activeChannel?.id===ch.id?600:400, color:activeChannel?.id===ch.id?'#3366ff':'var(--text2)', background:activeChannel?.id===ch.id?'var(--brand-bg)':'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:14 }}>#</span> {ch.name}
            </div>
          ))}
          {channels.length===0 && !loading && (
            <div style={{ padding:'12px 8px', fontSize:12, color:'var(--text3)', textAlign:'center' }}>
              No channels yet
              <br /><button onClick={() => setShowNewChannel(true)} style={{ marginTop:8, background:'var(--brand-bg)', color:'#3366ff', border:'none', borderRadius:6, padding:'4px 10px', fontSize:11, cursor:'pointer' }}>+ Create channel</button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {activeChannel ? (
          <>
            {/* Channel header */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg2)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>#</span>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{activeChannel.name}</div>
                {activeChannel.description && <div style={{ fontSize:12, color:'var(--text2)' }}>{activeChannel.description}</div>}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflow:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              {messages.length===0 && (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>
                  <div style={{ fontSize:40, marginBottom:8 }}>💬</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text2)' }}>No messages yet</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Be the first to say something!</div>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{ display:'flex', gap:10, alignItems:'flex-start', position:'relative' }}
                  onMouseEnter={e => e.currentTarget.querySelector('.msg-actions')?.style && (e.currentTarget.querySelector('.msg-actions').style.opacity='1')}
                  onMouseLeave={e => e.currentTarget.querySelector('.msg-actions')?.style && (e.currentTarget.querySelector('.msg-actions').style.opacity='0')}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, flexShrink:0 }}>
                    {msg.author?.first_name?.[0]}{msg.author?.last_name?.[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ fontWeight:700, fontSize:13, color:'var(--text)' }}>{msg.author?.first_name} {msg.author?.last_name}</span>
                      <span style={{ fontSize:11, color:'var(--text3)' }}>{new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                      {msg.is_edited && <span style={{ fontSize:10, color:'var(--text3)' }}>(edited)</span>}
                    </div>
                    <div style={{ fontSize:14, color:'var(--text)', lineHeight:1.6 }}>{msg.content}</div>
                    {/* Reactions */}
                    {msg.reactions?.length > 0 && (
                      <div style={{ display:'flex', gap:4, marginTop:6, flexWrap:'wrap' }}>
                        {Object.entries(msg.reactions.reduce((a,r) => ({ ...a, [r.emoji]: (a[r.emoji]||0)+1 }), {})).map(([emoji, count]) => (
                          <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                            style={{ background:'var(--brand-bg)', border:'1px solid rgba(51,102,255,0.2)', borderRadius:20, padding:'2px 8px', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
                            {emoji} <span style={{ fontSize:11, color:'var(--text2)' }}>{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Hover actions */}
                  <div className="msg-actions" style={{ opacity:0, transition:'opacity 0.15s', display:'flex', gap:4, position:'absolute', right:0, top:0 }}>
                    <button onClick={() => setShowReactions(showReactions===msg.id ? null : msg.id)}
                      style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'4px 8px', fontSize:14, cursor:'pointer' }}>😊</button>
                  </div>
                  {/* Emoji picker */}
                  {showReactions===msg.id && (
                    <div style={{ position:'absolute', right:0, top:32, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:8, display:'flex', gap:4, zIndex:10, flexWrap:'wrap', width:200, boxShadow:'0 8px 24px rgba(0,0,0,0.15)' }}>
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => addReaction(msg.id, e)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', borderRadius:8, padding:4, transition:'background 0.15s' }}
                          onMouseEnter={ev => ev.target.style.background='var(--brand-bg)'} onMouseLeave={ev => ev.target.style.background='none'}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>

            {/* Message input */}
            <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)' }}>
              <form onSubmit={sendMessage} style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder={`Message #${activeChannel.name}`}
                  style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', fontSize:14, color:'var(--text)', outline:'none' }}
                  onFocus={e => e.target.style.borderColor='#3366ff'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                <button type="submit" className="btn btn-primary" style={{ padding:'10px 20px', borderRadius:12, flexShrink:0 }}>Send →</button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, color:'var(--text3)' }}>
            <div style={{ fontSize:48 }}>💬</div>
            <div style={{ fontSize:16, fontWeight:600, color:'var(--text2)' }}>Select a channel to start chatting</div>
            {workspaces.length===0 && <div style={{ fontSize:13 }}>Create a workspace first</div>}
          </div>
        )}
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div className="card scale-in" style={{ width:'100%', maxWidth:420, padding:32 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>💬 New Channel</h3>
            <form onSubmit={createChannel} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="label">Channel name *</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text2)', fontSize:14 }}>#</span>
                  <input className="input" style={{ paddingLeft:28 }} placeholder="general" value={newChannel.name} onChange={e => setNewChannel({...newChannel, name:e.target.value.toLowerCase().replace(/\s+/g,'-')})} required />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="What is this channel for?" value={newChannel.description} onChange={e => setNewChannel({...newChannel, description:e.target.value})} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex:1 }} onClick={() => setShowNewChannel(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Create Channel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
