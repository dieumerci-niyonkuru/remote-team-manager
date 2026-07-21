import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { ws, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Users, Plus, Search, Crown, Mail } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import InviteMemberModal from '../components/team/InviteMemberModal';

const cardBase = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: tokens.radius.lg,
  padding: 'clamp(16px,2vw,20px)',
};

const ROLE_VARIANT = {
  owner: 'primary',
  admin: 'warning',
  member: 'secondary',
};

export default function Team() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (activeWorkspace) load();
  }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ws.members(activeWorkspace.id);
      const data = unwrapData(res);
      setMembers(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const filtered = members.filter(m =>
    m.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('team.title', 'Team')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{members.length} members</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setShowInvite(true)}>Invite Member</Button>
      </div>

      <div style={{ position: 'relative', maxWidth: 280 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search team..."
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px 8px 30px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(51,102,255,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No team members"
          description="Invite your team to start collaborating."
          actionLabel="Invite Member"
          onAction={() => setShowInvite(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m, i) => {
            const u = m.user || {};
            const role = m.role || 'member';
            return (
              <div
                key={m.id || i}
                style={{ ...cardBase, textAlign: 'center', transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px -8px rgba(0,0,0,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div className="flex justify-center mb-3">
                  <Avatar user={u} size={48} status={m.is_online ? 'online' : 'offline'} />
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username || 'Unknown'}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text3)', margin: '3px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Mail size={10} /> {u.email}
                </p>
                <Badge variant={ROLE_VARIANT[role] || 'secondary'} size="xs">
                  {role === 'owner' && <Crown size={9} className="mr-1" />}
                  {role}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      <InviteMemberModal isOpen={showInvite} onClose={() => setShowInvite(false)} onInvited={load} />
    </div>
  );
}
