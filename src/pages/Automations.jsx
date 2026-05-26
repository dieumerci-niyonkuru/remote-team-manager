import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { automation, ws } from '../services/api';
import toast from 'react-hot-toast';
import {
  Zap, Plus, Trash2, ToggleLeft, ToggleRight,
  ChevronRight, RefreshCw, Clock, CheckCircle2,
  AlertCircle, ArrowRight, X,
} from 'lucide-react';

/* ── design tokens ─────────────────────────────────────────── */
const C = {
  brand:   '#3366ff',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#ef4444',
};

/* ── data maps ─────────────────────────────────────────────── */
const TRIGGER_LABELS = {
  task_done:     { label: 'Task marked Done',      icon: <CheckCircle2 size={14} />, color: C.emerald },
  deadline_near: { label: 'Deadline is near',      icon: <Clock size={14} />,        color: C.amber   },
  task_created:  { label: 'New task created',      icon: <Plus size={14} />,         color: C.brand   },
  task_overdue:  { label: 'Task becomes overdue',  icon: <AlertCircle size={14} />,  color: C.rose    },
};

const ACTION_LABELS = {
  notify_manager:  { label: 'Notify the Manager',          color: C.violet  },
  assign_member:   { label: 'Assign to default member',    color: C.brand   },
  log_time:        { label: 'Auto-log 1 h of time',        color: C.emerald },
  create_subtask:  { label: 'Create a follow-up subtask',  color: C.amber   },
};

function chip(color, label) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: `${color}14`, border: `1px solid ${color}35`,
      color, fontSize: 11, fontWeight: 800,
    }}>
      {label}
    </span>
  );
}

