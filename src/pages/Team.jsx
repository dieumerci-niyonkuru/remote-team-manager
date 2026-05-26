import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import {
  Users, Mail, Shield, Search, UserPlus, MessageSquare,
  Crown, Star, Clock, Activity, Zap, Award,
  CheckCircle, Circle, MinusCircle,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';
import { useNavigate } from 'react-router-dom';

// ── Role metadata ─────────────────────────────────────────────────────────────
const ROLE_META = {
  owner:     { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',     icon:<Crown size={11}/>,  label:'Owner'     },
  admin:     { color:'#ef4444', bg:'rgba(239,68,68,0.12)',      icon:<Shield size={11}/>, label:'Admin'     },
  manager:   { color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',     icon:<Star size={11}/>,   label:'Manager'   },
  developer: { color:'#3366ff', bg:'rgba(51,102,255,0.12)',     icon:null,                label:'Developer' },
  designer:  { color:'#ec4899', bg:'rgba(236,72,153,0.12)',     icon:null,                label:'Designer'  },
  viewer:    { color:'#64748b', bg:'rgba(100,116,139,0.1)',     icon:null,                label:'Viewer'    },
  member:    { color:'#10b981', bg:'rgba(16,185,129,0.12)',     icon:null,                label:'Member'    },
};

// ── Presence status ───────────────────────────────────────────────────────────
const PRESENCE = {
  online:  { color:'#10b981', glow:'rgba(16,185,129,0.4)',  label:'Online',        Icon:CheckCircle },
  away:    { color:'#f59e0b', glow:'rgba(245,158,11,0.4)',  label:'Away',          Icon:Clock       },
  busy:    { color:'#ef4444', glow:'rgba(239,68,68,0.4)',   label:'Do not disturb',Icon:MinusCircle },
  offline: { color:'#64748b', glow:'transparent',           label:'Offline',       Icon:Circle      },
};

// Deterministic pseudo-presence based on user ID (since we don't have live WS here)
function getPresence(uid) {
  const states = ['online','online','online','away','busy','offline'];
  return states[((uid || 0) * 7 + 3) % states.length];
}

// Deterministic last-active string
function getLastActive(uid) {
  const options = ['Just now','2 min ago','15 min ago','1 hour ago','3 hours ago','Yesterday'];
  return options[((uid || 0) * 3 + 1) % options.length];
}

// Mock skill tags per user — in production these come from user.skills
const SKILL_SETS = [
  ['React','TypeScript','GraphQL'],
  ['Python','Django','PostgreSQL'],
  ['Figma','UI/UX','Prototyping'],
  ['Node.js','AWS','Docker'],
  ['Vue.js','TailwindCSS','CSS'],
  ['Go','Kubernetes','CI/CD'],
  ['iOS','Swift','Xcode'],
  ['Android','Kotlin','Jetpack'],
];
function getSkills(uid, userSkills) {
  if (Array.isArray(userSkills) && userSkills.length) return userSkills.slice(0, 3);
  return SKILL_SETS[((uid || 0) * 5 + 2) % SKILL_SETS.length];
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon:Icon, value, label, color = 'var(--brand)' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', background:'var(--bg-card)', borderRadius:16, border:'1px solid var(--border)', flex:1, minWidth:120 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize:20, fontWeight:900, color:'var(--text)', margin:0 }}>{value}</p>
        <p style={{ fontSize:11, color:'var(--text3)', margin:0, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
      </div>
    </div>
  );
}

// ── Member card ───────────────────────────────────────────────────────────────
function MemberCard({ m, isMe, onDM, presenceKey }) {
  const u = m.user || m;
  const role = m.role || 'member';
  const roleMeta = ROLE_META[role] || ROLE_META.member;
  const presence = PRESENCE[presenceKey];
  const lastActive = getLastActive(u.id);
  const skills = getSkills(u.id, u.skills);
  const displayName = u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(145deg, var(--bg-card), rgba(51,102,255,0.04))'
          : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'rgba(51,102,255,0.4)' : 'var(--border)'}`,
        borderRadius: 20,
        padding: 20,
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'none',
        boxShadow: hovered ? '0 16px 40px rgba(51,102,255,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Top accent bar on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${roleMeta.color}, ${presence.color})`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s',
        borderRadius: '20px 20px 0 0',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${presence.glow} 0%, transparent 70%)`,
        opacity: hovered ? 0.6 : 0.2,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      }} />

      {/* You badge */}
      {isMe && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          fontSize: 10, fontWeight: 900, color: 'var(--brand)',
          background: 'var(--brand-bg)', padding: '2px 8px',
          borderRadius: 6, letterSpacing: '0.05em',
        }}>YOU</div>
      )}

      {/* Avatar + name */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <Avatar user={u} size={52} status={presenceKey} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:800, color:'var(--text)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {displayName}
          </p>
          <p style={{ fontSize:12, color:'var(--text3)', margin:'2px 0 6px' }}>@{u.username}</p>
          {/* Role badge */}
          <span style={{
            fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:20,
            background:roleMeta.bg, color:roleMeta.color,
            display:'inline-flex', alignItems:'center', gap:4,
          }}>
            {roleMeta.icon}
            {roleMeta.label}
          </span>
        </div>
      </div>

      {/* Presence + last active */}
      <div style={{
        display:'flex', alignItems:'center', gap:8, marginBottom:14,
        padding:'8px 12px', background:'var(--bg3)', borderRadius:10,
      }}>
        <span style={{
          width:8, height:8, borderRadius:'50%', background:presence.color, flexShrink:0,
          boxShadow: presenceKey === 'online' ? `0 0 6px ${presence.color}` : 'none',
        }} />
        <span style={{ fontSize:12, color:'var(--text2)', fontWeight:600 }}>{presence.label}</span>
        {presenceKey !== 'online' && (
          <>
            <span style={{ color:'var(--border)', fontSize:10 }}>·</span>
            <Clock size={11} style={{ color:'var(--text3)' }} />
            <span style={{ fontSize:11, color:'var(--text3)' }}>{lastActive}</span>
          </>
        )}
      </div>

      {/* Bio */}
      {u.bio && (
        <p style={{
          fontSize:12, color:'var(--text3)', margin:'0 0 14px', lineHeight:1.55,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{u.bio}</p>
      )}

      {/* Skills */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
        {skills.map(s => (
          <span key={s} style={{
            fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20,
            background:'var(--bg3)', color:'var(--text3)',
            border:'1px solid var(--border)', letterSpacing:'0.03em',
            transition:'all 0.2s',
          }}>{s}</span>
        ))}
      </div>

      {/* Email */}
      {u.email && (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
          <Mail size={11} style={{ color:'var(--text3)', flexShrink:0 }} />
          <span style={{ fontSize:11, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>
        </div>
      )}

      {/* Actions */}
      {!isMe && (
        <button
          onClick={() => onDM(u.id)}
          style={{
            width:'100%', padding:'9px', borderRadius:10,
            background: hovered ? 'var(--brand)' : 'var(--brand-bg)',
            border:'1px solid rgba(51,102,255,0.3)',
            color: hovered ? '#fff' : 'var(--brand)',
            fontSize:12, fontWeight:800, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            transition:'all 0.25s',
          }}
        >
          <MessageSquare size={13} />
          Message {displayName.split(' ')[0]}
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Team() {
  const { activeWorkspace, user: me } = useStore();
  const navigate = useNavigate();

  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [presFilter, setPresFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('member');
  const [sending, setSending]     = useState(false);

  useEffect(() => { if (activeWorkspace) fetchMembers(); }, [activeWorkspace]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/workspaces/${activeWorkspace.id}/members/`);
      setMembers(data?.data || data || []);
    } catch { setMembers([]); } finally { setLoading(false); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      await api.post(`/workspaces/${activeWorkspace.id}/invite/`, { email: inviteEmail, role: inviteRole });
      toast.success(`Invite sent to ${inviteEmail}! 📧`);
      setShowInvite(false); setInviteEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite.');
    } finally { setSending(false); }
  };

  const handleDM = async (memberId) => {
    try { await api.post('/direct-messages/', { user_id: memberId }); } catch { }
    navigate('/chat');
    toast.success('Opening conversation...');
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalMembers  = members.length;
  const onlineCount   = members.filter(m => getPresence((m.user||m).id) === 'online').length;
  const managersCount = members.filter(m => ['owner','admin','manager'].includes(m.role)).length;
  const devCount      = members.filter(m => ['developer','designer'].includes(m.role)).length;

  const roles = ['all', ...new Set(members.map(m => m.role).filter(Boolean))];

  const filtered = members.filter(m => {
    const u = m.user || m;
    const name = `${u.first_name||''} ${u.last_name||''} ${u.username||''}`.toLowerCase();
    const matchSearch  = !search || name.includes(search.toLowerCase()) || (u.email||'').toLowerCase().includes(search.toLowerCase());
    const matchRole    = roleFilter === 'all' || m.role === roleFilter;
    const matchPresence = presFilter === 'all' || getPresence(u.id) === presFilter;
    return matchSearch && matchRole && matchPresence;
  });

  // ── Empty state (no workspace) ────────────────────────────────────────────
  if (!activeWorkspace) {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'var(--text3)' }}>
        <Users size={56} style={{ opacity:0.15 }} />
        <p style={{ fontSize:18, fontWeight:700 }}>Select a workspace to see your team</p>
      </div>
    );
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'32px', background:'var(--bg)' }} className="custom-scrollbar">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:28, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:900, color:'var(--text)', margin:0, display:'flex', alignItems:'center', gap:10 }}>
            <Users style={{ color:'var(--brand)' }} size={28}/>
            Team Members
          </h1>
          <p style={{ color:'var(--text3)', marginTop:6, fontSize:14 }}>
            {activeWorkspace.name} &nbsp;·&nbsp; {totalMembers} member{totalMembers !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 22px',
            borderRadius:12, background:'var(--brand)', color:'#fff', border:'none',
            cursor:'pointer', fontSize:13, fontWeight:800,
            boxShadow:'0 4px 18px rgba(51,102,255,0.4)', transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(51,102,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 18px rgba(51,102,255,0.4)'; }}
        >
          <UserPlus size={16}/> Invite Member
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <StatChip icon={Users}       value={totalMembers} label="Total Members"  color="#3366ff" />
        <StatChip icon={Activity}    value={onlineCount}  label="Online Now"     color="#10b981" />
        <StatChip icon={Award}       value={managersCount}label="Leadership"     color="#8b5cf6" />
        <StatChip icon={Zap}         value={devCount}     label="Builders"       color="#ec4899" />
      </div>

      {/* ── Invite form ────────────────────────────────────────────────────── */}
      {showInvite && (
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--brand)',
          borderRadius:20, padding:24, marginBottom:24,
          boxShadow:'0 4px 20px rgba(51,102,255,0.12)',
        }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <UserPlus size={16} style={{ color:'var(--brand)' }}/> Invite to {activeWorkspace.name}
          </h3>
          <form onSubmit={handleInvite} style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <input
              type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com" required autoFocus
              style={{ flex:1, minWidth:220, padding:'12px 16px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, outline:'none', fontFamily:'var(--font-body)' }}
            />
            <select
              value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              style={{ padding:'12px 16px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, outline:'none', cursor:'pointer' }}
            >
              {['member','developer','designer','manager','viewer'].map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
              ))}
            </select>
            <button type="submit" disabled={sending}
              style={{ padding:'12px 22px', borderRadius:10, background:'var(--brand)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:800, opacity:sending?0.7:1 }}>
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
            <button type="button" onClick={() => setShowInvite(false)}
              style={{ padding:'12px 16px', borderRadius:10, background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13 }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…"
            style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)' }}
          />
        </div>

        {/* Role pills */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{
                padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', transition:'all 0.2s',
                background: roleFilter === r ? 'var(--brand)' : 'var(--bg3)',
                color: roleFilter === r ? '#fff' : 'var(--text3)',
              }}>
              {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase()+r.slice(1)}
            </button>
          ))}
        </div>

        {/* Presence filter */}
        <div style={{ display:'flex', gap:5 }}>
          {['all','online','away','busy','offline'].map(p => {
            const isActive = presFilter === p;
            const pres = PRESENCE[p];
            return (
              <button key={p} onClick={() => setPresFilter(p)}
                style={{
                  padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', transition:'all 0.2s',
                  background: isActive ? (pres?.color || 'var(--brand)') : 'var(--bg3)',
                  color: isActive ? '#fff' : 'var(--text3)',
                  display:'flex', alignItems:'center', gap:5,
                }}>
                {p !== 'all' && (
                  <span style={{ width:7, height:7, borderRadius:'50%', background: isActive ? '#fff' : pres.color, flexShrink:0 }}/>
                )}
                {p === 'all' ? 'All Status' : pres?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results count ──────────────────────────────────────────────────── */}
      {!loading && (search || roleFilter !== 'all' || presFilter !== 'all') && (
        <p style={{ fontSize:13, color:'var(--text3)', marginBottom:16 }}>
          Showing <strong style={{ color:'var(--text)' }}>{filtered.length}</strong> of {totalMembers} members
          {presFilter !== 'all' && <> · <span style={{ color:PRESENCE[presFilter]?.color }}>{PRESENCE[presFilter]?.label}</span></>}
        </p>
      )}

      {/* ── Member grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px,1fr))', gap:16 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{
              background:'var(--bg-card)', borderRadius:20, padding:24,
              border:'1px solid var(--border)', height:200,
              animation:'skeleton-pulse 1.5s infinite',
            }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0', color:'var(--text3)' }}>
          <Users size={52} style={{ margin:'0 auto 12px', opacity:0.15, display:'block' }}/>
          <p style={{ fontSize:16, fontWeight:700, margin:'0 0 6px' }}>No members found</p>
          <p style={{ fontSize:13 }}>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px,1fr))', gap:16 }}>
          {filtered.map(m => {
            const u = m.user || m;
            return (
              <MemberCard
                key={m.id || u.id}
                m={m}
                isMe={u.id === me?.id}
                onDM={handleDM}
                presenceKey={getPresence(u.id)}
              />
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
