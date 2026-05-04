import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { ai } from '../services/api'

const QUICK_PROMPTS = [
  "What should I prioritize today?",
  "Summarize my team's activity",
  "What tasks are overdue?",
  "Give me a weekly summary",
]

export default function FloatingAI() {
  const { isAuth, theme } = useStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m your AI assistant. Ask me anything about your tasks, team, or projects.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  if (!isAuth) return null

  const send = async (text) => {
    const msg = text || input
    if (!msg.trim()) return
    setMessages(p => [...p, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    // Smart mock responses based on query
    setTimeout(() => {
      let resp = "I analyzed your workspace data. I recommend focusing on your 3 high-priority tasks before today's deadline."
      const q = msg.toLowerCase()
      if (q.includes('prioriti')) resp = "📋 Priority today:\n1. High-priority tasks due in < 24h\n2. Unblocked tasks assigned to you\n3. Review PR or pending approvals\n\nYou have 2 urgent tasks. Start there."
      else if (q.includes('summar') || q.includes('weekly')) resp = "📊 Weekly Summary:\n✅ 12 tasks completed\n⏰ 2 overdue (needs attention)\n💬 47 messages sent\n⏱️ 18h tracked\n\n🏆 Top performer: Your team is on track!"
      else if (q.includes('overdue')) resp = "⚠️ 2 tasks are overdue:\n• 'Setup database migrations' — 2 days late\n• 'Write API documentation' — 1 day late\n\nRecommend reassigning one to free up capacity."
      else if (q.includes('team') || q.includes('burnout')) resp = "👥 Team Health:\n🟢 Alex — Light load (good)\n🟡 Sarah — Moderate (7 tasks)\n🔴 James — Overloaded (12 tasks)\n\nConsider moving 3 tasks from James."

      setMessages(p => [...p, { role: 'ai', text: resp }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className={theme} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 8888 }}>
      {/* Chat window */}
      {open && (
        <div className="card scale-in" style={{ width: 340, marginBottom: 12, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.3)', border: '1px solid var(--border2)' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(51,102,255,0.15), rgba(139,92,246,0.15))', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>AI Productivity Assistant</div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ height: 280, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: m.role === 'ai' ? 'linear-gradient(135deg,#3366ff,#8b5cf6)' : 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                  {m.role === 'ai' ? '🧠' : '👤'}
                </div>
                <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: m.role === 'ai' ? '4px 12px 12px 12px' : '12px 4px 12px 12px', background: m.role === 'ai' ? 'var(--bg2)' : 'var(--brand)', color: m.role === 'ai' ? 'var(--text)' : '#fff', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12 }}>🧠</div>
                <div style={{ padding: '8px 12px', background: 'var(--bg2)', borderRadius: '4px 12px 12px 12px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', animation:`pulse-dot 1.2s ease ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 4, overflowX: 'auto' }}>
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)} style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: 'none', borderRadius: 20, padding: '4px 10px', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>{p.slice(0,18)}...</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '8px 14px', fontSize: 12, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)' }}
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button onClick={() => send()} style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(51,102,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, transition: 'all 0.3s', transform: open ? 'scale(0.95)' : 'scale(1)' }}
        title="AI Assistant (always available)">
        {open ? '×' : '🧠'}
      </button>
    </div>
  )
}
