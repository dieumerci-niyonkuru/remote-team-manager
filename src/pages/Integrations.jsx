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
  { name: 'Slack', desc: 'Team messaging', color: '#E01E5A' },
  { name: 'GitHub', desc: 'Code repository', color: '#333' },
  { name: 'Google Drive', desc: 'File storage', color: '#4285F4' },
  { name: 'Figma', desc: 'Design tool', color: '#A259FF' },
  { name: 'Jira', desc: 'Project tracking', color: '#0052CC' },
  { name: 'Zoom', desc: 'Video conferencing', color: '#2D8CFF' },
];

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

  const connect = async (name) => {
    setConnecting(name);
    try {
      await integrations.connect({ name, workspace: activeWorkspace.id });
      toast.success(`${name} connected`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to connect'); }
    finally { setConnecting(null); }
  };

  const disconnect = async (id, name) => {
    if (!confirm(`Disconnect ${name}?`)) return;
    try {
      await integrations.delete(id);
      toast.success(`${name} disconnected`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to disconnect'); }
  };

  const connectedNames = new Set(connected.map(c => c.name?.toLowerCase()));
  const filtered = AVAILABLE_INTEGRATIONS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

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
                {connected.map((c, i) => (
                  <div key={c.id || i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={16} style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{c.name || c.integration_name}</h3>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: '1px 0 0' }}>Connected</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                    <button onClick={() => disconnect(c.id, c.name || c.integration_name)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }} title="Disconnect">
                      <Unplug size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Available</h2>
            <div style={{ position: 'relative', maxWidth: 260, marginBottom: 12 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations..."
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px 8px 30px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((int, i) => {
                const isConn = connectedNames.has(int.name.toLowerCase());
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
                      <Button variant="primary" size="sm" loading={connecting === int.name} onClick={() => connect(int.name)} leftIcon={<Plus size={12} />}>
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
