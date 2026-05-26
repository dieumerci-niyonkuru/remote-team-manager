import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { okr as okrApi, ws as wsApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  Target, Plus, ChevronDown, ChevronUp, Trash2,
  TrendingUp, CheckCircle2, Circle, Zap, X,
  Edit3, Check,
} from 'lucide-react';

/* ── design tokens ─────────────────────────────────────────── */
const C = {
  brand:   '#3366ff',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#ef4444',
};

/* ── helpers ────────────────────────────────────────────────── */
function pct(current, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function progressColor(p) {
  if (p >= 80) return C.emerald;
  if (p >= 50) return C.brand;
  if (p >= 25) return C.amber;
  return C.rose;
}

function ProgressBar({ value, max = 100, color }) {
  const p = pct(value, max);
  const c = color || progressColor(p);
  return (
    <div style={{ position: 'relative', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${p}%`, borderRadius: 99,
        background: `linear-gradient(90deg, ${c}99, ${c})`,
        transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: `0 0 8px ${c}60`,
      }} />
    </div>
  );
}

/* ── KeyResultRow ────────────────────────────────────────────── */
function KeyResultRow({ kr, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(kr.current_value);
  const p = pct(kr.current_value, kr.target_value);
  const c = progressColor(p);

  const save = async () => {
    const n = parseFloat(val);
    if (isNaN(n)) { toast.error('Enter a valid number'); return; }
    await onUpdate(kr.id, { current_value: n });
    setEditing(false);
  };

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {p >= 100
          ? <CheckCircle2 size={14} color={C.emerald} style={{ flexShrink: 0 }} />
          : <Circle       size={14} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
        }
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 0 }}>
          {kr.title}
        </span>

        {/* Value badge / editor */}
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              value={val}
              autoFocus
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
              style={{
                width: 72, padding: '4px 8px', borderRadius: 8, fontSize: 12,
                background: 'rgba(255,255,255,0.1)', border: `1px solid ${C.brand}`,
                color: '#fff', outline: 'none',
              }}
            />
            <button onClick={save} style={{ background: 'none', border: 'none', color: C.emerald, cursor: 'pointer', padding: 2 }}>
              <Check size={14} />
            </button>
            <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: c,
              padding: '2px 8px', borderRadius: 6,
              background: `${c}14`, border: `1px solid ${c}30`,
            }}>
              {kr.current_value}/{kr.target_value} {kr.unit}
            </span>
            <button
              onClick={() => setEditing(true)}
              title="Update progress"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 2 }}
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={() => onDelete(kr.id)}
              title="Delete key result"
              style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.45)', cursor: 'pointer', padding: 2 }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      <ProgressBar value={kr.current_value} max={kr.target_value} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: c }}>{p}%</span>
      </div>
    </div>
  );
}

/* ── ObjectiveCard ───────────────────────────────────────────── */
function ObjectiveCard({ obj, workspaces, onDelete, onAddKR, onUpdateKR, onDeleteKR }) {
  const [open, setOpen]     = useState(true);
  const [krForm, setKrForm] = useState({ title: '', target_value: 100, unit: '%' });
  const [addingKR, setAddingKR] = useState(false);
  const [saving, setSaving]    = useState(false);

  const krs  = obj.key_results || [];
  const avgP = krs.length
    ? Math.round(krs.reduce((s, kr) => s + pct(kr.current_value, kr.target_value), 0) / krs.length)
    : 0;
  const barColor = progressColor(avgP);
  const ws = workspaces.find(w => w.id === obj.workspace);

  const submitKR = async (e) => {
    e.preventDefault();
    if (!krForm.title.trim()) { toast.error('Enter a key result title'); return; }
    setSaving(true);
    try {
      await onAddKR(obj.id, krForm);
      setKrForm({ title: '', target_value: 100, unit: '%' });
      setAddingKR(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: '#0d1425', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, overflow: 'hidden',
    }}>
      {/* Objective header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        {/* Progress ring placeholder */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `conic-gradient(${barColor} ${avgP}%, rgba(255,255,255,0.07) 0)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 3px #0d1425, 0 0 0 4px ${barColor}30`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#0d1425',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: barColor }}>{avgP}%</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {obj.title}
            {ws && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {ws.name}
              </span>
            )}
          </div>
          <ProgressBar value={avgP} max={100} color={barColor} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
            {krs.length} KR{krs.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(obj.id); }}
            style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.4)', cursor: 'pointer', padding: 4 }}
          >
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={16} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.3)" />}
        </div>
      </div>

      {/* Key results list */}
      {open && (
        <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {obj.description && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '12px 0 8px' }}>{obj.description}</p>
          )}

          {krs.length === 0 && !addingKR && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '12px 0', fontStyle: 'italic' }}>
              No key results yet. Add one to start tracking progress.
            </p>
          )}

          {krs.map(kr => (
            <KeyResultRow
              key={kr.id}
              kr={kr}
              onUpdate={onUpdateKR}
              onDelete={onDeleteKR}
            />
          ))}

          {/* Add KR form */}
          {addingKR ? (
            <form onSubmit={submitKR} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                autoFocus
                placeholder="Key result title…"
                value={krForm.title}
                onChange={e => setKrForm(f => ({ ...f, title: e.target.value }))}
                style={{
                  padding: '9px 12px', borderRadius: 10, fontSize: 13,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.brand; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  placeholder="Target (e.g. 100)"
                  value={krForm.target_value}
                  onChange={e => setKrForm(f => ({ ...f, target_value: parseFloat(e.target.value) || 100 }))}
                  style={{
                    flex: 2, padding: '9px 12px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', outline: 'none',
                  }}
                />
                <input
                  placeholder="Unit (e.g. %)"
                  value={krForm.unit}
                  onChange={e => setKrForm(f => ({ ...f, unit: e.target.value }))}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setAddingKR(false)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2, padding: '8px', borderRadius: 9,
                    background: `linear-gradient(90deg,${C.brand},${C.violet})`,
                    border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 800,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Adding…' : 'Add Key Result'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingKR(true)}
              style={{
                marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 9,
                background: 'rgba(51,102,255,0.08)', border: '1px dashed rgba(51,102,255,0.25)',
                color: C.brand, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                width: '100%', justifyContent: 'center',
              }}
            >
              <Plus size={13} /> Add Key Result
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── CreateObjectiveModal ────────────────────────────────────── */
function CreateObjectiveModal({ workspaces, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', workspace: workspaces[0]?.id || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.workspace)    { toast.error('Select a workspace'); return; }
    setSaving(true);
    try {
      await onCreate(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    padding: '10px 14px', borderRadius: 11, fontSize: 13, width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', outline: 'none',
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 480, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg,${C.brand},${C.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${C.brand}40` }}>
              <Target size={17} color="#fff" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0 }}>New Objective</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7 }}>Workspace</label>
            <select
              value={form.workspace}
              onChange={e => setForm(f => ({ ...f, workspace: e.target.value }))}
              style={{ ...inp, background: '#0d1425', cursor: 'pointer' }}
              required
            >
              <option value="">Select workspace…</option>
              {workspaces.map(w => <option key={w.id} value={w.id} style={{ background: '#0d1425' }}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7 }}>Objective Title</label>
            <input
              autoFocus
              placeholder="e.g. Launch v2.0 by Q4"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={inp}
              onFocus={e => { e.target.style.borderColor = C.brand; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7 }}>Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <textarea
              rows={2}
              placeholder="Why does this objective matter?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={e => { e.target.style.borderColor = C.brand; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px 0', borderRadius: 11, background: `linear-gradient(90deg,${C.brand},${C.violet})`, border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 14px ${C.brand}40`, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : '🎯 Create Objective'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ────────────────────────────────────────── */
export default function OKR() {
  const { activeWorkspace } = useStore();
  const [objectives, setObjectives] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [objRes, wsRes] = await Promise.all([okrApi.objectives(), wsApi.list()]);
      const objs = objRes.data;
      const wsList = wsRes.data;
      setObjectives(Array.isArray(objs) ? objs : objs?.results || []);
      setWorkspaces(Array.isArray(wsList) ? wsList : wsList?.results || wsList?.data || []);
    } catch {
      toast.error('Failed to load OKRs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    try {
      const res = await okrApi.createObjective(form);
      const created = res.data?.data || res.data;
      setObjectives(prev => [{ ...created, key_results: [] }, ...prev]);
      toast.success('Objective created! 🎯');
    } catch {
      toast.error('Failed to create objective');
      throw new Error('create failed');
    }
  };

  const handleDeleteObjective = async (id) => {
    if (!confirm('Delete this objective and all its key results?')) return;
    try {
      await okrApi.deleteObjective(id);
      setObjectives(prev => prev.filter(o => o.id !== id));
      toast.success('Objective deleted');
    } catch {
      toast.error('Failed to delete objective');
    }
  };

  const handleAddKR = async (objectiveId, form) => {
    try {
      const res = await okrApi.createKeyResult(objectiveId, form);
      const kr = res.data?.data || res.data;
      setObjectives(prev => prev.map(o =>
        o.id === objectiveId
          ? { ...o, key_results: [...(o.key_results || []), kr] }
          : o
      ));
      toast.success('Key result added');
    } catch {
      toast.error('Failed to add key result');
      throw new Error('kr create failed');
    }
  };

  const handleUpdateKR = async (krId, data) => {
    try {
      await okrApi.updateKeyResult(krId, data);
      setObjectives(prev => prev.map(o => ({
        ...o,
        key_results: (o.key_results || []).map(kr =>
          kr.id === krId ? { ...kr, ...data } : kr
        ),
      })));
    } catch {
      toast.error('Failed to update key result');
    }
  };

  const handleDeleteKR = async (krId) => {
    if (!confirm('Remove this key result?')) return;
    try {
      await okrApi.deleteKeyResult(krId);
      setObjectives(prev => prev.map(o => ({
        ...o,
        key_results: (o.key_results || []).filter(kr => kr.id !== krId),
      })));
      toast.success('Key result removed');
    } catch {
      toast.error('Failed to remove key result');
    }
  };

  /* ── stats ── */
  const totalKRs = objectives.reduce((s, o) => s + (o.key_results?.length || 0), 0);
  const doneKRs  = objectives.reduce((s, o) =>
    s + (o.key_results || []).filter(kr => pct(kr.current_value, kr.target_value) >= 100).length, 0);
  const avgProgress = objectives.length
    ? Math.round(objectives.reduce((s, o) => {
        const krs = o.key_results || [];
        return s + (krs.length ? krs.reduce((ks, kr) => ks + pct(kr.current_value, kr.target_value), 0) / krs.length : 0);
      }, 0) / objectives.length)
    : 0;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 'clamp(16px,2.5vw,28px) clamp(16px,3vw,32px)', background: 'var(--bg,#060b18)', maxWidth: 1100, margin: '0 auto' }}>

      {showCreate && (
        <CreateObjectiveModal
          workspaces={workspaces}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.brand},${C.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${C.brand}40` }}>
            <Target size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 3px' }}>
              OKRs
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Objectives & Key Results · {activeWorkspace?.name || 'All workspaces'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, background: `linear-gradient(90deg,${C.brand},${C.violet})`, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, boxShadow: `0 4px 14px ${C.brand}30` }}
        >
          <Plus size={14} /> New Objective
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Objectives',   value: objectives.length, color: C.brand   },
          { label: 'Key Results',  value: totalKRs,           color: C.violet  },
          { label: 'Completed KRs', value: doneKRs,           color: C.emerald },
          { label: 'Avg Progress', value: `${avgProgress}%`,  color: progressColor(avgProgress) },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Objectives list ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 92, borderRadius: 18, background: 'rgba(255,255,255,0.04)', animation: 'skelPulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : objectives.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#0d1425', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px', background: `${C.brand}12`, border: `1px solid ${C.brand}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={28} color={C.brand} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' }}>No objectives yet</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '0 0 24px' }}>
            Create your first objective to start tracking your team's most important goals.
          </p>
          <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 11, background: `linear-gradient(90deg,${C.brand},${C.violet})`, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, boxShadow: `0 4px 14px ${C.brand}30` }}>
            <Plus size={14} /> Create First Objective
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {objectives.map(obj => (
            <ObjectiveCard
              key={obj.id}
              obj={obj}
              workspaces={workspaces}
              onDelete={handleDeleteObjective}
              onAddKR={handleAddKR}
              onUpdateKR={handleUpdateKR}
              onDeleteKR={handleDeleteKR}
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
