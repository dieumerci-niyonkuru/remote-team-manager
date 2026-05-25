import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Briefcase, CheckSquare, Users, MessageSquare,
         Calendar, FileText, Settings, LogOut, Plus, Zap, Globe } from 'lucide-react';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={16} />, path: '/dashboard', category: 'Navigate' },
  { id: 'projects', label: 'Go to Projects', icon: <Briefcase size={16} />, path: '/projects', category: 'Navigate' },
  { id: 'tasks', label: 'Go to Tasks', icon: <CheckSquare size={16} />, path: '/tasks', category: 'Navigate' },
  { id: 'team', label: 'Go to Team', icon: <Users size={16} />, path: '/team', category: 'Navigate' },
  { id: 'chat', label: 'Open Chat', icon: <MessageSquare size={16} />, path: '/chat', category: 'Navigate' },
  { id: 'calendar', label: 'Open Calendar', icon: <Calendar size={16} />, path: '/calendar', category: 'Navigate' },
  { id: 'wiki', label: 'Open Wiki', icon: <FileText size={16} />, path: '/wiki', category: 'Navigate' },
  { id: 'settings', label: 'Open Settings', icon: <Settings size={16} />, path: '/settings', category: 'Navigate' },
  { id: 'new-task', label: 'Create New Task', icon: <Plus size={16} />, path: '/tasks?new=1', category: 'Create' },
  { id: 'new-project', label: 'Create New Project', icon: <Plus size={16} />, path: '/projects?new=1', category: 'Create' },
  { id: 'new-channel', label: 'Create New Channel', icon: <Plus size={16} />, path: '/chat?new=1', category: 'Create' },
  { id: 'theme', label: 'Toggle Dark/Light Mode', icon: <Zap size={16} />, action: 'toggle-theme', category: 'Actions' },
];

export default function CommandPalette({ open, onClose, lang = 'en' }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  const execute = useCallback((cmd) => {
    if (cmd.action === 'toggle-theme') {
      document.documentElement.setAttribute(
        'data-theme',
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      );
    } else if (cmd.path) {
      navigate(cmd.path);
    }
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) { execute(filtered[selected]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, execute, onClose]);

  if (!open) return null;

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  let idx = 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 'var(--z-command)',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '15vh',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 620, background: 'var(--bg-card)',
        borderRadius: 16, border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: 12 }}>
          <Search size={18} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search commands, pages, actions..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 16, color: 'var(--text1)',
            }}
          />
          <kbd style={{
            fontSize: 11, fontFamily: 'monospace', padding: '2px 6px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text3)',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
              No commands found for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {category}
                </div>
                {cmds.map(cmd => {
                  const i = idx; idx++;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelected(i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: selected === i ? 'var(--brand-subtle)' : 'transparent',
                        color: selected === i ? 'var(--brand)' : 'var(--text1)',
                        transition: 'var(--transition-fast)', textAlign: 'left',
                      }}
                    >
                      <span style={{ color: selected === i ? 'var(--brand)' : 'var(--text3)', flexShrink: 0 }}>{cmd.icon}</span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{cmd.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{cmd.category}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
          <span><kbd style={{ fontFamily: 'monospace', padding: '1px 5px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4 }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ fontFamily: 'monospace', padding: '1px 5px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4 }}>↵</kbd> select</span>
          <span><kbd style={{ fontFamily: 'monospace', padding: '1px 5px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4 }}>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
