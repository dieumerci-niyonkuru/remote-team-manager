import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { ws } from '../services/api'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Knowledge() {
  const { theme, user } = useStore()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWs, setActiveWs] = useState(null)
  const [pages, setPages] = useState([])
  const [activePage, setActivePage] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState({ title:'', content:'', emoji:'📄' })
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ws.list().then(r => {
      setWorkspaces(r.data.data)
      if (r.data.data.length) { setActiveWs(r.data.data[0]); loadPages(r.data.data[0].id) }
      setLoading(false)
    })
  }, [])

  const loadPages = async wid => {
    try {
      const r = await api.get(`/workspaces/${wid}/knowledge/`)
      setPages(r.data.data || [])
    } catch { setPages([]) }
  }

  const createPage = async e => {
    e.preventDefault()
    try {
      const r = await api.post(`/workspaces/${activeWs.id}/knowledge/`, editContent)
      setPages(p => [...p, r.data.data])
      setActivePage(r.data.data)
      setShowNew(false)
      setEditContent({ title:'', content:'', emoji:'📄' })
      toast.success('Page created!')
    } catch { toast.error('Failed') }
  }

  const updatePage = async () => {
    try {
      const r = await api.patch(`/knowledge/${activePage.id}/`, { title:activePage.title, content:activePage.content })
      setPages(p => p.map(x => x.id===activePage.id ? r.data.data : x))
      setEditing(false)
      toast.success('Saved!')
    } catch { toast.error('Failed') }
  }

  const deletePage = async id => {
    if (!confirm('Delete this page?')) return
    try {
      await api.delete(`/knowledge/${id}/`)
      setPages(p => p.filter(x => x.id!==id))
      if (activePage?.id===id) setActivePage(null)
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const EMOJIS_OPTS = ['📄','📝','📋','🔖','💡','🧠','📚','🗂️','⚡','🎯','🔍','💼']

  return (
    <div className={theme} style={{ display:'flex', height:'calc(100vh - 64px)', background:'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ width:240, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:8 }}>🧠 Knowledge Base</div>
          <select value={activeWs?.id||''} onChange={e => { const w=workspaces.find(x=>x.id===e.target.value); setActiveWs(w); loadPages(w.id) }}
            style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 8px', fontSize:12, color:'var(--text)', outline:'none' }}>
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:8 }}>
          <button onClick={() => { setShowNew(true); setEditContent({ title:'', content:'', emoji:'📄' }) }}
            style={{ width:'100%', background:'var(--brand-bg)', color:'#3366ff', border:'1px dashed rgba(51,102,255,0.3)', borderRadius:8, padding:'8px', fontSize:12, fontWeight:600, cursor:'pointer', marginBottom:8 }}>
            + New Page
          </button>
          {pages.map(p => (
            <div key={p.id} onClick={() => { setActivePage(p); setEditing(false) }}
              style={{ padding:'8px 10px', borderRadius:8, fontSize:13, color:activePage?.id===p.id?'#3366ff':'var(--text2)', background:activePage?.id===p.id?'var(--brand-bg)':'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <span>{p.emoji}</span>
              <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:activePage?.id===p.id?600:400 }}>{p.title}</span>
            </div>
          ))}
          {pages.length===0 && <div style={{ textAlign:'center', padding:20, fontSize:12, color:'var(--text3)' }}>No pages yet</div>}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflow:'auto', padding:40 }}>
        {activePage ? (
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <span style={{ fontSize:32 }}>{activePage.emoji}</span>
              {editing ? (
                <input value={activePage.title} onChange={e => setActivePage({...activePage, title:e.target.value})}
                  style={{ flex:1, fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', background:'transparent', border:'none', outline:'none', borderBottom:'2px solid #3366ff' }} />
              ) : (
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', flex:1 }}>{activePage.title}</h1>
              )}
              <div style={{ display:'flex', gap:8 }}>
                {editing ? (
                  <>
                    <button className="btn btn-secondary" style={{ padding:'7px 14px', fontSize:13 }} onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ padding:'7px 14px', fontSize:13 }} onClick={updatePage}>Save</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary" style={{ padding:'7px 14px', fontSize:13 }} onClick={() => setEditing(true)}>✏️ Edit</button>
                    <button onClick={() => deletePage(activePage.id)} style={{ background:'rgba(239,68,68,0.1)', color:'#dc2626', border:'none', borderRadius:8, padding:'7px 12px', fontSize:13, cursor:'pointer' }}>🗑</button>
                  </>
                )}
              </div>
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:24 }}>
              Last updated {new Date(activePage.updated_at).toLocaleDateString()} · {activePage.views} views
            </div>
            {editing ? (
              <textarea value={activePage.content} onChange={e => setActivePage({...activePage, content:e.target.value})}
                style={{ width:'100%', minHeight:400, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:20, fontSize:15, color:'var(--text)', outline:'none', resize:'vertical', lineHeight:1.8, fontFamily:'var(--font-body)' }} />
            ) : (
              <div style={{ fontSize:15, color:'var(--text)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>
                {activePage.content || <span style={{ color:'var(--text3)', fontStyle:'italic' }}>Empty page — click Edit to add content</span>}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12, color:'var(--text3)' }}>
            <div style={{ fontSize:48 }}>🧠</div>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--text2)' }}>Your Knowledge Base</div>
            <div style={{ fontSize:14, color:'var(--text3)', maxWidth:300, textAlign:'center' }}>Store, organize and share important information across your team</div>
            <button className="btn btn-primary" style={{ marginTop:12 }} onClick={() => setShowNew(true)}>+ Create First Page</button>
          </div>
        )}
      </div>

      {/* New page modal */}
      {showNew && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div className="card scale-in" style={{ width:'100%', maxWidth:480, padding:32 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>🧠 New Page</h3>
            <form onSubmit={createPage} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="label">Icon</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {EMOJIS_OPTS.map(e => (
                    <button key={e} type="button" onClick={() => setEditContent(p=>({...p,emoji:e}))}
                      style={{ width:36, height:36, borderRadius:8, border:`1.5px solid ${editContent.emoji===e?'#3366ff':'var(--border)'}`, background:editContent.emoji===e?'var(--brand-bg)':'transparent', fontSize:18, cursor:'pointer' }}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Title *</label>
                <input className="input" placeholder="Page title" value={editContent.title} onChange={e => setEditContent(p=>({...p,title:e.target.value}))} required />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea className="input" rows={5} style={{ resize:'none' }} placeholder="Start writing..." value={editContent.content} onChange={e => setEditContent(p=>({...p,content:e.target.value}))} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex:1 }} onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Create Page</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
