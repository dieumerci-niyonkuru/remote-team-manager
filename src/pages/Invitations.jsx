import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { invites } from '../services/api';
import { unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { Mail, Send, Check, X, UserPlus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

export default function Invitations() {
  const { activeWorkspace, user, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const [sentRes, recvRes] = await Promise.all([
        invites.sent(activeWorkspace?.id),
        invites.received(),
      ]);
      setSentList(unwrapData(sentRes));
      setReceivedList(unwrapData(recvRes));
    } catch (e) { toast.error('Failed to load invitations'); } finally { setLoading(false); }
  };

  const accept = async (id) => {
    try { await invites.accept(id); toast.success('Invitation accepted'); load(); }
    catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const reject = async (id) => {
    try { await invites.reject(id); toast.success('Invitation declined'); load(); }
    catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const remove = async (id) => {
    try { await invites.delete(id); toast.success('Invitation cancelled'); load(); }
    catch (e) { toast.error('Failed to cancel'); }
  };

  const hasData = sentList.length > 0 || receivedList.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('invitations.title', 'Invitations')}</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : !hasData ? (
        <EmptyState icon={<Mail size={24} />} title="No invitations" description="No pending invitations." />
      ) : (
        <div className="space-y-6">
          {receivedList.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 12 }}>Received</h2>
              <div className="space-y-2">
                {receivedList.map((inv, i) => (
                  <div key={inv.id || i} style={{ ...cardBase, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UserPlus size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        {inv.workspace?.name || inv.workspace_name || 'Workspace'} — {inv.email || inv.invited_email}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>
                        Invited by {inv.invited_by?.first_name || inv.sender?.first_name || 'Unknown'} · {inv.created_at ? format(new Date(inv.created_at), 'MMM d, yyyy') : ''}
                      </p>
                    </div>
                    <Badge variant={inv.status === 'pending' ? 'warning' : inv.status === 'accepted' ? 'success' : 'ghost'}>{inv.status}</Badge>
                    {inv.status === 'pending' && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="primary" size="sm" onClick={() => accept(inv.id)}><Check size={13} /></Button>
                        <Button variant="danger" size="sm" onClick={() => reject(inv.id)}><X size={13} /></Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sentList.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text3)', marginBottom: 12 }}>Sent</h2>
              <div className="space-y-2">
                {sentList.map((inv, i) => (
                  <div key={inv.id || i} style={{ ...cardBase, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Send size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{inv.email || inv.invited_email}</p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>Sent {inv.created_at ? format(new Date(inv.created_at), 'MMM d, yyyy') : ''}</p>
                    </div>
                    <Badge variant={inv.status === 'pending' ? 'warning' : 'success'}>{inv.status}</Badge>
                    {inv.status === 'pending' && (
                      <Button variant="ghost" size="sm" onClick={() => remove(inv.id)}><Trash2 size={13} /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
