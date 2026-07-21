import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { okr, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Target, CheckCircle2, Circle, Minus, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import ProgressRing from '../components/common/ProgressRing';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };
const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

const KR_STATUS = {
  on_track: { color: 'var(--success)', icon: <CheckCircle2 size={12} />, label: 'On Track' },
  at_risk: { color: 'var(--warning)', icon: <Minus size={12} />, label: 'At Risk' },
  off_track: { color: 'var(--danger)', icon: <Circle size={12} />, label: 'Off Track' },
};

const KR_STATUS_OPTIONS = ['on_track', 'at_risk', 'off_track'];

export default function OKR() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showObjModal, setShowObjModal] = useState(false);
  const [objForm, setObjForm] = useState({ title: '', description: '' });
  const [creatingObj, setCreatingObj] = useState(false);
  const [expandedObj, setExpandedObj] = useState(null);
  const [showKRModal, setShowKRModal] = useState(null);
  const [krForm, setKrForm] = useState({ title: '', status: 'on_track', target_value: '', current_value: '' });
  const [creatingKR, setCreatingKR] = useState(false);

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await okr.objectives();
      const objectiveList = unwrapData(res);
      const withKR = await Promise.all(
        objectiveList.map(async (obj) => {
          try {
            const krRes = await okr.keyResults(obj.id);
            return { ...obj, key_results: unwrapData(krRes) };
          } catch {
            return { ...obj, key_results: [] };
          }
        })
      );
      setObjectives(withKR);
    } catch {
      toast.error('Failed to load OKRs');
    } finally {
      setLoading(false);
    }
  };

  const progress = (obj) => {
    if (!obj.key_results?.length) return 0;
    return Math.round(obj.key_results.reduce((a, kr) => a + (kr.progress || 0), 0) / obj.key_results.length);
  };

  const handleCreateObjective = async (e) => {
    e.preventDefault();
    if (!objForm.title.trim()) return;
    setCreatingObj(true);
    try {
      await okr.createObjective({ title: objForm.title.trim(), description: objForm.description.trim(), workspace: activeWorkspace.id });
      toast.success('Objective created');
      setShowObjModal(false);
      setObjForm({ title: '', description: '' });
      load();
    } catch {
      toast.error('Failed to create objective');
    } finally {
      setCreatingObj(false);
    }
  };

  const handleDeleteObjective = async (id) => {
    if (!confirm('Delete this objective and all its key results?')) return;
    try {
      await okr.deleteObjective(id);
      toast.success('Objective deleted');
      load();
    } catch {
      toast.error('Failed to delete objective');
    }
  };

  const handleCreateKR = async (e) => {
    e.preventDefault();
    if (!krForm.title.trim()) return;
    setCreatingKR(true);
    try {
      await okr.createKeyResult(showKRModal, {
        title: krForm.title.trim(),
        status: krForm.status,
        target_value: krForm.target_value ? Number(krForm.target_value) : undefined,
        current_value: krForm.current_value ? Number(krForm.current_value) : undefined,
        progress: krForm.target_value && krForm.current_value
          ? Math.round((Number(krForm.current_value) / Number(krForm.target_value)) * 100)
          : 0,
      });
      toast.success('Key result added');
      setShowKRModal(null);
      setKrForm({ title: '', status: 'on_track', target_value: '', current_value: '' });
      load();
    } catch {
      toast.error('Failed to add key result');
    } finally {
      setCreatingKR(false);
    }
  };

  const handleUpdateKRProgress = async (krId, newProgress) => {
    try {
      await okr.updateKeyResult(krId, { progress: newProgress });
      toast.success('Progress updated');
      load();
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const handleUpdateKRStatus = async (krId, newStatus) => {
    try {
      await okr.updateKeyResult(krId, { status: newStatus });
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteKR = async (krId) => {
    if (!confirm('Delete this key result?')) return;
    try {
      await okr.deleteKeyResult(krId);
      toast.success('Key result deleted');
      load();
    } catch {
      toast.error('Failed to delete key result');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('okr.title', 'OKRs')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{objectives.length} objectives</p>
        </div>
        <Button variant="primary" leftIcon={<Target size={14} />} onClick={() => setShowObjModal(true)}>New Objective</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : objectives.length === 0 ? (
        <EmptyState icon={<Target size={24} />} title="No OKRs yet" description="Set your first objective and key results." />
      ) : (
        <div className="space-y-4">
          {objectives.map((obj, i) => {
            const p = progress(obj);
            const isExpanded = expandedObj === obj.id;
            return (
              <div key={obj.id || i} style={{ ...cardBase, transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div className="flex items-start gap-4">
                  <ProgressRing value={p} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0, flex: 1, minWidth: 0 }}>{obj.title || obj.objective}</h3>
                      <Badge variant={p >= 70 ? 'success' : p >= 40 ? 'warning' : 'danger'}>{p}%</Badge>
                      <button onClick={() => setExpandedObj(isExpanded ? null : obj.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2 }}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button onClick={() => handleDeleteObjective(obj.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {obj.description && <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0' }}>{obj.description}</p>}

                    {isExpanded && (
                      <div className="space-y-2 mt-3">
                        {obj.key_results?.length > 0 && obj.key_results.map((kr, ki) => {
                          const ks = KR_STATUS[kr.status] || KR_STATUS.on_track;
                          return (
                            <div key={ki} style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span style={{ color: ks.color }}>{ks.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{kr.title || kr.name}</span>
                                  <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${kr.progress || 0}%`, background: ks.color, borderRadius: 2, transition: 'width 0.3s' }} />
                                  </div>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', minWidth: 30, textAlign: 'right' }}>{kr.progress || 0}%</span>
                                <select
                                  value={kr.status || 'on_track'}
                                  onChange={e => handleUpdateKRStatus(kr.id, e.target.value)}
                                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px', color: 'var(--text)', fontSize: 10, outline: 'none', cursor: 'pointer' }}
                                >
                                  {KR_STATUS_OPTIONS.map(s => <option key={s} value={s}>{KR_STATUS[s].label}</option>)}
                                </select>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={kr.progress || 0}
                                  onChange={e => handleUpdateKRProgress(kr.id, Math.min(100, Math.max(0, Number(e.target.value))))}
                                  style={{ width: 50, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px', color: 'var(--text)', fontSize: 11, textAlign: 'center', outline: 'none' }}
                                />
                                <button onClick={() => handleDeleteKR(kr.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2 }}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => { setShowKRModal(obj.id); setKrForm({ title: '', status: 'on_track', target_value: '', current_value: '' }); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          <Plus size={13} /> Add Key Result
                        </button>
                      </div>
                    )}

                    {!isExpanded && obj.key_results?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {obj.key_results.slice(0, 3).map((kr, ki) => {
                          const ks = KR_STATUS[kr.status] || KR_STATUS.on_track;
                          return (
                            <div key={ki} className="flex items-center gap-1" style={{ fontSize: 11, color: ks.color }}>
                              {ks.icon} <span>{kr.title || kr.name}</span> <span style={{ fontWeight: 700 }}>{kr.progress || 0}%</span>
                            </div>
                          );
                        })}
                        {obj.key_results.length > 3 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>+{obj.key_results.length - 3} more</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showObjModal && (
        <div onClick={() => setShowObjModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>New Objective</h3>
              <button onClick={() => setShowObjModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateObjective}>
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Title</span>
                <input value={objForm.title} onChange={e => setObjForm({ ...objForm, title: e.target.value })} placeholder="e.g. Increase Q4 revenue" autoFocus style={inputStyle} required />
              </label>
              <label style={{ display: 'block', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Description (optional)</span>
                <textarea value={objForm.description} onChange={e => setObjForm({ ...objForm, description: e.target.value })} placeholder="What does this objective aim to achieve?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowObjModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={creatingObj}>Create Objective</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showKRModal && (
        <div onClick={() => setShowKRModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Add Key Result</h3>
              <button onClick={() => setShowKRModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateKR}>
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Title</span>
                <input value={krForm.title} onChange={e => setKrForm({ ...krForm, title: e.target.value })} placeholder="e.g. Reach 100 active users" autoFocus style={inputStyle} required />
              </label>
              <div className="flex gap-3 mb-3">
                <label style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Target Value</span>
                  <input type="number" min={0} value={krForm.target_value} onChange={e => setKrForm({ ...krForm, target_value: e.target.value })} placeholder="100" style={inputStyle} />
                </label>
                <label style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Current Value</span>
                  <input type="number" min={0} value={krForm.current_value} onChange={e => setKrForm({ ...krForm, current_value: e.target.value })} placeholder="0" style={inputStyle} />
                </label>
              </div>
              <label style={{ display: 'block', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Status</span>
                <div className="flex gap-2">
                  {KR_STATUS_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => setKrForm({ ...krForm, status: s })}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: '0.15s',
                        background: krForm.status === s ? 'var(--brand-bg)' : 'var(--bg3)',
                        border: krForm.status === s ? '1px solid rgba(51,102,255,0.3)' : '1px solid var(--border)',
                        color: krForm.status === s ? 'var(--brand)' : 'var(--text3)' }}>
                      {KR_STATUS[s].label}
                    </button>
                  ))}
                </div>
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowKRModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={creatingKR}>Add Key Result</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
