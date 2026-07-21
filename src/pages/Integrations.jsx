import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { integrations } from '../services/api';
import { unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Check, Plus, Search, Unplug } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const AVAILABLE_INTEGRATIONS = [
  { type: 'slack', name: 'Slack', desc: 'Team messaging', color: '#E01E5A' },
  { type: 'github', name: 'GitHub', desc: 'Code repository', color: '#333' },
  { type: 'google_drive', name: 'Google Drive', desc: 'File storage', color: '#4285F4' },
  { type: 'notion', name: 'Notion', desc: 'Documentation', color: '#000' },
  { type: 'email', name: 'Email', desc: 'Email notifications', color: '#EA4335' },
  { type: 'webhook', name: 'Webhook', desc: 'Custom webhook', color: '#6366f1' },
];

const TYPE_LABELS = { github: 'GitHub', slack: 'Slack', notion: 'Notion', google_drive: 'Google Drive', email: 'Email', webhook: 'Webhook' };

export default function Integrations() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [connecting, setConnecting] = useState(null);

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try { const r = await integrations.list(activeWorkspace.id); setConnected(unwrapData(r)); }
    catch (e) { toast.error('Failed to load integrations'); } finally { setLoading(false); }
  };

  const connect = async (intType) => {
    setConnecting(intType);
    try {
      await integrations.connect({ type: intType, workspace: activeWorkspace.id });
      toast.success(`${TYPE_LABELS[intType] || intType} connected`);
      load();
    } catch (e) {
      const msg = e.response?.data?.type?.[0] || e.response?.data?.detail || e.response?.data?.error || 'Failed to connect';
      toast.error(msg);
    } finally { setConnecting(null); }
  };

  const disconnect = async (id, label) => {
    if (!confirm(`Disconnect ${label}?`)) return;
    try {
      await integrations.delete(id);
      toast.success(`${label} disconnected`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to disconnect'); }
  };

  const connectedTypes = new Set(connected.map(c => c.type?.toLowerCase()));
  const filtered = AVAILABLE_INTEGRATIONS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.type.includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('integrations.title', 'Integrations')}</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>Connect your favorite tools</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : (
        <>
          {connected.length > 0 && (
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Connected</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {connected.map((c, i) => {
                  const label = TYPE_LABELS[c.type] || c.type || 'Integration';
                  const match = AVAILABLE_INTEGRATIONS.find(a => a.type === c.type);
                  return (
                    <div key={c.id || i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${match?.color || 'var(--success)'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: match?.color || 'var(--success)' }}>
                        {label.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{label}</h3>
                        <p style={{ fontSize: 11, color: 'var(--text3)', margin: '1px 0 0' }}>Connected</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                      <button onClick={() => disconnect(c.id, label)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }} title="Disconnect">
                        <Unplug size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Available</h2>
            <div style={{ position: 'relative', maxWidth: 260, marginBottom: 12 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations..."
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(51,102,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px 8px 30px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((int, i) => {
                const isConn = connectedTypes.has(int.type);
                return (
                  <div key={i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: 12 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${int.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: int.color }}>
                      {int.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{int.name}</h3>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: '1px 0 0' }}>{int.desc}</p>
                    </div>
                    {isConn ? (
                      <Badge variant="success">Connected</Badge>
                    ) : (
                      <Button variant="primary" size="sm" loading={connecting === int.type} onClick={() => connect(int.type)} leftIcon={<Plus size={12} />}>
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
