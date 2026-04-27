import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const handleAsk = async () => {
    if (!question.trim()) return
    // Simple local AI – expand as needed
    const q = question.toLowerCase()
    let ans = ''
    if (q.includes('workspace')) ans = 'Go to Dashboard → "Create Workspace"'
    else if (q.includes('task')) ans = 'Open a workspace, select a project, click "New Task"'
    else if (q.includes('role')) ans = 'Owner, Manager, Developer, Viewer – each has specific permissions.'
    else if (q.includes('invite')) ans = 'Inside a workspace → Members tab → "Invite Member"'
    else ans = 'I can help with workspaces, tasks, roles, invites. Try asking!'
    setAnswer(ans)
    toast.success('AI answered!')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
          zIndex: 1000,
          fontSize: '1.8rem',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        🤖
      </button>
      {open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal-content fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>🤖 AI Assistant</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <input
              type="text"
              placeholder="Ask me anything about the platform..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="input"
              style={{ marginBottom: '1rem' }}
            />
            <button onClick={handleAsk} className="btn btn-primary btn-block">Ask</button>
            {answer && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg2)', borderRadius: '10px' }}>
                <strong>Answer:</strong> {answer}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
