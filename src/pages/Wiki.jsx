import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { wiki, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { BookOpen, Plus, Search, FileText, ChevronRight, Clock, Eye } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

export default function Wiki() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await wiki.list(search || undefined);
      setArticles(unwrapData(res));
    } catch (e) {
      toast.error('Failed to load wiki');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val) => {
    setSearch(val);
    if (!val.trim()) {
      load();
      return;
    }
    try {
      const res = await wiki.list(val);
      setArticles(unwrapData(res));
    } catch (e) {
      toast.error('Search failed');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('wiki.title', 'Wiki')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{articles.length} articles</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={14} />}>New Article</Button>
      </div>

      <div style={{ position: 'relative', maxWidth: 280 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search wiki..."
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px 8px 30px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : articles.length === 0 ? (
        <EmptyState icon={<BookOpen size={24} />} title="No articles yet" description="Create your first wiki article." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((a, i) => (
            <div key={a.id || i} style={{ ...cardBase, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={15} style={{ color: 'var(--brand)' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{a.title}</h3>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text3)' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.content || a.summary || 'No content'}</p>
              {a.tags && a.tags.length > 0 && (
                <div className="flex gap-1 mb-3 flex-wrap">
                  {a.tags.slice(0, 3).map((tag, ti) => <Badge key={ti} variant="secondary">{tag}</Badge>)}
                </div>
              )}
              <div className="flex items-center gap-3" style={{ fontSize: 10, color: 'var(--text3)' }}>
                <span className="flex items-center gap-1"><Clock size={10} /> {a.updated_at ? new Date(a.updated_at).toLocaleDateString() : '—'}</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {a.views ?? 0} views</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
