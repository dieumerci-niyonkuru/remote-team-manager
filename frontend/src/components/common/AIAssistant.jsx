import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { useT } from '../../i18n'

// Knowledge base: system + general answers
const knowledge = [
  // System specific
  { keywords: ['workspace', 'create workspace', 'new workspace'], answer: 'Go to Dashboard → Click "Create Workspace" → Enter name & description → Create.' },
  { keywords: ['task', 'create task', 'new task'], answer: 'Open a workspace, select a project, click "New Task" → Fill details → Save.' },
  { keywords: ['role', 'roles', 'permission', 'access'], answer: '4 roles: Owner (full), Manager (manage projects/tasks), Developer (create/edit tasks), Viewer (read‑only).' },
  { keywords: ['invite', 'member', 'add member'], answer: 'Inside a workspace, go to Members tab → Click "Invite Member" → Enter email and role.' },
  { keywords: ['project', 'create project'], answer: 'Inside a workspace, click "New Project" → Enter name & description → Create.' },
  { keywords: ['dashboard', 'home page'], answer: 'Click "Dashboard" in the navigation after logging in.' },
  { keywords: ['activity', 'feed', 'log'], answer: 'Go to Activity tab inside any workspace or the global Activity page from header.' },
  { keywords: ['language', 'translate', 'kinyarwanda', 'french'], answer: 'Use the language selector in the top‑right corner (EN/FR/RW).' },
  { keywords: ['dark', 'light', 'theme', 'mode'], answer: 'Click the sun/moon icon next to the language selector.' },
  { keywords: ['login', 'sign in'], answer: 'Click "Sign In" in the header, enter your email and password.' },
  { keywords: ['register', 'sign up', 'account'], answer: 'Click "Create Account" in the header, fill the form, and verify your email (demo: any email works).' },
  // General knowledge (common questions)
  { keywords: ['react', 'what is react'], answer: 'React is a JavaScript library for building user interfaces, developed by Facebook.' },
  { keywords: ['django', 'what is django'], answer: 'Django is a high‑level Python web framework that encourages rapid development and clean design.' },
  { keywords: ['jwt', 'json web token'], answer: 'JWT (JSON Web Token) is an open standard for securely transmitting information between parties as a JSON object.' },
  { keywords: ['docker', 'container'], answer: 'Docker is a platform for developing, shipping, and running applications inside lightweight containers.' },
  { keywords: ['postgresql', 'postgres'], answer: 'PostgreSQL is a powerful, open‑source object‑relational database system.' },
  { keywords: ['rest api', 'api'], answer: 'REST API is an architectural style for designing networked applications. This system exposes a full REST API documented via Swagger at /api/docs/.' },
  { keywords: ['javascript', 'js'], answer: 'JavaScript is a programming language that enables interactive web pages.' },
  { keywords: ['python', 'python language'], answer: 'Python is a high‑level, interpreted programming language known for its readability and versatility.' },
]

const fallbackAnswer = "I'm not sure about that. Try asking about workspaces, tasks, roles, or general tech like React, Django, JWT, Docker."

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const { isAuth, lang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()

  // Auto-scroll chat to bottom
  useEffect(() => {
    const chatDiv = document.getElementById('assistant-chat')
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight
  }, [chatHistory])

  const findAnswer = (question) => {
    const lower = question.toLowerCase()
    for (const item of knowledge) {
      if (item.keywords.some(kw => lower.includes(kw))) {
        return item.answer
      }
    }
    return fallbackAnswer
  }

  const handleSend = () => {
    if (!message.trim()) return
    const userMsg = message.trim()
    const answer = findAnswer(userMsg)
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: answer }])
    setMessage('')
  }

  const quickActions = [
    { label: '📋 Dashboard', action: () => navigate('/dashboard'), condition: isAuth },
    { label: '🏢 Create Workspace', action: () => navigate('/dashboard'), condition: isAuth },
    { label: '📁 Projects', action: () => navigate('/workspaces'), condition: isAuth },
    { label: '👥 Invite Member', action: () => navigate('/team'), condition: isAuth },
    { label: '⚡ Activity', action: () => navigate('/activity'), condition: isAuth },
    { label: '🔑 Login', action: () => navigate('/login'), condition: !isAuth },
    { label: '🌙 Dark/Light', action: () => document.querySelector('.theme-toggle')?.click(), condition: true },
  ]

  return (
    <>
      {/* Floating button with pulse animation */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3366ff, #6699ff)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 0 0 rgba(51,102,255,0.5)',
            animation: 'pulse 2s infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🤖
        </button>
        <div style={{
          position: 'absolute',
          bottom: 70,
          right: 0,
          background: '#3366ff',
          color: 'white',
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
        }}>Ask me</div>
      </div>

      {/* Assistant modal */}
      {open && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setOpen(false)} style={{ zIndex: 1001 }}>
          <div className="card scale-in" style={{ width: '100%', maxWidth: 450, padding: 0, overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', background: '#3366ff', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>🤖 AI Assistant – Ask me anything</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Chat area */}
            <div id="assistant-chat" style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'var(--bg)', maxHeight: 350 }}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 12, marginTop: 20 }}>
                  ✨ Hello! Ask me about workspaces, tasks, roles, or general tech (React, Django, JWT, Docker...)
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: 16,
                    background: msg.role === 'user' ? '#3366ff' : 'var(--bg2)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text)',
                    fontSize: 13,
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 8 }}>⚡ SUGGESTED ACTIONS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {quickActions.filter(a => a.condition).map((action, i) => (
                  <button key={i} onClick={() => { action.action(); setOpen(false); }} style={{ background: 'var(--brand-bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: 'var(--text)' }}>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div style={{ padding: 12, background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Ask about workspaces, tasks, or React..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  className="input"
                  style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                />
                <button onClick={handleSend} className="btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(51,102,255,0.6); }
          70% { box-shadow: 0 0 0 12px rgba(51,102,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(51,102,255,0); }
        }
      `}</style>
    </>
  )
}
