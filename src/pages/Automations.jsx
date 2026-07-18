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

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

export default function Automations() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('automations.title', 'Automations')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>Automate repetitive tasks</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={14} />}>New Automation</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Zap size={24} />} title="No automations yet" description="Create automations to save time."
          actionLabel="New Automation" onAction={() => {}} />
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
    </div>
  );
}
