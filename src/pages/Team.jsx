import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Users, Mail, Shield, Search, MoreHorizontal, UserPlus, MessageSquare, Crown, Star, ChevronDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';
import UserProfileCard from '../components/common/UserProfileCard';
import { useNavigate } from 'react-router-dom';

const ROLE_META = {
  owner:     { color:'#f59e0b', bg:'rgba(245,158,11,0.12)', icon:<Crown size={12} /> },
  admin:     { color:'#ef4444', bg:'rgba(239,68,68,0.12)',  icon:<Shield size={12} /> },
  manager:   { color:'#8b5cf6', bg:'rgba(139,92,246,0.12)', icon:<Star size={12} /> },
  developer: { color:'var(--brand)', bg:'rgba(51,102,255,0.12)', icon:null },
  designer:  { color:'#ec4899', bg:'rgba(236,72,153,0.12)', icon:null },
  viewer:    { color:'var(--text3)', bg:'rgba(100,116,139,0.1)', icon:null },
  member:    { color:'#10b981', bg:'rgba(16,185,129,0.12)', icon:null },
};

export default function Team() {
  const { activeWorkspace, user: me } = useStore();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [sending, setSending] = useState(false);
  const [profileCard, setProfileCard] = useState(null); // { user, role, anchor }
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => { if (activeWorkspace) fetchMembers(); }, [activeWorkspace]);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get(`/workspaces/${activeWorkspace.id}/members/`);
      setMembers(data?.data || data || []);
    } catch { } finally { setLoading(false); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      await api.post(`/workspaces/${activeWorkspace.id}/invite/`, { email: inviteEmail, role: inviteRole });
      toast.success(`Invite sent to ${inviteEmail}! 📧`);
      setShowInvite(false);
      setInviteEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite.');
    } finally { setSending(false); }
  };

  const handleDM = async (memberId) => {
    try {
      const res = await api.post('/direct-messages/', { user_id: memberId });
      navigate('/chat');
      toast.success('Opening conversation...');
    } catch { navigate('/chat'); }
  };

  const roles = ['all', ...new Set(members.map(m => m.role).filter(Boolean))];

  const filtered = members.filter(m => {
    const u = m.user || m;
    const matchSearch = !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'32px', background:'var(--bg)' }} className="custom-scrollbar">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:32, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:900, color:'var(--text)', margin:0, display:'flex', alignItems:'center', gap:10 }}>
            <Users style={{ color:'var(--brand)' }} size={28} /> Team Members
          </h1>
          <p style={{ color:'var(--text3)', marginTop:6, fontSize:14 }}>
            {members.length} member{members.length !== 1 ? 's' : ''} in {activeWorkspace?.name}
          </p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, background:'var(--brand)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:800, boxShadow:'0 4px 16px rgba(51,102,255,0.35)', transition:'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform=''}>
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--brand)', borderRadius:20, padding:24, marginBottom:24 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:16 }}>Invite to {activeWorkspace?.name}</h3>
          <form onSubmit={handleInvite} style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com" required
              style={{ flex:1, minWidth:200, padding:'12px 16px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, outline:'none', fontFamily:'var(--font-body)' }} />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              style={{ padding:'12px 16px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, outline:'none', cursor:'pointer' }}>
              {['member','developer','designer','manager','viewer'].map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
              ))}
            </select>
            <button type="submit" disabled={sending}
              style={{ padding:'12px 24px', borderRadius:10, background:'var(--brand)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:800, opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending...' : 'Send Invite'}
            </button>
            <button type="button" onClick={() => setShowInvite(false)}
              style={{ padding:'12px 16px', borderRadius:10, background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13 }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
            style={{ width:'100%', padding:'10px 14px 10px 40px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)' }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{ padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', transition:'all 0.2s',
                background: roleFilter === r ? 'var(--brand)' : 'var(--bg3)',
                color: roleFilter === r ? '#fff' : 'var(--text3)' }}>
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase()+r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background:'var(--bg-card)', borderRadius:16, padding:24, border:'1px solid var(--border)', height:140, animation:'skeleton-pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:80, color:'var(--text3)' }}>
          <Users size={48} style={{ margin:'0 auto 12px', opacity:0.2, display:'block' }} />
          <p style={{ fontWeight:700 }}>No members found</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {filtered.map(m => {
            const u = m.user || m;
            const role = m.role || 'member';
            const meta = ROLE_META[role] || ROLE_META.member;
            const displayName = u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username;
            const isMe = u.id === me?.id;

            return (
              <div key={m.id || u.id}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:20, transition:'all 0.2s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(51,102,255,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>

                {isMe && <div style={{ position:'absolute', top:12, right:12, fontSize:10, fontWeight:800, color:'var(--brand)', background:'var(--brand-bg)', padding:'2px 8px', borderRadius:6 }}>You</div>}

                <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
                  <Avatar user={u} size={52} status="online" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:'var(--text)', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{displayName}</p>
                    <p style={{ fontSize:12, color:'var(--text3)', margin:'2px 0 0' }}>@{u.username}</p>
                    <div style={{ marginTop:6 }}>
                      <span style={{ fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:20, background:meta.bg, color:meta.color, display:'inline-flex', alignItems:'center', gap:4 }}>
                        {meta.icon} {role.charAt(0).toUpperCase()+role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {u.bio && <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 14px', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{u.bio}</p>}

                {u.email && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
                    <Mail size={12} style={{ color:'var(--text3)' }} />
                    <span style={{ fontSize:12, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>
                  </div>
                )}

                {!isMe && (
                  <button onClick={() => handleDM(u.id)}
                    style={{ width:'100%', padding:'9px', borderRadius:10, background:'var(--brand-bg)', border:'1px solid rgba(51,102,255,0.25)', color:'var(--brand)', fontSize:12, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--brand)' || (e.currentTarget.style.color='#fff')}
                    onMouseLeave={e => { e.currentTarget.style.background='var(--brand-bg)'; e.currentTarget.style.color='var(--brand)'; }}>
                    <MessageSquare size={13} /> Message
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
