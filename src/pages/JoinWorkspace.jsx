import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invites, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Briefcase, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(24px,4vw,40px)' };

export default function JoinWorkspace() {
  const { user, setActiveWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!token) { setError('No invitation token found.'); setLoading(false); return; }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    try {
      const r = await invites.joinByToken(token);
      const data = unwrapData(r);
      setWorkspace(data.workspace || data);
    } catch (e) { setError(e.response?.data?.detail || 'Invalid or expired invitation.'); } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const r = await invites.joinByToken(token);
      const data = unwrapData(r);
      if (data.workspace) setActiveWorkspace(data.workspace);
      setJoined(true);
      toast.success('Welcome to the team!');
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to join'); } finally { setJoining(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={cardBase}>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--brand)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Verifying invitation...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertCircle size={22} style={{ color: 'var(--danger)' }} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Invitation Error</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{error}</p>
              <Button variant="secondary" onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          ) : joined ? (
            <div className="text-center py-8">
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>Welcome aboard!</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>You've joined the workspace successfully.</p>
              <Button variant="primary" rightIcon={<ArrowRight size={14} />} onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
          ) : workspace ? (
            <div className="text-center py-4">
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Briefcase size={24} style={{ color: 'var(--brand)' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>Join Workspace</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>You've been invited to join:</p>
              <div style={{ padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 20 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{workspace.name}</p>
                {workspace.description && <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0' }}>{workspace.description}</p>}
              </div>
              <Button variant="primary" fullWidth loading={joining} rightIcon={<ArrowRight size={14} />} onClick={handleJoin}>
                Join Workspace
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
