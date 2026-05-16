import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { wiki, ws } from '../services/api';
import useAutosave from '../hooks/useAutosave';
import toast from 'react-hot-toast';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { BookOpen, Search, Plus, ArrowLeft, Brain, Edit2, Trash2 } from 'lucide-react';

export default function Wiki() {
  const { theme } = useStore();
  const [articles, setArticles] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // 'list' | 'view' | 'edit'
  const [searchQ, setSearchQ] = useState('');
  const [form, setForm] = useState({ title: '', content: '', category: '', workspace: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);

  const { isDirty, hasSaved, clearSaved, loadSaved } = useAutosave('wiki-article', form, 1500);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    
    Promise.all([wiki.list(), ws.list()])
      .then(([aRes, wRes]) => {
        setArticles(aRes.data.data || aRes.data || []);
        setWorkspaces(wRes.data.data || wRes.data || []);
      })
      .catch(() => toast.error('Knowledge sync failed'))
      .finally(() => setLoading(false));
      
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await wiki.list(searchQ);
      setArticles(res.data.data || res.data || []);
    } catch { toast.error('Search failure'); }
  };

  const selectArticle = (a) => {
    setSelected(a);
    setMode('view');
    if (isMobile) setShowSidebar(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.workspace) { toast.error('Link to a workspace'); return; }
    try {
      if (selected) {
        const res = await wiki.update(selected.id, form);
        setArticles(prev => prev.map(a => a.id === selected.id ? res.data : a));
        setSelected(res.data);
        toast.success('Record updated');
      } else {
        const res = await wiki.create(form);
        setArticles(prev => [res.data, ...prev]);
        setSelected(res.data);
        toast.success('Record initialized');
      }
      clearSaved();
      setMode('view');
      if (isMobile) setShowSidebar(false);
    } catch { toast.error('Record failure'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Purge this record?')) return;
    try {
      await wiki.delete(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      setMode('list');
      setSelected(null);
      setShowSidebar(true);
      toast.success('Record purged');
    } catch { toast.error('Purge failure'); }
  };

  return (
    <div className={`flex h-[calc(100vh-72px)] relative overflow-hidden bg-[#0a0f1d] ${theme}`}>
      {/* Sidebar */}
      <div className={`
        ${isMobile && !showSidebar ? 'hidden' : 'flex'} 
        ${isMobile ? 'absolute inset-0 z-20 w-full' : 'relative w-[320px]'}
        flex-col bg-[#0d1425] border-r border-gray-800 transition-all shrink-0
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <BookOpen size={20} />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Intelligence</h2>
        </div>

        <div className="p-4 border-b border-gray-800">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              leftIcon={<Search size={16} />}
              placeholder="Search..." 
              value={searchQ} 
              onChange={e => setSearchQ(e.target.value)} 
              className="flex-1"
            />
          </form>
        </div>

        <div className="p-4 border-b border-gray-800">
          <Button 
            fullWidth 
            className="py-3 font-bold"
            leftIcon={<Plus size={18} />}
            onClick={() => { 
              setSelected(null); 
              setForm({ title: '', content: '', category: '', workspace: workspaces[0]?.id || '' }); 
              setMode('edit'); 
              if (isMobile) setShowSidebar(false); 
            }}
          >
            NEW RECORD
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {loading ? (
             <div className="animate-pulse bg-gray-800 h-12 rounded-xl" />
          ) : articles.length === 0 ? (
             <div className="text-sm font-bold text-gray-500 text-center py-8">No records detected.</div>
          ) : articles.map(a => (
            <div 
              key={a.id} 
              onClick={() => selectArticle(a)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${selected?.id === a.id ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-transparent border-transparent hover:bg-gray-800/50'}`}
            >
              <div className={`font-black text-sm truncate ${selected?.id === a.id ? 'text-white' : 'text-gray-200'}`}>
                {a.title}
              </div>
              {a.category && (
                <div className={`text-[10px] font-bold uppercase mt-2 ${selected?.id === a.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {a.category}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar bg-[#0a0f1d] ${isMobile && showSidebar ? 'hidden' : 'block'}`}>
        <div className="p-6 md:p-12 max-w-4xl mx-auto h-full flex flex-col">
          {isMobile && (
            <Button variant="ghost" className="mb-6 self-start text-xs font-bold text-gray-400" onClick={() => setShowSidebar(true)}>
              <ArrowLeft size={16} className="mr-2" /> BACK TO LIST
            </Button>
          )}

          {mode === 'list' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 mb-6">
                <Brain size={48} />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Workspace Intelligence</h2>
              <p className="text-gray-400 max-w-md mx-auto font-medium">Select a record to view details or initialize a new article to share knowledge with your team.</p>
            </div>
          )}

          {mode === 'view' && selected && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div className="flex-1">
                  {selected.category && (
                    <span className="inline-block px-3 py-1 rounded-md bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
                      {selected.category}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{selected.title}</h1>
                  <div className="text-xs text-gray-500 mt-4 font-bold uppercase tracking-widest">
                    By <span className="text-gray-300">{selected.author_name}</span> • Last sync {new Date(selected.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Button variant="secondary" onClick={() => { setForm({ title: selected.title, content: selected.content, category: selected.category, workspace: selected.workspace }); setMode('edit'); }}>
                    <Edit2 size={16} className="mr-2" /> Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(selected.id)}>
                    <Trash2 size={16} className="mr-2" /> Purge
                  </Button>
                </div>
              </div>
              <Card variant="glass" className="p-8 md:p-12">
                <div className="prose prose-invert max-w-none text-gray-300 font-medium leading-loose whitespace-pre-wrap">
                  {selected.content}
                </div>
              </Card>
            </div>
          )}

          {mode === 'edit' && (
            <div className="animate-in fade-in duration-500 max-w-3xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white">{selected ? 'REVISE RECORD' : 'INITIALIZE RECORD'}</h2>
                <div className={`text-[10px] font-black uppercase tracking-widest ${isDirty ? 'text-gray-500 animate-pulse' : 'text-blue-500'}`}>
                  {isDirty ? 'Drafting...' : '✓ Synced'}
                </div>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Workspace Node</label>
                  <select className="w-full bg-[#0b1429] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" value={form.workspace} onChange={e => setForm({...form, workspace: e.target.value})} required>
                    <option value="">Select Target...</option>
                    {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Record Title" 
                    placeholder="Article title..." 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Classification" 
                    placeholder="e.g. Onboarding, HR..." 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Intelligence Content</label>
                  <textarea 
                    rows={12} 
                    className="w-full bg-[#0b1429] border border-white/5 rounded-2xl p-6 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-y leading-relaxed font-medium custom-scrollbar" 
                    placeholder="Compose documentation..." 
                    value={form.content} 
                    onChange={e => setForm({...form, content: e.target.value})} 
                    required 
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" className="flex-1 py-4 font-black" onClick={() => setMode(selected ? 'view' : 'list')}>
                    ABORT
                  </Button>
                  <Button type="submit" variant="primary" className="flex-[2] py-4 font-black text-lg">
                    DEPLOY RECORD
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
