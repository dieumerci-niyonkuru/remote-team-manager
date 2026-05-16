import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, X, Folder, CheckSquare, Book, User, Hash, Zap } from 'lucide-react';
import { useStore } from '../../store';
import api from '../../services/api';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{tasks: any[], projects: any[], wikis: any[]}>({ tasks: [], projects: [], wikis: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme } = useStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults({ tasks: [], projects: [], wikis: [] });
    }
  }, [isOpen]);

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults({ tasks: [], projects: [], wikis: [] });
      return;
    }
    setLoading(true);
    try {
      const [taskRes, projRes] = await Promise.all([
        api.get('/tasks/', { params: { search: q } }).catch(() => ({ data: [] })),
        api.get('/projects/', { params: { search: q } }).catch(() => ({ data: [] }))
      ]);
      setResults({
        tasks: Array.isArray(taskRes.data) ? taskRes.data.slice(0, 5) : [],
        projects: Array.isArray(projRes.data) ? projRes.data.slice(0, 5) : [],
        wikis: []
      });
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(q), 300);
  };

  if (!isOpen) return null;

  const flattenedResults = [
    ...results.projects.map(p => ({ ...p, type: 'project', icon: <Folder size={14} /> })),
    ...results.tasks.map(t => ({ ...t, type: 'task', icon: <CheckSquare size={14} /> }))
  ];

  const handleNavigate = (item: any) => {
    setIsOpen(false);
    if (item.type === 'project') navigate(`/workspaces/${item.workspace}/projects`);
    else if (item.type === 'task') navigate('/tasks');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#060b18]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
      
      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-[#0b1429] border border-white/10 rounded-[32px] shadow-2xl shadow-brand/20 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-8 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/2">
          <Search className="text-brand" size={20} />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Search projects, tasks, or commands..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg font-black tracking-tight placeholder:text-text-tertiary"
            value={query}
            onChange={handleQueryChange}
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-text-tertiary">
            <Command size={10} /> K
          </div>
          <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
             <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-50">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Searching Workspace...</span>
             </div>
          ) : query && flattenedResults.length === 0 ? (
             <div className="py-12 text-center space-y-2">
                <p className="text-sm font-black text-white">No results found for "{query}"</p>
                <p className="text-xs text-text-tertiary">Try searching for a project or task name.</p>
             </div>
          ) : !query ? (
             <div className="space-y-6 p-4">
                <div>
                   <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">Quick Commands</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { label: 'Create Project', icon: <Folder />, cmd: 'P', path: '/projects' },
                        { label: 'Add New Task', icon: <CheckSquare />, cmd: 'T', path: '/tasks' },
                        { label: 'Open Global Chat', icon: <Hash />, cmd: 'C', path: '/chat' },
                        { label: 'Go to Settings', icon: <Zap />, cmd: 'S', path: '/settings' },
                      ].map(c => (
                        <div key={c.label} onClick={() => { setIsOpen(false); navigate(c.path); }} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-brand/40 hover:bg-brand/5 cursor-pointer transition-all group">
                           <div className="flex items-center gap-3">
                              <div className="text-text-tertiary group-hover:text-brand transition-colors">{React.cloneElement(c.icon as React.ReactElement<any>, { size: 16 })}</div>
                              <span className="text-sm font-black text-white">{c.label}</span>
                           </div>
                           <div className="text-[10px] font-black text-text-tertiary bg-white/5 px-2 py-0.5 rounded border border-white/10 group-hover:border-brand/40 group-hover:text-brand transition-all">{c.cmd}</div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          ) : (
             <div className="space-y-6">
                {flattenedResults.length > 0 && (
                   <div>
                      <h4 className="px-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">Results</h4>
                      <div className="space-y-1">
                        {flattenedResults.map((res, i) => (
                           <div 
                             key={`${res.type}-${res.id}`} 
                             onClick={() => handleNavigate(res)}
                             className="flex items-center justify-between p-4 rounded-2xl bg-transparent border border-transparent hover:border-brand/40 hover:bg-brand/5 cursor-pointer transition-all group"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-tertiary group-hover:text-brand transition-all">
                                    {res.icon}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-white group-hover:text-brand transition-colors">{res.name || res.title}</p>
                                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-tight opacity-60">In {res.type}</p>
                                 </div>
                              </div>
                              <ArrowRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                           </div>
                        ))}
                      </div>
                   </div>
                )}
             </div>
          )}
        </div>

        <div className="p-4 bg-white/2 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-text-tertiary">
                 <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded uppercase">Enter</span> to select
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-text-tertiary">
                 <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded uppercase">Esc</span> to close
              </div>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-widest">
              <Zap size={10} className="animate-pulse" /> AI Powered Search
           </div>
        </div>
      </div>
    </div>
  );
}

const ArrowRight = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