/* ── RuleCard ───────────────────────────────────────────────── */
function RuleCard({ rule, onDelete, onToggle }) {
  const [hov, setHov] = useState(false);
  const trigger = TRIGGER_LABELS[rule.trigger] || { label: rule.trigger, icon: <Zap size={14} />, color: C.brand };
  const action  = ACTION_LABELS[rule.action]   || { label: rule.action,  color: C.violet };
  const active  = rule.is_active !== false;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#0d1425',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 20,
        transition: 'all 0.2s',
        opacity: active ? 1 : 0.55,
      }}
    >
      {/* Trigger pill */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>When</span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 10,
          background: `${trigger.color}10`, border: `1px solid ${trigger.color}25`,
          color: trigger.color, fontSize: 13, fontWeight: 700,
        }}>
          {trigger.icon}
          {trigger.label}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight size={18} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />

      {/* Action pill */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Then</span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 10,
          background: `${action.color}10`, border: `1px solid ${action.color}25`,
          color: action.color, fontSize: 13, fontWeight: 700,
        }}>
          {action.label}
        </div>
      </div>

      {/* Workspace badge */}
      {rule.workspace_name && (
        <div style={{ flexShrink: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
          {rule.workspace_name}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Active badge */}
        {chip(active ? C.emerald : 'rgba(255,255,255,0.3)', active ? 'Active' : 'Paused')}

        {/* Toggle */}
        <button
          onClick={() => onToggle(rule)}
          title={active ? 'Pause rule' : 'Activate rule'}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: active ? C.emerald : 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(rule.id)}
          title="Delete rule"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: C.rose, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── CreateModal ────────────────────────────────────────────── */
function CreateModal({ workspaces, onClose, onCreate }) {
  const [form, setForm] = useState({
    trigger: 'task_done',
    action: 'notify_manager',
    workspace: workspaces[0]?.id || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workspace) { toast.error('Select a workspace'); return; }
    setSaving(true);
    try {
      await onCreate(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const selectStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 11,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, width: '100%', maxWidth: 500, padding: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: `linear-gradient(135deg,${C.brand},${C.violet})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${C.brand}40`,
            }}>
              <Zap size={17} color="#fff" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0 }}>Create Automation</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              Workspace
            </label>
            <select style={{ ...selectStyle, background: '#0d1425' }} value={form.workspace} onChange={e => setForm({ ...form, workspace: e.target.value })} required>
              <option value="">Select workspace…</option>
              {workspaces.map(w => <option key={w.id} value={w.id} style={{ background: '#0d1425' }}>{w.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              IF — Trigger
            </label>
            <select style={{ ...selectStyle, background: '#0d1425' }} value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })}>
              {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1425' }}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Visual connector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <ChevronRight size={14} color="rgba(255,255,255,0.25)" />
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              THEN — Action
            </label>
            <select style={{ ...selectStyle, background: '#0d1425' }} value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1425' }}>{v.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 11,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2, padding: '11px 0', borderRadius: 11,
                background: `linear-gradient(90deg,${C.brand},${C.violet})`,
                border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                boxShadow: `0 4px 14px ${C.brand}40`,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Activating…' : '⚡ Activate Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ────────────────────────────────────────── */
export default function Automations() {
  const [rules, setRules]           = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    Promise.all([automation.list(), ws.list()])
      .then(([aRes, wRes]) => {
        const ruleData = aRes.data;
        const wsData   = wRes.data;
        setRules(Array.isArray(ruleData) ? ruleData : ruleData?.results || []);
        setWorkspaces(Array.isArray(wsData) ? wsData : wsData?.results || wsData?.data || []);
      })
      .catch(() => toast.error('Failed to load automations'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (form) => {
    try {
      const res = await automation.create(form);
      const newRule = res.data?.data || res.data;
      setRules(prev => [newRule, ...prev]);
      toast.success('Automation rule activated! ⚡');
    } catch {
      toast.error('Failed to create automation');
      throw new Error('create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this automation rule?')) return;
    try {
      await automation.delete(id);
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Rule deleted');
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  const handleToggle = async (rule) => {
    const updated = { ...rule, is_active: !rule.is_active };
    // Optimistic update
    setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
    try {
      await automation.update(rule.id, { is_active: updated.is_active });
      toast.success(updated.is_active ? 'Rule activated' : 'Rule paused');
    } catch {
      // Rollback
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      toast.error('Failed to update rule');
    }
  };

  /* ── Render ── */
  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      padding: 'clamp(16px,2.5vw,28px) clamp(16px,3vw,32px)',
      background: 'var(--bg,#060b18)', maxWidth: 1200, margin: '0 auto',
    }}>
      {showCreate && (
        <CreateModal
          workspaces={workspaces}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg,${C.brand},${C.violet})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${C.brand}40`,
          }}>
            <Zap size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 3px' }}>
              Workflow Automation
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              IF-THEN rules that run your projects on autopilot
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setLoading(true); automation.list().then(r => { setRules(Array.isArray(r.data) ? r.data : r.data?.results || []); }).finally(() => setLoading(false)); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 11,
              background: `linear-gradient(90deg,${C.brand},${C.violet})`,
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
              boxShadow: `0 4px 14px ${C.brand}30`,
            }}
          >
            <Plus size={14} /> New Rule
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Rules',  value: rules.length,                           color: C.brand   },
          { label: 'Active',       value: rules.filter(r => r.is_active !== false).length, color: C.emerald },
          { label: 'Paused',       value: rules.filter(r => r.is_active === false).length, color: C.amber   },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Rule list ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 84, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'skelPulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 20px',
          background: '#0d1425', borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
            background: `${C.brand}12`, border: `1px solid ${C.brand}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={28} color={C.brand} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' }}>No automations yet</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '0 0 24px' }}>
            Create IF-THEN rules to make your projects run on autopilot.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '11px 22px', borderRadius: 11,
              background: `linear-gradient(90deg,${C.brand},${C.violet})`,
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
              boxShadow: `0 4px 14px ${C.brand}30`,
            }}
          >
            <Plus size={14} /> Create First Rule
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes skelPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
