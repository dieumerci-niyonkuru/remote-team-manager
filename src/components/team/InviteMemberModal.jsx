import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useStore } from '../../store';
import { ws } from '../../services/api';
import toast from 'react-hot-toast';
import { Copy, CheckCircle2 } from 'lucide-react';

export default function InviteMemberModal({ isOpen, onClose, onInvited }) {
  const { activeWorkspace } = useStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await ws.invite(activeWorkspace.id, { email, role });
      const data = res?.data || res;
      const link = data?.join_url || data?.accept_url || '';
      if (link) setInviteLink(link);
      toast.success('Invitation sent!');
      onInvited?.();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setInviteLink('');
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Team Member"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleClose}>Close</Button>
          {!inviteLink && <Button variant="primary" onClick={handleInvite} loading={loading}>Send Invitation</Button>}
        </div>
      }>
      {inviteLink ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Invitation Sent!</h3>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 16px' }}>Share this link with <strong>{email}</strong> to join the workspace:</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
            <input readOnly value={inviteLink} style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--brand)', fontSize: 12, outline: 'none', fontFamily: 'inherit', minWidth: 0 }} />
            <button onClick={handleCopyLink} style={{ background: copied ? 'var(--success)' : 'var(--brand)', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {copied ? <><CheckCircle2 size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>Link expires in 7 days</p>
        </div>
      ) : (
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" required
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Role</label>
            <div className="flex gap-2">
              {[{ v: 'member', l: 'Member' }, { v: 'admin', l: 'Admin' }].map(r => (
                <button key={r.v} type="button" onClick={() => setRole(r.v)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: '0.15s',
                    background: role === r.v ? 'var(--brand-bg)' : 'var(--bg3)',
                    border: role === r.v ? '1px solid rgba(51,102,255,0.3)' : '1px solid var(--border)',
                    color: role === r.v ? 'var(--brand)' : 'var(--text3)' }}>
                  {r.l}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
