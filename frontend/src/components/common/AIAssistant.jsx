import { useState } from 'react'
import { useT } from '../../i18n'
import { useStore } from '../../store'

const answers = {
  en: {
    workspace: 'To create a workspace, go to Dashboard and click "Create Workspace".',
    task: 'Create a task inside a project using the Kanban board. Click "New Task".',
    invite: 'Go to Workspace → Members tab → "Invite Member". Enter the email address.',
    role: 'There are 4 roles: Owner (full control), Manager, Developer, Viewer.',
    chat: 'Use the Chat page to send messages, create channels, and react with emojis.',
    default: 'I can help with workspaces, tasks, invites, roles, chat, and more. Ask me!',
  },
  fr: {
    workspace: 'Pour créer un espace, allez au Tableau de bord et cliquez sur "Créer un espace".',
    task: 'Créez une tâche dans un projet via le tableau Kanban. Cliquez sur "Nouvelle tâche".',
    invite: 'Allez dans l’espace → onglet Membres → "Inviter un membre". Entrez l’adresse e-mail.',
    role: 'Il y a 4 rôles : Propriétaire, Gestionnaire, Développeur, Observateur.',
    chat: 'Utilisez la page Discussion pour envoyer des messages, créer des canaux et réagir.',
    default: 'Je peux vous aider pour les espaces, tâches, invitations, rôles, discussion. Demandez‑moi !',
  },
  rw: {
    workspace: 'Kugira ngo ureme aho gukorera, jya kuri Dashboard hanyuma ukande "Create Workspace".',
    task: 'Kora akazi muri porogaramu ukoreshe ikibaho cya Kanban. Kanda "New Task".',
    invite: 'Jya muri Workspace → Members tab → "Invite Member". Andika imeyili.',
    role: 'Hari inshingano 4: Nyir’ubutunzi, Umuyobozi, Umunyamwuga, Umusomyi.',
    chat: 'Koresha urupapuro rwa Chat yohereza ubutumwa, ureme ibyiganiro, ukoreshe emoji.',
    default: 'Nshobora kugufasha ku mirimo, ibikorwa, ubutumwa, n’ibindi. Nibaze!',
  },
}

export default function AIAssistant() {
  const { lang } = useStore()
  const t = answers[lang] || answers.en
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [open, setOpen] = useState(false)

  const handleAsk = () => {
    if (!question.trim()) return
    const lower = question.toLowerCase()
    let resp = t.default
    if (lower.includes('workspace')) resp = t.workspace
    else if (lower.includes('task')) resp = t.task
    else if (lower.includes('invite')) resp = t.invite
    else if (lower.includes('role')) resp = t.role
    else if (lower.includes('chat')) resp = t.chat
    setAnswer(resp)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000, fontSize: '1.8rem' }}>🤖</button>
      {open && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }} style={{ zIndex: 1001 }}>
          <div className="card" style={{ maxWidth: 400, width: '90%', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><h3>🤖 AI Assistant</h3><button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button></div>
            <input type="text" placeholder={t.default.split('.')[0] + '?'} className="input" value={question} onChange={e => setQuestion(e.target.value)} style={{ marginBottom: 10 }} />
            <button className="btn btn-primary" onClick={handleAsk}>Ask</button>
            {answer && <div style={{ marginTop: 16, padding: 10, background: 'var(--bg2)', borderRadius: 8 }}><strong>Answer:</strong> {answer}</div>}
          </div>
        </div>
      )}
    </>
  )
}
