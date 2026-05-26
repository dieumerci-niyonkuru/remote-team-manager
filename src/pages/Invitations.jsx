import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { invites, ws as wsApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  Mail, Check, X, Clock, Shield, UserPlus, Globe, Copy, Link2,
  RefreshCw, ChevronDown, Trash2, ExternalLink, Users, Zap,
  QrCode, Plus, AlertCircle, CheckCircle2, ArrowRight, Send,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────── */
/* Tiny design tokens                                           */
/* ──────────────────────────────────────────────────────────── */
const C = {
  brand:   '#3366ff',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#ef4444',
  cyan:    '#06b6d4',
};

const ROLES = [
  { value: 'viewer',          label: 'Viewer',          desc: 'Read-only access',         color: '#64748b' },
  { value: 'developer',       label: 'Developer',       desc: 'Create & update tasks',    color: C.brand   },
  { value: 'designer',        label: 'Designer',        desc: 'Create & update tasks',    color: C.violet  },
  { value: 'manager',         label: 'Manager',         desc: 'Manage projects & team',   color: C.emerald },
  { value: 'admin',           label: 'Admin',           desc: 'Full workspace access',    color: C.rose    },
];

const EXPIRY_OPTIONS = [
  { value: 1,  label: '1 day'    },
  { value: 3,  label: '3 days'   },
  { value: 7,  label: '7 days'   },
  { value: 14, label: '14 days'  },
  { value: 30, label: '30 days'  },
];

/* ──────────────────────────────────────────────────────────── */
/* Helpers                                                       */
/* ──────────────────────────────────────────────────────────── */
function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt) - Date.now()) / 86400000);
}

