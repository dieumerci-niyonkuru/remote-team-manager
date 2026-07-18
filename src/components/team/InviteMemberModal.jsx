import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useStore } from '../../store';
import { ws } from '../../services/api';
import toast from 'react-hot-toast';

export default function InviteMemberModal({ isOpen, onClose, onInvited }) {
  const { activeWorkspace } = useStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await ws.invite(activeWorkspace.id, { email, role });
      toast.success('Invitation sent!');
      setEmail('');
      onClose();
      onInvited?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleInvite} loading={loading}>Send Invitation</Button>
        </div>
      }>
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
    </Modal>
  );
}
