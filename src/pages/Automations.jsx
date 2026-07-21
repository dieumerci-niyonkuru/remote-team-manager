import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { automation } from '../services/api';
import { unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Zap, Plus } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

export default function Automations() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', trigger_type: 'task_created', action_type: 'send_notification', is_active: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await automation.list(); setItems(unwrapData(r)); }
    catch (e) { toast.error('Failed to load automations'); } finally { setLoading(false); }
  };

  const toggle = async (id, enabled) => {
    try { await automation.update(id, { enabled: !enabled }); load(); }
    catch (e) { toast.error('Failed'); }
  };

  const openCreate = () => {
    setForm({ name: '', trigger_type: 'task_created', action_type: 'send_notification', is_active: true });
    setShowCreate(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await automation.create({ name: form.name, trigger_type: form.trigger_type, action_type: form.action_type, is_active: form.is_active });
      toast.success('Automation created!');
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create automation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('automations.title', 'Automations')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>Automate repetitive tasks</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={14} />} onClick={openCreate}>New Automation</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Zap size={24} />} title="No automations yet" description="Create automations to save time."
          actionLabel="New Automation" onAction={openCreate} />
      ) : (
        <div className="space-y-3">
          {items.map((auto, i) => (
            <div key={auto.id || i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: 14 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: auto.enabled ? 'var(--brand-bg)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} style={{ color: auto.enabled ? 'var(--brand)' : 'var(--text3)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{auto.name || auto.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0' }}>{auto.description || auto.trigger || 'No description'}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={auto.enabled ? 'success' : 'ghost'}>
                  {auto.enabled ? 'Active' : 'Paused'}
                </Badge>
                <button onClick={() => toggle(auto.id, auto.enabled)}
                  style={{ width: 36, height: 20, borderRadius: 10, background: auto.enabled ? 'var(--brand)' : 'var(--bg3)', border: 'none', cursor: 'pointer', position: 'relative', transition: '0.2s', padding: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: auto.enabled ? 18 : 2, transition: '0.2s' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Automation"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>Create Automation</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Name *</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Notify on new task"
              required
              autoFocus
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Trigger</label>
            <select
              value={form.trigger_type}
              onChange={e => setForm({ ...form, trigger_type: e.target.value })}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', cursor: 'pointer' }}
            >
              <option value="task_created">Task Created</option>
              <option value="status_changed">Status Changed</option>
              <option value="deadline_approaching">Deadline Approaching</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Action</label>
            <select
              value={form.action_type}
              onChange={e => setForm({ ...form, action_type: e.target.value })}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', cursor: 'pointer' }}
            >
              <option value="send_notification">Send Notification</option>
              <option value="assign_member">Assign Member</option>
              <option value="change_status">Change Status</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Is Active</label>
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
              style={{ width: 36, height: 20, borderRadius: 10, background: form.is_active ? 'var(--brand)' : 'var(--bg3)', border: 'none', cursor: 'pointer', position: 'relative', transition: '0.2s', padding: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: form.is_active ? 18 : 2, transition: '0.2s' }} />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
