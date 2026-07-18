import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ws, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Briefcase, Plus, ChevronRight, Users, CheckSquare, FolderKanban, Crown, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateWorkspaceModal from '../components/workspaces/CreateWorkspaceModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';

const cardBase = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: tokens.radius.lg,
  padding: 'clamp(16px,2vw,20px)',
};

const ROLE_VARIANT = {
  owner: 'primary',
  admin: 'warning',
  member: 'secondary',
};

export default function Workspaces() {
  const { user, workspaces, activeWorkspace, setActiveWorkspace, setWorkspaces, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ws.list();
      const data = unwrapData(res);
      setWorkspaces(data);
    } catch (e) {
      setError(e.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (w) => {
    setActiveWorkspace(w);
    navigate(`/workspaces/${w.id}`);
  };

  const handleDelete = async (e, w) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${w.name}"? This cannot be undone.`)) return;
    setDeletingId(w.id);
    try {
      await ws.delete(w.id);
      toast.success(t('workspaces.deleted', 'Workspace deleted'));
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('workspaces.delete_failed', 'Failed to delete'));
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return <div className="p-8"><LoadingSpinner /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('workspaces.title', 'Workspaces')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => setShowCreateModal(true)}>New Workspace</Button>
      </div>

      {error && (
        <div style={{ ...cardBase, borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
          <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>{error}</p>
          <button onClick={loadAll} style={{ marginTop: 8, background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, padding: '5px 10px', color: 'var(--danger)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} style={{ ...cardBase, minHeight: 160 }} className="animate-pulse">
              <div style={{ height: 14, width: 100, background: 'var(--bg3)', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ height: 10, width: 60, background: 'var(--bg3)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={32} />}
          title={t('workspaces.empty_title', 'No workspaces yet')}
          description={t('workspaces.empty_desc', 'Create your first workspace to start collaborating.')}
          actionLabel={t('workspaces.create', 'Create Workspace')}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspaces.map((w) => (
            <div
              key={w.id}
              style={{ ...cardBase, cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              onClick={() => handleSelect(w)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {w.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{w.name}</h3>
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>{w.member_count ?? '—'} members</p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
              </div>

              <div className="flex gap-4 mb-3" style={{ fontSize: 10, color: 'var(--text3)' }}>
                <span className="flex items-center gap-1"><FolderKanban size={11} /> {w.project_count ?? 0} projects</span>
                <span className="flex items-center gap-1"><CheckSquare size={11} /> {w.task_count ?? 0} tasks</span>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={ROLE_VARIANT[w.role] || 'secondary'} size="xs">
                  {w.role === 'owner' && <Crown size={9} className="mr-1" />}
                  {w.role}
                </Badge>
                {w.role === 'owner' && (
                  <button
                    onClick={(e) => handleDelete(e, w)}
                    disabled={deletingId === w.id}
                    style={{ background: 'transparent', border: '1px solid transparent', borderRadius: 6, padding: '3px 6px', color: 'var(--text3)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    {deletingId === w.id ? <LoadingSpinner size={12} /> : <Trash2 size={13} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(newWs) => {
          setActiveWorkspace(newWs);
          navigate(`/workspaces/${newWs.id}`);
        }}
      />
    </div>
  );
}
