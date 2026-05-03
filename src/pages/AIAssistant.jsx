import { useState } from 'react'
import { useStore } from '../store'

export default function AIAssistant() {
  const { theme, user } = useStore()
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hello ${user?.first_name || 'there'}! I am your AI Productivity Assistant. I can predict task completion times, detect team burnout, and generate weekly summaries. How can I help you today?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setLoading(true)

    // Mock AI delay and response
    setTimeout(() => {
      let response = "I've analyzed your team's velocity. It looks like the 'Frontend Rewrite' project is at risk of being delayed by 3 days. I recommend reassigning 2 tasks to John to prevent burnout."
      
      if (newMsg.content.toLowerCase().includes('summary')) {
        response = "Here is your weekly summary:\n- 14 tasks completed.\n- 3 overdue tasks in Project X.\n- Top performer: Sarah (6 tasks).\n\nTeam burnout risk is currently LOW."
      }

      setMessages(prev => [...prev, { role: 'ai', content: response }])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 32 }}>🧠</div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>
              Productivity Intelligence
            </h1>
            <p style={{ color: 'var(--text2)', marginTop: 4 }}>Your AI co-pilot for project management.</p>
          </div>
        </div>

        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                gap: 12, 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%' 
              }}>
                {m.role === 'ai' && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    🧠
                  </div>
                )}
                <div style={{ 
                  background: m.role === 'user' ? 'var(--brand)' : 'var(--bg2)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  borderTopRightRadius: m.role === 'user' ? 4 : 12,
                  borderTopLeftRadius: m.role === 'ai' ? 4 : 12,
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧠</div>
                <div style={{ background: 'var(--bg2)', color: 'var(--text2)', padding: '12px 16px', borderRadius: 12, borderTopLeftRadius: 4, fontSize: 14 }}>
                  Analyzing data...
                </div>
              </div>
            )}
          </div>
          
          <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
              <input 
                className="input" 
                style={{ flex: 1, borderRadius: 24, padding: '12px 20px' }} 
                placeholder="Ask about team velocity, burnout, or generate a summary..." 
                value={input} 
                onChange={e => setInput(e.target.value)} 
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 24, padding: '0 24px' }} disabled={loading || !input.trim()}>
                Ask AI
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
