import { useState, useEffect } from 'react';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import { integrations as integrationsApi } from '../services/api';
import {
  Link2, CheckCircle2, ChevronDown, ChevronUp,
  RefreshCw, Unlink, Settings2, Plug,
} from 'lucide-react';

/* ── design tokens ─────────────────────────────────────────── */
const C = {
  brand:   '#3366ff',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#ef4444',
  cyan:    '#06b6d4',
};

/* ── Integration catalogue ─────────────────────────────────── */
const INTEGRATIONS = [
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'Link commits to tasks. Track code changes directly in your workspace.',
    color: '#c9d1d9',
    accent: '#6e7681',
    fields: [{ key: 'repo', label: 'Repository URL', placeholder: 'https://github.com/org/repo', type: 'url' }],
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: 'Sync Notion pages as Wiki articles. Keep docs always up-to-date.',
    color: '#fff',
    accent: '#374151',
    fields: [
      { key: 'api_key', label: 'Notion API Key', placeholder: 'secret_...', type: 'password' },
      { key: 'db_id', label: 'Database ID', placeholder: 'Notion database ID', type: 'text' },
    ],
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    icon: '📂',
    description: 'Attach Google Drive files to tasks. Live file sync for your team.',
    color: '#4285F4',
    accent: '#4285F4',
    fields: [{ key: 'folder_id', label: 'Folder ID', placeholder: 'Google Drive folder ID', type: 'text' }],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Forward notifications to a Slack channel. Never miss an update.',
    color: '#e01e5a',
    accent: '#4A154B',
    fields: [{ key: 'webhook', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...', type: 'url' }],
  },
  {
    id: 'email',
    name: 'Email Digest',
    icon: '📧',
    description: 'Configure scheduled email reports and digest notifications.',
    color: '#EA4335',
    accent: '#EA4335',
    fields: [{ key: 'email', label: 'Notification Email', placeholder: 'team@yourcompany.com', type: 'email' }],
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    icon: '🔗',
    description: 'Connect any app using webhooks. Fully customizable event system.',
    color: C.brand,
    accent: C.brand,
    fields: [{ key: 'url', label: 'Webhook Endpoint', placeholder: 'https://yourapp.com/webhook', type: 'url' }],
  },
];

/* ── IntegrationCard ────────────────────────────────────────── */
function IntegrationCard({ intg, connected, config, dbId, onConnect, onDisconnect, onConfigChange }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hov, setHov] = useState(false);

  const handleConnect = async () => {
    const cfg = config || {};
    if (!intg.fields.every(f => cfg[f.key]?.trim())) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await onConnect(intg.id, cfg, dbId);
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#0d1425',
        border: `1px solid ${connected ? `${intg.accent}40` : hov ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 18, padding: 22, transition: 'all 0.2s',
        boxShadow: connected ? `0 0 0 1px ${intg.accent}20, 0 8px 24px -6px ${intg.accent}15` : 'none',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: expanded ? 18 : 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 13,
          background: `${intg.accent}14`, border: `1px solid ${intg.accent}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {intg.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{intg.name}</span>
            {connected && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 9px', borderRadius: 20,
                background: `${C.emerald}14`, border: `1px solid ${C.emerald}35`,
                color: C.emerald, fontSize: 10, fontWeight: 800,
              }}>
                <CheckCircle2 size={10} /> Connected
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', lineHeight: 1.45 }}>
            {intg.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {connected && (
            <button
              onClick={() => onDisconnect(intg.id, dbId)}
              title="Disconnect"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 13px', borderRadius: 9,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                color: C.rose, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Unlink size={12} /> Disconnect
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 9,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Settings2 size={12} />
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Config fields */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
          {intg.fields.map(f => (
            <div key={f.key}>
              <label style={{
                fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                display: 'block', marginBottom: 7,
              }}>
                {f.label}
              </label>
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={(config || {})[f.key] || ''}
                onChange={e => onConfigChange(intg.id, f.key, e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = C.brand; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={() => setExpanded(false)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={saving}
              style={{
                flex: 2, padding: '10px', borderRadius: 10,
                background: `linear-gradient(90deg,${C.brand},${C.violet})`,
                border: 'none', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                boxShadow: `0 4px 14px ${C.brand}35`,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Connecting…' : connected ? '💾 Save Config' : '🔗 Connect'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MAIN COMPONENT ────────────────────────────────────────── */
export default function Integrations() {
  const { activeWorkspace } = useStore();
  const [connected, setConnected]   = useState({});   // { type: bool }
  const [configs, setConfigs]       = useState({});   // { type: { key: val } }
  const [dbIds, setDbIds]           = useState({});   // { type: db_row_id }
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (activeWorkspace) loadIntegrations();
  }, [activeWorkspace]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const res = await integrationsApi.list(activeWorkspace.id);
      const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];
      const conn = {}, cfgs = {}, ids = {};
      rows.forEach(item => {
        conn[item.type] = item.is_active;
        cfgs[item.type] = item.config || {};
        ids[item.type]  = item.id;
      });
      setConnected(conn);
      setConfigs(cfgs);
      setDbIds(ids);
    } catch {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (type, cfg, existingId) => {
    const intg = INTEGRATIONS.find(i => i.id === type);
    try {
      if (existingId) {
        await integrationsApi.update(existingId, { config: cfg, is_active: true });
      } else {
        await integrationsApi.connect({ workspace: activeWorkspace.id, type, config: cfg, is_active: true });
      }
      toast.success(`${intg.name} connected! 🎉`);
      loadIntegrations();
    } catch {
      toast.error(`Failed to connect ${intg.name}`);
      throw new Error('connect failed');
    }
  };

  const handleDisconnect = async (type, dbId) => {
    const intg = INTEGRATIONS.find(i => i.id === type);
    if (!dbId) return;
    try {
      await integrationsApi.delete(dbId);
      toast.success(`${intg.name} disconnected`);
      loadIntegrations();
    } catch {
      toast.error(`Failed to disconnect ${intg.name}`);
    }
  };

  const handleConfigChange = (type, key, val) => {
    setConfigs(prev => ({
      ...prev,
      [type]: { ...(prev[type] || {}), [key]: val },
    }));
  };

  if (!activeWorkspace) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        Select a workspace to manage integrations.
      </div>
    );
  }

  const connectedCount = Object.values(connected).filter(Boolean).length;

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      padding: 'clamp(16px,2.5vw,28px) clamp(16px,3vw,32px)',
      background: 'var(--bg,#060b18)', maxWidth: 1100, margin: '0 auto',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg,${C.brand},${C.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${C.brand}40`,
          }}>
            <Plug size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 3px' }}>
              Integrations
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {connectedCount} of {INTEGRATIONS.length} connected · {activeWorkspace.name}
            </p>
          </div>
        </div>

        <button
          onClick={loadIntegrations}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Available',  value: INTEGRATIONS.length, color: C.brand   },
          { label: 'Connected',  value: connectedCount,       color: C.emerald },
          { label: 'Inactive',   value: INTEGRATIONS.length - connectedCount, color: 'rgba(255,255,255,0.3)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 110, borderRadius: 18, background: 'rgba(255,255,255,0.04)', animation: 'skelPulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {INTEGRATIONS.map(intg => (
            <IntegrationCard
              key={intg.id}
              intg={intg}
              connected={!!connected[intg.id]}
              config={configs[intg.id]}
              dbId={dbIds[intg.id]}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onConfigChange={handleConfigChange}
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
