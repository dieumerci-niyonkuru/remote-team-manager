import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { invites } from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader, ArrowRight, Shield } from 'lucide-react';

const C = { brand: '#3366ff', violet: '#8b5cf6', emerald: '#10b981', rose: '#ef4444' };

export default function JoinWorkspace() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { isAuth } = useStore();

  const [state, setState] = useState('idle'); // idle | loading | success | error | needs_auth
  const [info,  setInfo ] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); setError('No token provided.'); return; }
    if (!isAuth) { setState('needs_auth'); return; }
    joinWorkspace();
    // eslint-disable-next-line
  }, [token, isAuth]);

  const joinWorkspace = async () => {
    setState('loading');
    try {
      const res = await invites.joinByToken(token);
      const data = res.data?.data || res.data;
      setInfo(data);
      setState('success');
      toast.success(`Joined ${data.workspace_name || 'workspace'} 🎉`);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setState('error');
      setError(err.response?.data?.error || 'This invite link is invalid or has expired.');
    }
  };

  /* ── needs_auth: prompt login → come back ── */
  if (state === 'needs_auth') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ ...iconWrap, background: 'rgba(51,102,255,0.12)', border: '1px solid rgba(51,102,255,0.3)' }}>
            <Shield size={28} color={C.brand} />
          </div>
          <h1 style={h1}>Sign in to join</h1>
          <p style={sub}>
            You need an account to accept this workspace invitation.
          </p>
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <Link
              to={`/login?next=/join/${token}`}
              style={{ ...primaryBtn, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <ArrowRight size={15} /> Sign In
            </Link>
            <Link
              to={`/register?next=/join/${token}`}
              style={{ ...secondaryBtn, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── loading ── */
  if (state === 'loading' || state === 'idle') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ ...iconWrap, background: 'rgba(51,102,255,0.08)' }}>
            <Loader size={28} color={C.brand} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h1 style={h1}>Joining workspace…</h1>
          <p style={sub}>Please wait while we add you to the workspace.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  /* ── success ── */
  if (state === 'success') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ ...iconWrap, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle2 size={32} color={C.emerald} />
          </div>
          <h1 style={{ ...h1, color: C.emerald }}>Welcome!</h1>
          <p style={sub}>
            {info?.already_member
              ? `You're already a member of ${info?.workspace_name || 'this workspace'}.`
              : `You've successfully joined ${info?.workspace_name || 'the workspace'} as ${info?.role || 'a member'}.`
            }
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── error ── */
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ ...iconWrap, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <XCircle size={28} color={C.rose} />
        </div>
        <h1 style={{ ...h1, color: C.rose }}>Invalid Link</h1>
        <p style={sub}>{error}</p>
        <Link to="/dashboard" style={{ ...primaryBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ── styles ── */
const pageStyle = {
  minHeight: '100vh', background: '#060b18',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 24,
};
const cardStyle = {
  background: '#0d1425', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24, padding: '48px 36px',
  maxWidth: 420, width: '100%', textAlign: 'center',
};
const iconWrap = {
  width: 64, height: 64, borderRadius: 20,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 20px',
};
const h1 = { fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.03em' };
const sub = { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 24px' };
const primaryBtn = {
  width: '100%', padding: '12px', borderRadius: 12,
  background: `linear-gradient(90deg,#3366ff,#8b5cf6)`,
  color: '#fff', border: 'none', cursor: 'pointer',
  fontSize: 14, fontWeight: 800, boxShadow: '0 4px 16px rgba(51,102,255,0.3)',
};
const secondaryBtn = {
  width: '100%', padding: '12px', borderRadius: 12,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
};
