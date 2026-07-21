import { useState } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { search } from '../services/api';
import { unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Search as SearchIcon, FileText, Users, FolderKanban, CheckSquare, MessageSquare, Loader2 } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const SEARCH_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={12} /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={12} /> },
  { id: 'team', label: 'Team', icon: <Users size={12} /> },
  { id: 'files', label: 'Files', icon: <FileText size={12} /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={12} /> },
];

const resultIcon = (type) => ({
  projects: <FolderKanban size={14} />,
  tasks: <CheckSquare size={14} />,
  team: <Users size={14} />,
  files: <FileText size={14} />,
  messages: <MessageSquare size={14} />,
}[type] || <FileText size={14} />);

export default function SearchPage() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await search.global(query);
      setResults(unwrapData(r));
    } catch (e) { toast.error('Search failed'); } finally { setLoading(false); }
  };

  const filteredResults = results
    ? Object.fromEntries(
        Object.entries(results)
          .filter(([k, v]) => {
            if (!Array.isArray(v) || v.length === 0) return false;
            if (type === 'all') return true;
            return k === type;
          })
      )
    : null;

  const hasResults = filteredResults && Object.keys(filteredResults).length > 0;

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('search.title', 'Search')}</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <SearchIcon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search everything..."
            onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(51,102,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px 10px 36px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' }} />
        </div>
        <Button variant="primary" type="submit" loading={loading} leftIcon={loading ? <Loader2 size={14} /> : <SearchIcon size={14} />}>Search</Button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {SEARCH_TYPES.map(s => (
          <button key={s.id} onClick={() => setType(s.id)}
            className="flex items-center gap-1"
            style={{ background: type === s.id ? 'var(--brand-bg)' : 'var(--bg3)', border: type === s.id ? '1px solid rgba(51,102,255,0.2)' : '1px solid transparent', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: type === s.id ? 'var(--brand)' : 'var(--text3)', cursor: 'pointer' }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {results && (
        hasResults ? (
          <div className="space-y-3">
            {Object.entries(filteredResults).map(([category, items]) => (
              <div key={category}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{category}</h3>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={item.id || i} style={{ ...cardBase, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                      <span style={{ color: 'var(--brand)' }}>{resultIcon(category)}</span>
                      <div className="flex-1 min-w-0">
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{item.name || item.title || item.first_name || 'Result'}</span>
                        {item.description && <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<SearchIcon size={24} />} title="No results" description={`No results found for "${query}"`} />
        )
      )}
    </div>
  );
}
