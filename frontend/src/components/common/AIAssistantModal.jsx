import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'

const knowledge = [
  { keywords: ['workspace', 'create workspace'], answer: 'Go to Dashboard → "Create Workspace" → Enter name & description.' },
  { keywords: ['task', 'create task'], answer: 'Open a workspace, select a project, click "New Task".' },
  { keywords: ['role', 'roles'], answer: 'Owner (full), Manager (manage), Developer (edit tasks), Viewer (read-only).' },
  { keywords: ['invite', 'member'], answer: 'Inside a workspace → Members tab → "Invite Member".' },
  { keywords: ['project'], answer: 'Inside a workspace, click "New Project".' },
  { keywords: ['react'], answer: 'React is a JavaScript library for building user interfaces.' },
  { keywords: ['django'], answer: 'Django is a high-level Python web framework.' },
  { keywords: ['jwt'], answer: 'JWT (JSON Web Token) is used for secure authentication.' },
  { keywords: ['docker'], answer: 'Docker containers package apps with dependencies.' },
  { keywords: ['postgresql'], answer: 'PostgreSQL is a powerful open-source database.' },
]

const fallback = "I can help with workspaces, tasks, roles, or general tech like React, Django, JWT."

export default function AIAssistantModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const { isAuth } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) setChat([{ role: 'assistant', content: 'Hi! Ask me about features or tech: workspaces, tasks, roles, React, Django...' }])
  }, [isOpen])

  const findAnswer = (q) => {
    const lower = q.toLowerCase()
    for (const item of knowledge) {
      if (item.keywords.some(k => lower.includes(k))) return item.answer
    }
    return fallback
  }

  const handleSend = () => {
    if (!message.trim()) return
    const userMsg = message.trim()
    const answer = findAnswer(userMsg)
    setChat([...chat, { role: 'user', content: userMsg }, { role: 'assistant', content: answer }])
    setMessage('')
  }

  if (!isOpen) return null

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1001 }}>
      <div className="card scale-in" style={{ width: '100%', maxWidth: 450, padding: 0, overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', background: '#3366ff', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>🤖 AI Assistant</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'var(--bg)', maxHeight: 350 }}>
          {chat.map((msg, i) => (
            <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: 16, background: msg.role === 'user' ? '#3366ff' : 'var(--bg2)', color: msg.role === 'user' ? '#fff' : 'var(--text)', fontSize: 13 }}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Ask about workspaces, tasks, React..." value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="input" style={{ flex: 1 }} />
            <button onClick={handleSend} className="btn-primary">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
