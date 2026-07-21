import { useState, useEffect } from 'react';
import { task, proj, ws, unwrapData } from '../services/api';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { CheckSquare, Plus, Trash2, Flag } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

const STATUS_TABS = ['all', 'todo', 'in_progress', 'review', 'done'];

const STATUS_VARIANT = {
  todo: 'secondary',
  in_progress: 'primary',
  review: 'warning',
  done: 'success',
};

const STATUS_LABEL = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const STATUS_CYCLE = ['todo', 'in_progress', 'review', 'done'];

const PRIORITY_VARIANT = {
  urgent: 'danger',
  high: 'warning',
  medium: 'primary',
  low: 'ghost',
};

export default function Tasks() {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [taskFilter, setTaskFilter] = useState({ workspace: '', project: '' });

  useEffect(() => {
    if (activeWorkspace) loadTasks();
  }, [activeWorkspace]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await task.list(activeWorkspace.id);
      setTasks(unwrapData(res));
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (taskFilter.workspace && t.workspace?.id !== Number(taskFilter.workspace)) return false;
    if (taskFilter.project && t.project?.id !== Number(taskFilter.project)) return false;
    return true;
  });

  const cycleStatus = async (t) => {
    const currentIndex = STATUS_CYCLE.indexOf(t.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
    setTasks((prev) => prev.map((item) => item.id === t.id ? { ...item, status: nextStatus } : item));
    try {
      await task.update(activeWorkspace.id, t.project?.id, t.id, { status: nextStatus });
      toast.success(`Status changed to ${STATUS_LABEL[nextStatus]}`);
    } catch {
      toast.error('Failed to update status');
      setTasks((prev) => prev.map((item) => item.id === t.id ? { ...item, status: t.status } : item));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await task.delete(activeWorkspace.id, deleteTarget.project?.id, deleteTarget.id);
      toast.success('Task deleted');
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: 'clamp(16px, 4vw, 24px)', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Tasks</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{tasks.length} tasks in {activeWorkspace?.name || 'workspace'}</p>
          </div>
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New Task
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={taskFilter.workspace}
            onChange={(e) => setTaskFilter((prev) => ({ ...prev, workspace: e.target.value }))}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s' }}
          >
            <option value="">All Workspaces</option>
            {(workspaces || []).map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select
            value={taskFilter.project}
            onChange={(e) => setTaskFilter((prev) => ({ ...prev, project: e.target.value }))}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s' }}
          >
            <option value="">All Projects</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 8, padding: 3, alignSelf: 'flex-start', overflowX: 'auto', maxWidth: '100%' }} className="no-scrollbar">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? 'var(--bg2)' : 'transparent',
                border: statusFilter === s ? '1px solid var(--border)' : '1px solid transparent',
                borderRadius: 6,
                padding: '5px 14px',
                fontSize: 11,
                fontWeight: 700,
                color: statusFilter === s ? 'var(--text)' : 'var(--text3)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                boxShadow: statusFilter === s ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {s === 'all' ? 'All' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <LoadingSpinner size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={24} />}
            title="No tasks found"
            description={statusFilter !== 'all' ? 'Try a different filter.' : 'Create your first task to get started.'}
            actionLabel={statusFilter === 'all' ? 'Create Task' : undefined}
            onAction={statusFilter === 'all' ? () => setShowCreate(true) : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((t) => (
              <div
                key={t.id}
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  flexWrap: 'wrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px -6px rgba(0,0,0,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div
                  title={t.priority}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: t.priority === 'urgent' ? 'var(--danger)' : t.priority === 'high' ? 'var(--warning)' : t.priority === 'medium' ? 'var(--brand)' : 'var(--text3)',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {t.title}
                  </span>
                  {t.description && (
                    <p style={{
                      fontSize: 11,
                      color: 'var(--text3)',
                      margin: '2px 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {t.description}
                    </p>
                  )}
                </div>

                {t.project && (
                  <span className="hidden sm:inline" style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, padding: '2px 8px', background: 'var(--bg3)', borderRadius: 6 }}>
                    {t.project.name || t.project}
                  </span>
                )}

                {t.deadline && (
                  <span className="hidden sm:flex" style={{
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0,
                    fontSize: 11,
                    color: 'var(--text3)',
                  }}>
                    {format(new Date(t.deadline), 'MMM d')}
                  </span>
                )}

                <Badge variant={PRIORITY_VARIANT[t.priority] || 'ghost'} size="xs">
                  <Flag size={8} style={{ marginRight: 2 }} />
                  {t.priority}
                </Badge>

                <button
                  onClick={() => cycleStatus(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  title={`Click to change to ${STATUS_LABEL[STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length]]}`}
                >
                  <Badge variant={STATUS_VARIANT[t.status] || 'secondary'} size="xs">
                    {STATUS_LABEL[t.status] || t.status}
                  </Badge>
                </button>

                <button
                  onClick={() => setDeleteTarget(t)}
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
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={loadTasks} />

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title="Delete Task"
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
            </div>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>
            Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

function CreateTaskModal({ isOpen, onClose, onCreated }) {
  const { activeWorkspace, workspaces } = useStore();
  const [selectedWs, setSelectedWs] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      setSelectedWs(String(activeWorkspace.id));
    }
  }, [isOpen, activeWorkspace]);

  useEffect(() => {
    if (selectedWs) {
      proj.list(Number(selectedWs)).then((res) => {
        const list = unwrapData(res) || [];
        setProjects(list);
        if (list.length > 0 && !projectId) setProjectId(String(list[0].id));
      }).catch(() => {});
    } else {
      setProjects([]);
      setProjectId('');
    }
  }, [selectedWs]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDeadline('');
    setProjectId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedWs || !projectId) return;
    setLoading(true);
    try {
      const payload = { title, description, status, priority, deadline: deadline || undefined };
      await task.create(Number(selectedWs), Number(projectId), payload);
      toast.success('Task created!');
      resetForm();
      onClose();
      onCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create task');
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
      title="Create Task"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Task</Button>
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
          <label style={labelStyle}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
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
            placeholder="Task description"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12 }}>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Project *</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} required>
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
