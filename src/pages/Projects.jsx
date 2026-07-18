import { useState, useEffect } from 'react';
import { proj, task, ws, unwrapData } from '../services/api';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { FolderKanban, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

const STATUS_VARIANT = {
  active: 'success',
  completed: 'primary',
  on_hold: 'warning',
  archived: 'ghost',
};

const STATUS_LABEL = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  archived: 'Archived',
};

const TASK_STATUS_VARIANT = {
  todo: 'secondary',
  in_progress: 'primary',
  review: 'warning',
  done: 'success',
};

const TASK_STATUS_LABEL = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const TASK_STATUS_CYCLE = ['todo', 'in_progress', 'review', 'done'];

export default function Projects() {
  const { activeWorkspace } = useStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [projectTasks, setProjectTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (activeWorkspace) loadProjects();
  }, [activeWorkspace]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await proj.list(activeWorkspace.id);
      setProjects(unwrapData(res));
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (p) => {
    if (expandedId === p.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(p.id);
    if (!projectTasks[p.id]) {
      setLoadingTasks((prev) => ({ ...prev, [p.id]: true }));
      try {
        const res = await task.list(activeWorkspace.id, p.id);
        setProjectTasks((prev) => ({ ...prev, [p.id]: unwrapData(res) }));
      } catch {
        toast.error('Failed to load tasks');
      } finally {
        setLoadingTasks((prev) => ({ ...prev, [p.id]: false }));
      }
    }
  };

  const cycleTaskStatus = async (t) => {
    const currentIndex = TASK_STATUS_CYCLE.indexOf(t.status);
    const nextStatus = TASK_STATUS_CYCLE[(currentIndex + 1) % TASK_STATUS_CYCLE.length];
    setProjectTasks((prev) => {
      const updated = { ...prev };
      const projTasks = updated[t.project?.id] || [];
      updated[t.project?.id] = projTasks.map((item) => item.id === t.id ? { ...item, status: nextStatus } : item);
      return updated;
    });
    try {
      await task.update(activeWorkspace.id, t.project?.id, t.id, { status: nextStatus });
    } catch {
      toast.error('Failed to update status');
      setProjectTasks((prev) => {
        const updated = { ...prev };
        const projTasks = updated[t.project?.id] || [];
        updated[t.project?.id] = projTasks.map((item) => item.id === t.id ? { ...item, status: t.status } : item);
        return updated;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await proj.delete(activeWorkspace.id, deleteTarget.id);
      toast.success('Project deleted');
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Projects</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{projects.length} projects in {activeWorkspace?.name || 'workspace'}</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
          Create Project
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <LoadingSpinner size={28} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={24} />}
          title="No projects yet"
          description="Create your first project to get started."
          actionLabel="Create Project"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => toggleExpand(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: p.status === 'active' ? 'var(--success)' : p.status === 'completed' ? 'var(--brand)' : p.status === 'on_hold' ? 'var(--warning)' : 'var(--text3)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{p.name}</span>
                    <Badge variant={STATUS_VARIANT[p.status] || 'ghost'} size="xs">
                      {STATUS_LABEL[p.status] || p.status}
                    </Badge>
                  </div>
                  {p.description && (
                    <p style={{
                      fontSize: 12,
                      color: 'var(--text3)',
                      margin: '2px 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {p.description}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                  {p.task_count ?? 0} tasks
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                  {format(new Date(p.created_at), 'MMM d, yyyy')}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 4,
                    cursor: 'pointer',
                    color: 'var(--text3)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; }}
                >
                  <Trash2 size={14} />
                </button>
                {expandedId === p.id ? <ChevronDown size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} /> : <ChevronRight size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />}
              </div>

              {expandedId === p.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
                  {loadingTasks[p.id] ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                      <LoadingSpinner size={20} />
                    </div>
                  ) : (projectTasks[p.id] || []).length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                      No tasks in this project
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(projectTasks[p.id] || []).map((t) => (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            background: 'var(--bg3)',
                            borderRadius: 8,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.title}
                          </span>
                          <Badge variant={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : t.priority === 'medium' ? 'primary' : 'ghost'} size="xs">
                            {t.priority}
                          </Badge>
                          {t.deadline && (
                            <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                              {format(new Date(t.deadline), 'MMM d')}
                            </span>
                          )}
                          <button
                            onClick={() => cycleTaskStatus(t)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            <Badge variant={TASK_STATUS_VARIANT[t.status] || 'secondary'} size="xs">
                              {TASK_STATUS_LABEL[t.status] || t.status}
                            </Badge>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={loadProjects} />

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title="Delete Project"
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
            </div>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useStore();
  const [selectedWs, setSelectedWs] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      setSelectedWs(String(activeWorkspace.id));
    }
  }, [isOpen, activeWorkspace]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedWs) return;
    setLoading(true);
    try {
      await proj.create(Number(selectedWs), { name, description, status });
      toast.success('Project created!');
      setName('');
      setDescription('');
      setStatus('active');
      onClose();
      onCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    color: 'var(--text)',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Project"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Project</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label style={labelStyle}>Workspace *</label>
          <select value={selectedWs} onChange={(e) => setSelectedWs(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} required>
            <option value="">Select workspace</option>
            {(workspaces || []).map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Project Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Project description"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