function expiryBadge(expiresAt) {
  const d = daysLeft(expiresAt);
  if (d === null) return null;
  if (d <= 0)  return { label: 'Expired',    color: C.rose    };
  if (d <= 2)  return { label: `${d}d left`, color: C.rose    };
  if (d <= 5)  return { label: `${d}d left`, color: C.amber   };
  return             { label: `${d}d left`, color: C.emerald };
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

/* ──────────────────────────────────────────────────────────── */
/* Sub-components                                                */
/* ──────────────────────────────────────────────────────────── */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#0d1425',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHead({ icon, title, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ color: C.brand }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, flex: 1 }}>{title}</h3>
      {badge !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 800, color: C.brand, background: 'rgba(51,102,255,0.12)', padding: '3px 10px', borderRadius: 20 }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function RolePill({ value }) {
  const role = ROLES.find(r => r.value === value) || ROLES[0];
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: role.color, background: `${role.color}18`,
      border: `1px solid ${role.color}30`,
      padding: '2px 8px', borderRadius: 6,
    }}>
      {role.label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* Received invite card                                          */
/* ──────────────────────────────────────────────────────────── */
function ReceivedCard({ invite, onAccept, onReject }) {
  const [busy, setBusy] = useState(false);
  const eb = expiryBadge(invite.expires_at);
  const initials = (invite.workspace_name || 'W')[0].toUpperCase();
  const bgColors = [C.brand, C.violet, C.emerald, C.amber, C.rose, C.cyan];
  const bg = bgColors[initials.charCodeAt(0) % bgColors.length];

  const act = async (fn) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Avatar */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(135deg,${bg},${bg}88)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 900, color: '#fff',
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
          {invite.workspace_name || 'Workspace'}
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' }}>
          Invited by <span style={{ color: C.brand, fontWeight: 700 }}>{invite.invited_by_name || 'Someone'}</span>
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <RolePill value={invite.role} />
          {eb && (
            <span style={{ fontSize: 10, fontWeight: 700, color: eb.color, background: `${eb.color}15`, padding: '2px 8px', borderRadius: 6 }}>
              {eb.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          disabled={busy}
          onClick={() => act(onAccept)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 11,
            background: `linear-gradient(90deg,${C.brand},${C.violet})`,
            color: '#fff', border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 800,
            boxShadow: '0 4px 14px rgba(51,102,255,0.3)',
            opacity: busy ? 0.7 : 1, transition: 'transform 0.15s, opacity 0.15s',
          }}
          onMouseEnter={e => !busy && (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}
        >
          <Check size={14} /> Accept
        </button>
        <button
          disabled={busy}
          onClick={() => act(onReject)}
          style={{
            padding: '9px 14px', borderRadius: 11,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: C.rose, cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* Sent invite row                                               */
/* ──────────────────────────────────────────────────────────── */
function SentRow({ invite, onDelete, onCopy }) {
  const eb = expiryBadge(invite.expires_at);
  const joinUrl = `${window.location.origin}/join/${invite.token}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(51,102,255,0.1)', border: '1px solid rgba(51,102,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Mail size={15} color={C.brand} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {invite.email || 'Shareable link'}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <RolePill value={invite.role} />
          {invite.accepted ? (
            <span style={{ fontSize: 10, fontWeight: 800, color: C.emerald, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle2 size={9} /> Joined
            </span>
          ) : eb ? (
            <span style={{ fontSize: 10, fontWeight: 700, color: eb.color, background: `${eb.color}15`, padding: '2px 8px', borderRadius: 6 }}>
              {eb.label}
            </span>
          ) : null}
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            {new Date(invite.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {!invite.accepted && (
          <button
            onClick={handleCopy}
            title="Copy invite link"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', borderRadius: 9,
              background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(51,102,255,0.08)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(51,102,255,0.2)'}`,
              color: copied ? C.emerald : C.brand,
              fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        )}
        <button
          onClick={onDelete}
          style={{
            padding: '7px 9px', borderRadius: 9,
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            color: C.rose, cursor: 'pointer', display: 'flex', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* Generate Link Panel                                           */
/* ──────────────────────────────────────────────────────────── */
function GenerateLinkPanel({ workspaces, activeWorkspace, onGenerated }) {
  const [wsId, setWsId]       = useState(activeWorkspace?.id || '');
  const [email, setEmail]     = useState('');
  const [role, setRole]       = useState('developer');
  const [expiry, setExpiry]   = useState(7);
  const [busy, setBusy]       = useState(false);
  const [result, setResult]   = useState(null);
  const [copied, setCopied]   = useState(false);

  const generate = async () => {
    if (!wsId) { toast.error('Please select a workspace'); return; }
    setBusy(true);
    try {
      const res = await invites.generateLink({ workspace: wsId, email, role, expires_days: expiry });
      const data = res.data?.data || res.data;
      const joinUrl = data.join_url || `${window.location.origin}/join/${data.token}`;
      setResult({ ...data, join_url: joinUrl });
      toast.success('Invite link generated!');
      onGenerated?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate link');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.join_url) return;
    await copyToClipboard(result.join_url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Workspace selector */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Workspace
        </label>
        <select
          value={wsId}
          onChange={e => setWsId(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 11,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none',
          }}
        >
          <option value="" style={{ background: '#0d1425' }}>Select workspace…</option>
          {workspaces.map(w => (
            <option key={w.id} value={w.id} style={{ background: '#0d1425' }}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Email (optional) */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Email (optional — leave blank for a universal link)
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 11, boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
      </div>

      {/* Role + Expiry row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 11,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none',
            }}
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value} style={{ background: '#0d1425' }}>{r.label} — {r.desc}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Expires in</label>
          <select
            value={expiry}
            onChange={e => setExpiry(Number(e.target.value))}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 11,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none',
            }}
          >
            {EXPIRY_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: '#0d1425' }}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={busy || !wsId}
        style={{
          width: '100%', padding: '12px', borderRadius: 12,
          background: `linear-gradient(90deg,${C.brand},${C.violet})`,
          color: '#fff', border: 'none', cursor: busy || !wsId ? 'not-allowed' : 'pointer',
          fontSize: 14, fontWeight: 800,
          opacity: busy || !wsId ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 18px rgba(51,102,255,0.3)',
          transition: 'transform 0.15s, opacity 0.15s',
        }}
        onMouseEnter={e => !busy && !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = '')}
      >
        <Link2 size={16} />
        {busy ? 'Generating…' : 'Generate Invite Link'}
      </button>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: 20, padding: 16, borderRadius: 14,
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={16} color={C.emerald} />
            <span style={{ fontSize: 13, fontWeight: 800, color: C.emerald }}>Link Ready!</span>
            <RolePill value={result.role} />
            {result.expires_at && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>
                Expires {new Date(result.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 10,
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{
              flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.6)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}>
              {result.join_url}
            </span>
            <button
              onClick={handleCopy}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: copied ? `${C.emerald}20` : `${C.brand}20`,
                border: `1px solid ${copied ? `${C.emerald}40` : `${C.brand}40`}`,
                color: copied ? C.emerald : C.brand,
                fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '10px 0 0', lineHeight: 1.6 }}>
            Share this link with teammates. Anyone with the link can join as <strong style={{ color: '#fff' }}>{result.role}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* Join by Token Panel                                           */
/* ──────────────────────────────────────────────────────────── */
function JoinByTokenPanel() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  const handleJoin = async () => {
    const t = token.trim();
    if (!t) { toast.error('Enter an invite token or paste a link'); return; }
    // Support pasting a full URL: extract token from /join/<token>
    const match = t.match(/\/join\/([A-Za-z0-9_-]+)/);
    const cleanToken = match ? match[1] : t;
    setBusy(true);
    try {
      const res = await invites.joinByToken(cleanToken);
      const data = res.data?.data || res.data;
      toast.success(`Joined ${data.workspace_name || 'workspace'} 🎉`);
      setTimeout(() => navigate('/workspaces'), 800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired token');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 16px', lineHeight: 1.6 }}>
        Have an invite link or token? Paste it below to join a workspace instantly.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={token}
          onChange={e => setToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="Paste invite link or token…"
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 11, boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
        <button
          onClick={handleJoin}
          disabled={busy || !token.trim()}
          style={{
            flexShrink: 0, padding: '11px 20px', borderRadius: 11,
            background: `linear-gradient(90deg,${C.brand},${C.violet})`,
            color: '#fff', border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 800, opacity: busy ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          <ArrowRight size={15} />
          {busy ? 'Joining…' : 'Join'}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* MAIN PAGE                                                     */
/* ──────────────────────────────────────────────────────────── */
export default function Invitations() {
  const { user, activeWorkspace, workspaces = [] } = useStore();
  const navigate = useNavigate();

  const [received, setReceived] = useState([]);
  const [sent,     setSent    ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [tab,      setTab     ] = useState('received'); // 'received' | 'sent' | 'generate' | 'join'
  const [refresh,  setRefresh ] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, sentRes] = await Promise.allSettled([
        invites.received(),
        invites.sent(activeWorkspace?.id),
      ]);
      const safe = r => (r.status === 'fulfilled' ? (r.value?.data?.data || r.value?.data || []) : []);
      setReceived(Array.isArray(safe(recRes)) ? safe(recRes) : []);
      setSent(Array.isArray(safe(sentRes)) ? safe(sentRes) : []);
    } catch (err) {
      console.error('Failed to load invites:', err);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => { load(); }, [load, refresh]);

  const handleAccept = async (id) => {
    await invites.accept(id);
    toast.success('Invitation accepted! 🎉');
    setRefresh(r => r + 1);
  };

  const handleReject = async (id) => {
    await invites.reject(id);
    toast.success('Invitation declined');
    setRefresh(r => r + 1);
  };

  const handleDelete = async (id) => {
    await invites.delete(id);
    toast.success('Invite removed');
    setRefresh(r => r + 1);
  };

  const TABS = [
    { id: 'received', label: 'Received',      icon: <Mail size={14} />,     badge: received.filter(i => !i.accepted).length || null },
    { id: 'sent',     label: 'Sent',           icon: <Send size={14} />,     badge: sent.length || null },
    { id: 'generate', label: 'Generate Link',  icon: <Link2 size={14} />,   badge: null },
    { id: 'join',     label: 'Join by Link',   icon: <ArrowRight size={14} />, badge: null },
  ];

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      padding: 'clamp(16px,2.5vw,32px) clamp(16px,3vw,40px)',
      background: 'var(--bg,#060b18)',
      maxWidth: 900, margin: '0 auto',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 30 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(51,102,255,0.12)', border: '1px solid rgba(51,102,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UserPlus size={24} color={C.brand} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
              Invitations
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Manage workspace access · Share invite links · Join via token
            </p>
          </div>
        </div>

        <button
          onClick={() => { setRefresh(r => r + 1); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 11,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pending for you', value: received.filter(i => !i.accepted).length, color: C.brand, icon: <Mail size={16} /> },
          { label: 'Invites sent',    value: sent.length,                               color: C.violet, icon: <Send size={16} /> },
          { label: 'Joined',          value: sent.filter(i => i.accepted).length,       color: C.emerald, icon: <CheckCircle2 size={16} /> },
          { label: 'Workspaces',      value: workspaces.length,                         color: C.amber, icon: <Globe size={16} /> },
        ].map(s => (
          <div key={s.label} style={{
            padding: '16px 18px', borderRadius: 16,
            background: '#0d1425', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: s.color }}>{s.icon}</div>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 3px', lineHeight: 1 }}>{loading ? '—' : s.value}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto',
        padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: 14,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 10, flex: 1, minWidth: 'max-content',
              background: tab === t.id ? '#0d1425' : 'transparent',
              border: tab === t.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {t.icon} {t.label}
            {t.badge ? (
              <span style={{ marginLeft: 2, fontSize: 10, fontWeight: 900, color: '#fff', background: C.brand, padding: '1px 7px', borderRadius: 20 }}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {tab === 'received' && (
        <Card>
          <SectionHead icon={<Mail size={16} />} title="Pending Invitations" badge={received.filter(i => !i.accepted).length} />
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTop: `2px solid ${C.brand}`, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              Loading invitations…
            </div>
          ) : received.filter(i => !i.accepted).length === 0 ? (
            <div style={{ padding: '52px', textAlign: 'center' }}>
              <CheckCircle2 size={36} color={C.emerald} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
              <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>You're all caught up!</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>No pending workspace invitations.</p>
            </div>
          ) : (
            received.filter(i => !i.accepted).map(inv => (
              <ReceivedCard
                key={inv.id}
                invite={inv}
                onAccept={() => handleAccept(inv.id)}
                onReject={() => handleReject(inv.id)}
              />
            ))
          )}
        </Card>
      )}

      {tab === 'sent' && (
        <Card>
          <SectionHead icon={<Send size={16} />} title="Sent Invitations" badge={sent.length} />
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTop: `2px solid ${C.brand}`, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              Loading…
            </div>
          ) : sent.length === 0 ? (
            <div style={{ padding: '52px', textAlign: 'center' }}>
              <Send size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2, color: '#fff' }} />
              <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>No invitations sent yet</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '0 0 20px' }}>
                Generate a link or email to invite teammates.
              </p>
              <button
                onClick={() => setTab('generate')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 11,
                  background: `linear-gradient(90deg,${C.brand},${C.violet})`,
                  color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
                }}
              >
                <Link2 size={14} /> Generate Invite Link
              </button>
            </div>
          ) : (
            sent.map(inv => (
              <SentRow key={inv.id} invite={inv} onDelete={() => handleDelete(inv.id)} />
            ))
          )}
        </Card>
      )}

      {tab === 'generate' && (
        <Card>
          <SectionHead icon={<Link2 size={16} />} title="Generate Invite Link" />
          <GenerateLinkPanel
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onGenerated={() => setRefresh(r => r + 1)}
          />
        </Card>
      )}

      {tab === 'join' && (
        <Card>
          <SectionHead icon={<ArrowRight size={16} />} title="Join a Workspace" />
          <JoinByTokenPanel />
        </Card>
      )}

      {/* ── Tip ── */}
      <div style={{
        marginTop: 20, padding: '14px 18px', borderRadius: 14,
        background: 'rgba(51,102,255,0.06)', border: '1px solid rgba(51,102,255,0.18)',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <AlertCircle size={16} color={C.brand} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.7 }}>
          <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Tip:</strong> Invite links expire after the selected duration.
          Anyone with the link can join until it expires — share carefully.
          Email-specific invites restrict access to that email address.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          input, select { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}
