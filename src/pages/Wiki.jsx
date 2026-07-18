import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { wiki, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { BookOpen, Plus, Search, FileText, ChevronRight, Clock, Eye, X, Trash2, Edit3, ArrowLeft, RotateCcw } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };
const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

export default function Wiki() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [activeArticle, setActiveArticle] = useState(null);
  const [articleDetail, setArticleDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  useEffect(() => { if (activeWorkspace && view === 'list') load(); }, [activeWorkspace, view]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await wiki.list(search || undefined);
      setArticles(unwrapData(res));
    } catch { toast.error('Failed to load wiki'); } finally { setLoading(false); }
  };

  const handleSearch = async (val) => {
    setSearch(val);
    if (!val.trim()) { load(); return; }
    try { const res = await wiki.list(val); setArticles(unwrapData(res)); } catch { toast.error('Search failed'); }
  };

  const openArticle = async (a) => {
    setActiveArticle(a);
    setView('detail');
    setLoadingDetail(true);
    try {
      const res = await wiki.get(a.id);
      setArticleDetail(unwrapData(res));
    } catch { setArticleDetail(a); } finally { setLoadingDetail(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', tags: '' });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({ title: a.title || '', content: a.content || '', tags: (a.tags || []).join(', ') });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      if (editing) {
        await wiki.update(editing.id, { title: form.title.trim(), content: form.content.trim(), tags });
        toast.success('Article updated');
        if (view === 'detail') {
          const res = await wiki.get(editing.id);
          setArticleDetail(unwrapData(res));
        }
      } else {
        await wiki.create({ title: form.title.trim(), content: form.content.trim(), tags, workspace: activeWorkspace?.id });
        toast.success('Article created');
      }
      setShowModal(false);
      setForm({ title: '', content: '', tags: '' });
      setEditing(null);
      if (view === 'list') load();
    } catch { toast.error(editing ? 'Failed to update' : 'Failed to create'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await wiki.delete(id);
      toast.success('Article deleted');
      if (view === 'detail') { setView('list'); setActiveArticle(null); setArticleDetail(null); }
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const openRevisions = async (articleId) => {
    setShowRevisions(true);
    setLoadingRevisions(true);
    try {
      const res = await wiki.revisions(articleId);
      setRevisions(unwrapData(res));
    } catch { setRevisions([]); } finally { setLoadingRevisions(false); }
  };

  const handleRestore = async (articleId, revisionId) => {
    if (!confirm('Restore this revision? Current content will be overwritten.')) return;
    try {
      await wiki.restore(articleId, revisionId);
      toast.success('Revision restored');
      setShowRevisions(false);
      const res = await wiki.get(articleId);
      setArticleDetail(unwrapData(res));
    } catch { toast.error('Failed to restore revision'); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {view === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('wiki.title', 'Wiki')}</h1>
              <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{articles.length} articles</p>
            </div>
            <Button variant="primary" leftIcon={<Plus size={14} />} onClick={openCreate}>New Article</Button>
          </div>

          <div style={{ position: 'relative', maxWidth: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search wiki..."
              style={{ ...inputStyle, paddingLeft: 30 }} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
          ) : articles.length === 0 ? (
            <EmptyState icon={<BookOpen size={24} />} title="No articles yet" description="Create your first wiki article." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {articles.map((a, i) => (
                <div key={a.id || i} onClick={() => openArticle(a)}
                  style={{ ...cardBase, cursor: 'pointer', transition: 'border-color 0.2s' }}
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
                  {a.tags?.length > 0 && (
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {a.tags.slice(0, 3).map((tag, ti) => <Badge key={ti} variant="secondary">{tag}</Badge>)}
                    </div>
                  )}
                  <div className="flex items-center gap-3" style={{ fontSize: 10, color: 'var(--text3)' }}>
                    <span className="flex items-center gap-1"><Clock size={10} /> {a.updated_at ? format(new Date(a.updated_at), 'MMM d, yyyy') : '—'}</span>
                    <span className="flex items-center gap-1"><Eye size={10} /> {a.views ?? 0} views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'detail' && (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <button onClick={() => { setView('list'); setActiveArticle(null); setArticleDetail(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: '4px 0', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={14} /> Back to Wiki
          </button>

          {loadingDetail ? (
            <div className="flex justify-center py-20"><LoadingSpinner size={28} /></div>
          ) : articleDetail ? (
            <div style={cardBase}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{articleDetail.title}</h1>
                  <div className="flex items-center gap-3 mt-2" style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {articleDetail.author?.first_name && <span>By {articleDetail.author.first_name} {articleDetail.author.last_name || ''}</span>}
                    {articleDetail.updated_at && <span className="flex items-center gap-1"><Clock size={10} /> Updated {format(new Date(articleDetail.updated_at), 'MMM d, yyyy h:mm a')}</span>}
                    <span className="flex items-center gap-1"><Eye size={10} /> {articleDetail.views ?? 0} views</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openRevisions(articleDetail.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)' }} title="Revisions">
                    <RotateCcw size={14} />
                  </button>
                  <button onClick={() => openEdit(articleDetail)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--brand)' }} title="Edit">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(articleDetail.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {articleDetail.tags?.length > 0 && (
                <div className="flex gap-1 mb-4 flex-wrap">
                  {articleDetail.tags.map((tag, ti) => <Badge key={ti} variant="secondary">{tag}</Badge>)}
                </div>
              )}

              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                {articleDetail.content || 'No content'}
              </div>
            </div>
          ) : (
            <EmptyState icon={<FileText size={24} />} title="Article not found" description="This article may have been deleted." />
          )}
        </div>
      )}

      {/* Create / Edit modal */}
      {showModal && (
        <div onClick={() => { setShowModal(false); setEditing(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: 500, maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{editing ? 'Edit Article' : 'New Article'}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Title</span>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Article title" autoFocus style={inputStyle} required />
              </label>
              <label style={{ display: 'block', marginBottom: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Content</span>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your article content here..."
                  style={{ ...inputStyle, flex: 1, minHeight: 200, resize: 'vertical', lineHeight: 1.6 }} />
              </label>
              <label style={{ display: 'block', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Tags (comma separated)</span>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. onboarding, guides, api" style={inputStyle} />
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => { setShowModal(false); setEditing(null); }}>Cancel</Button>
                <Button variant="primary" type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revisions modal */}
      {showRevisions && (
        <div onClick={() => { setShowRevisions(false); setRevisions([]); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: 440, maxWidth: '90vw', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Revision History</h3>
              <button onClick={() => { setShowRevisions(false); setRevisions([]); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingRevisions ? (
                <div className="flex justify-center py-8"><LoadingSpinner size={20} /></div>
              ) : revisions.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 20 }}>No revision history</p>
              ) : (
                <div className="space-y-2">
                  {revisions.map((rev, i) => (
                    <div key={rev.id || i} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Revision {revisions.length - i}</p>
                        <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>
                          {rev.created_at ? format(new Date(rev.created_at), 'MMM d, yyyy h:mm a') : '—'}
                          {rev.author?.first_name && ` by ${rev.author.first_name}`}
                        </p>
                      </div>
                      {i > 0 && (
                        <Button variant="ghost" size="sm" leftIcon={<RotateCcw size={12} />} onClick={() => handleRestore(activeArticle?.id, rev.id)}>
                          Restore
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
