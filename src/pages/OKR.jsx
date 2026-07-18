import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { okr, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Target, CheckCircle2, Circle, Minus } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import ProgressRing from '../components/common/ProgressRing';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const KR_STATUS = {
  on_track: { color: 'var(--success)', icon: <CheckCircle2 size={12} /> },
  at_risk: { color: 'var(--warning)', icon: <Minus size={12} /> },
  off_track: { color: 'var(--danger)', icon: <Circle size={12} /> },
};

export default function OKR() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      toast.error('Failed to load OKRs');
    } finally {
      setLoading(false);
    }
  };

  const progress = (obj) => {
    if (!obj.key_results?.length) return 0;
    return Math.round(obj.key_results.reduce((a, kr) => a + (kr.progress || 0), 0) / obj.key_results.length);
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('okr.title', 'OKRs')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{objectives.length} objectives</p>
        </div>
        <Button variant="primary" leftIcon={<Target size={14} />}>New Objective</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : objectives.length === 0 ? (
        <EmptyState icon={<Target size={24} />} title="No OKRs yet" description="Set your first objective and key results." />
      ) : (
        <div className="space-y-4">
          {objectives.map((obj, i) => {
            const p = progress(obj);
            return (
              <div key={obj.id || i} style={cardBase}>
                <div className="flex items-start gap-4">
                  <ProgressRing value={p} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{obj.title || obj.objective}</h3>
                      <Badge variant={p >= 70 ? 'success' : p >= 40 ? 'warning' : 'danger'}>{p}%</Badge>
                    </div>
                    {obj.description && <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 12px' }}>{obj.description}</p>}

                    {obj.key_results?.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {obj.key_results.map((kr, ki) => {
                          const ks = KR_STATUS[kr.status] || KR_STATUS.on_track;
                          return (
                            <div key={ki} className="flex items-center gap-3" style={{ padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                              <span style={{ color: ks.color }}>{ks.icon}</span>
                              <div className="flex-1 min-w-0">
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{kr.title || kr.name}</span>
                                <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${kr.progress || 0}%`, background: ks.color, borderRadius: 2, transition: 'width 0.3s' }} />
                                </div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', minWidth: 30, textAlign: 'right' }}>{kr.progress || 0}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
