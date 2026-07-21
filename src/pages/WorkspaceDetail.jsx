import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ws } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Briefcase, Users, FolderKanban, CheckSquare, Settings, ArrowLeft, Crown, Pencil } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

const cardBase = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: tokens.radius.lg,
  padding: 'clamp(16px,2vw,20px)',
};

export default function WorkspaceDetail() {
  const { id } = useParams();
  const { setActiveWorkspace, updateWorkspace, workspaces, user, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const existing = workspaces.find(ws => String(ws.id) === String(id));
    if (existing) { setWorkspace(existing); setActiveWorkspace(existing); setLoading(false); return; }
    loadWorkspace();
  }, [id]);

  const loadWorkspace = async () => {
    setLoading(true); setError(null);
    try { const r = await ws.get(id); setWorkspace(r.data); setActiveWorkspace(r.data); }
    catch (e) { setError(e.message || 'Failed to load'); } finally { setLoading(false); }
  };

  const openEditModal = () => {
    setEditName(workspace.name || '');
    setEditDesc(workspace.description || '');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return toast.error('Workspace name is required');
    setEditLoading(true);
    try {
      const res = await ws.update(workspace.id, { name: editName.trim(), description: editDesc.trim() });
      const updated = res.data;
      updateWorkspace(workspace.id, updated);
      setWorkspace(updated);
      setActiveWorkspace(updated);
      toast.success('Workspace updated');
      setEditOpen(false);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to update workspace.';
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' };

  if (loading) return <div className="p-8 flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg)' }}><LoadingSpinner size={28} /></div>;
  if (error || !workspace) return (
    <div className="p-6 text-center" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 80 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Briefcase size={22} style={{ color: 'var(--danger)' }} /></div>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Workspace not found</h2>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>{error || 'This workspace may have been deleted.'}</p>
        <Link to="/workspaces" style={{ marginTop: 16, display: 'inline-block' }}><Button variant="secondary" leftIcon={<ArrowLeft size={14} />}>Back to Workspaces</Button></Link>
      </div>
    </div>
  );

  const role = workspace.role || 'member';
  const isAdmin = role === 'admin' || role === 'owner';

  return (
    <div className="p-4 md:p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Link to="/workspaces" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={13} /> Workspaces
      </Link>

      <div style={cardBase}>
        <div className="flex items-start justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div className="flex items-center gap-4">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
              {workspace.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{workspace.name}</h1>
              <div className="flex items-center gap-3 mt-1" style={{ fontSize: 12, color: 'var(--text3)' }}>
                <span className="flex items-center gap-1"><Users size={12} /> {workspace.member_count ?? '—'} members</span>
                <span className="flex items-center gap-1"><FolderKanban size={12} /> {workspace.project_count ?? 0} projects</span>
                <Badge variant={role === 'owner' ? 'primary' : 'neutral'}>{role === 'owner' && <Crown size={9} />}{role}</Badge>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="secondary" leftIcon={<Pencil size={14} />} onClick={openEditModal}>Edit</Button>
              <Link to={`/settings?workspace=${workspace.id}`}><Button variant="secondary" leftIcon={<Settings size={14} />}>Settings</Button></Link>
              <Link to={`/team?workspace=${workspace.id}`}><Button variant="primary" leftIcon={<Users size={14} />}>Manage Team</Button></Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: workspace.project_count ?? 0, icon: <FolderKanban size={16} />, to: '/projects' },
          { label: 'Tasks', value: workspace.task_count ?? 0, icon: <CheckSquare size={16} />, to: '/tasks' },
          { label: 'Team', value: workspace.member_count ?? 0, icon: <Users size={16} />, to: '/team' },
          { label: 'Chat', value: 'Active', icon: <Briefcase size={16} />, to: '/chat' },
        ].map(s => (
          <Link key={s.label} to={s.to} style={{ ...cardBase, textDecoration: 'none', transition: 'border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
              <span style={{ color: 'var(--brand)' }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{s.value}</div>
          </Link>
        ))}
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Workspace">
        <form onSubmit={handleEditSubmit} className="space-y-5">
          <div>
            <label style={labelStyle}>Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              required
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Workspace name"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={3}
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="What is this workspace for?"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
