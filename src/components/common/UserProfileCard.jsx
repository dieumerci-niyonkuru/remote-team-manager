import React from 'react';
import Avatar from './Avatar';
import { MessageSquare, Mail, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS = {
  owner: { bg:'rgba(245,158,11,0.15)', text:'var(--warning)', label:'Owner' },
  admin: { bg:'rgba(239,68,68,0.15)', text:'var(--danger)', label:'Admin' },
  manager: { bg:'rgba(139,92,246,0.15)', text:'var(--accent)', label:'Manager' },
  developer: { bg:'rgba(51,102,255,0.15)', text:'var(--brand)', label:'Developer' },
  designer: { bg:'rgba(236,72,153,0.15)', text:'#ec4899', label:'Designer' },
  viewer: { bg:'rgba(100,116,139,0.15)', text:'var(--text3)', label:'Viewer' },
  member: { bg:'rgba(16,185,129,0.15)', text:'var(--success)', label:'Member' },
};

export default function UserProfileCard({ user, role, onClose, onDM }) {
  const navigate = useNavigate();
  if (!user) return null;

  const displayName = user.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.username;

  const roleInfo = ROLE_COLORS[role?.toLowerCase()] || ROLE_COLORS.member;

  return (
    <div style={{
      background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20,
      padding:24, width:280, boxShadow:'0 20px 60px rgba(0,0,0,0.4)',
      position:'relative', overflow:'hidden'
    }}>
      {/* Background accent */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:64, background:'linear-gradient(135deg, rgba(51,102,255,0.15), rgba(139,92,246,0.15))', borderRadius:'20px 20px 0 0' }} />

      {/* Avatar */}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:12, marginBottom:16 }}>
        <Avatar user={user} size={72} status="online" />
        <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:'12px 0 2px', textAlign:'center' }}>{displayName}</h3>
        <p style={{ fontSize:13, color:'var(--text3)', margin:0 }}>@{user.username}</p>
      </div>

      {/* Role badge */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
        <span style={{ fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:20, background:roleInfo.bg, color:roleInfo.text, textTransform:'uppercase', letterSpacing:'0.08em' }}>
          {roleInfo.label}
        </span>
      </div>

      {/* Bio */}
      {user.bio && (
        <p style={{ fontSize:13, color:'var(--text2)', textAlign:'center', lineHeight:1.5, margin:'0 0 16px', padding:'0 8px' }}>
          {user.bio}
        </p>
      )}

      {/* Email */}
      {user.email && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--bg3)', borderRadius:10, marginBottom:12 }}>
          <Mail size={14} style={{ color:'var(--text3)', flexShrink:0 }} />
          <span style={{ fontSize:12, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <button onClick={() => { onDM?.(); onClose?.(); }}
          style={{ padding:'10px', borderRadius:10, background:'var(--brand)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <MessageSquare size={14} /> Message
        </button>
        <button onClick={() => { navigate('/team'); onClose?.(); }}
          style={{ padding:'10px', borderRadius:10, background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <ExternalLink size={14} /> Profile
        </button>
      </div>
    </div>
  );
}
