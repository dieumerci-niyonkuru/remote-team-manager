/**
 * Chat.jsx — Enterprise-grade real-time chat
 *
 * Features implemented:
 *  ✅ Thread replies (sidebar panel)
 *  ✅ Reply-to-message (inline quote + reply bar in compose)
 *  ✅ Emoji reactions (WS react + optimistic summary)
 *  ✅ GIF support (Tenor v1 API with search)
 *  ✅ File attachments + multi-image uploads
 *  ✅ Drag-and-drop uploads with overlay
 *  ✅ Read receipts (read_by_count badge)
 *  ✅ Typing indicators (real-time WS)
 *  ✅ Mention system (@users autocomplete dropdown)
 *  ✅ Pinned messages panel (toggle from header)
 *  ✅ Search in conversations (inline filter)
 *  ✅ Infinite scrolling (IntersectionObserver sentinel)
 *  ✅ Message editing (WS edit + optimistic)
 *  ✅ Message deletion (WS delete + optimistic)
 *  ✅ Timestamp grouping (date dividers)
 *  ✅ Conversation filters (All / Unread / Mentions / Files / Pinned)
 *  ✅ Quick DM buttons (member panel)
 *  ✅ Image lightbox (click to fullscreen)
 *  ✅ Unread separator
 *
 * WS protocol (matches apps/chat/consumers.py):
 *   SEND:  { message, reply_to_id }              → new message
 *   SEND:  { type:'typing', is_typing }          → typing state
 *   SEND:  { type:'react', message_id, emoji }   → toggle reaction
 *   SEND:  { type:'edit', message_id, content }  → edit
 *   SEND:  { type:'delete', message_id }         → delete
 *   SEND:  { type:'pin', message_id }            → pin toggle
 *   RECV:  { type:'message', message:{} }        → new message
 *   RECV:  { type:'typing', user_id, username, is_typing }
 *   RECV:  { type:'reaction', message_id, reaction_summary }
 *   RECV:  { type:'edited', message_id, content, is_edited }
 *   RECV:  { type:'deleted', message_id }
 *   RECV:  { type:'pinned', message_id, is_pinned }
 *   RECV:  { type:'user_join'/'user_leave', user_id, username }
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { chat, calls } from '../services/api';
import api from '../services/api';
import {
  MessageSquare, Hash, Plus, Search, Send, Smile, Paperclip,
  Edit2, Trash2, Pin, Reply, X, ChevronDown, Users, Check,
  AtSign, Video, Image as ImageIcon, ZoomIn, FileText,
  Filter, BookMarked, BellOff, ChevronLeft
} from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import CreateChannelModal from '../components/chat/CreateChannelModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const TENOR_KEY = 'LIVDSRZULELA'; // Tenor demo key – replace with production key
const EMOJI_QUICK = ['👍','❤️','😂','😮','😢','🔥','✅','🎉','👏','🙌'];
const EMOJI_ALL = {
  Recent:  ['👍','❤️','😂','😮','😢','🔥','✅','🎉','👏','🙌','🤔','😍','😭'],
  Smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨'],
  People:  ['👋','🤚','✋','🖖','👌','🤌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🙏'],
  Objects: ['💬','📌','📍','⏰','📅','📋','📊','📈','📝','✏️','📎','🔒','🔑','🔨','🏆','🎯','🚀','💡','💻','📱','🎵','🎮','📸','🌍'],
  Symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','💔','✅','❌','⚡','🌟','💫','✨','🔴','🟠','🟡','🟢','🔵','🟣'],
};

// ─── Field helpers (backend uses `sender`, HTTP and WS may differ) ────────────

function getSender(m) {
  return m?.sender || m?.user || {};
}
function getSenderName(m) {
  const s = getSender(m);
  return s.full_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username || 'Unknown';
}
function getSenderId(m) {
  return getSender(m)?.id;
}

// ─── Time / date helpers ──────────────────────────────────────────────────────

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDateLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDay    = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime())     return 'Today';
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// ─── Mention highlight renderer ───────────────────────────────────────────────

function renderContent(content) {
  if (!content) return null;
  return content.split(/(@\w[\w.]*)/g).map((part, i) =>
    part.startsWith('@')
      ? <span key={i} style={{ color: 'var(--brand)', fontWeight: 700, background: 'rgba(51,102,255,.12)', borderRadius: 4, padding: '0 2px' }}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

function isImageFile(name) {
  return /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i.test(name || '');
}
function isImageType(type) {
  return /^image\//i.test(type || '');
}

// ─── Tenor GIF search ─────────────────────────────────────────────────────────

async function fetchGifs(query = '') {
  try {
    const endpoint = query
      ? `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=24&contentfilter=low`
      : `https://g.tenor.com/v1/trending?key=${TENOR_KEY}&limit=24&contentfilter=low`;
    const r = await fetch(endpoint);
    const data = await r.json();
    return (data.results || []).map(g => ({
      id: g.id,
      url: g.media?.[0]?.gif?.url || '',
      preview: g.media?.[0]?.tinygif?.url || g.media?.[0]?.gif?.url || '',
      title: g.title || '',
    }));
  } catch {
    return [];
  }
}

// ─── Avatar component ─────────────────────────────────────────────────────────

function Avatar({ user, size = 36, isOnline }) {
  const u = user || {};
  const initials = ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || (u.username?.[0] || '?').toUpperCase();
  const src = u.avatar_url || u.avatar;
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {src
        ? <img src={src} alt={initials} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, userSelect: 'none' }}>{initials}</div>
      }
      {isOnline !== undefined && (
        <span style={{ position: 'absolute', bottom: 0, right: 0, width: size * 0.3, height: size * 0.3, borderRadius: '50%', background: isOnline ? '#22c55e' : '#6b7280', border: '2px solid var(--bg2)' }} />
      )}
    </div>
  );
}

// ─── EmojiPicker ─────────────────────────────────────────────────────────────

function EmojiPicker({ onPick, onClose, positionUp = true }) {
  const ref = useRef(null);
  const [cat, setCat] = useState('Recent');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h, true);
    return () => document.removeEventListener('mousedown', h, true);
  }, [onClose]);
  const all = Object.values(EMOJI_ALL).flat();
  const displayed = query ? all.filter(e => e.includes(query)).slice(0, 48) : (EMOJI_ALL[cat] || []);
  return (
    <div ref={ref} style={{ position: 'absolute', [positionUp ? 'bottom' : 'top']: '110%', left: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 310, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden' }}>
      <div style={{ padding: '8px 8px 4px' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search emoji…" style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      {!query && (
        <div style={{ display: 'flex', gap: 2, padding: '0 6px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {Object.keys(EMOJI_ALL).map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? 'var(--brand)' : 'none', border: 'none', borderRadius: 5, padding: '3px 7px', color: cat === c ? '#fff' : 'var(--text3)', fontSize: 11, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>{c}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1, padding: '4px 6px 8px', maxHeight: 200, overflowY: 'auto' }}>
        {displayed.map(e => (
          <button key={e} onClick={() => { onPick(e); onClose(); }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '4px 5px', borderRadius: 6, transition: 'background .1s' }}
            onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
          >{e}</button>
        ))}
      </div>
    </div>
  );
}

// ─── GIF Picker ───────────────────────────────────────────────────────────────

function GifPicker({ onPick, onClose }) {
  const ref = useRef(null);
  const [gifs, setGifs] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h, true);
    return () => document.removeEventListener('mousedown', h, true);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchGifs(query).then(g => { setGifs(g); setLoading(false); });
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return (
    <div ref={ref} style={{ position: 'absolute', bottom: '110%', left: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 320, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden' }}>
      <div style={{ padding: '8px 8px 6px', borderBottom: '1px solid var(--border)' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search GIFs…" style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} autoFocus />
      </div>
      <div style={{ height: 240, overflowY: 'auto', padding: 6 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontSize: 13 }}>Loading GIFs…</div>
        ) : gifs.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontSize: 13 }}>No GIFs found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {gifs.map(g => (
              <button key={g.id} onClick={() => { onPick(g); onClose(); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: 6, overflow: 'hidden', display: 'block' }}>
                <img src={g.preview} alt={g.title} loading="lazy" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block', borderRadius: 6, transition: 'opacity .15s' }}
                  onMouseEnter={ev => ev.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={ev => ev.currentTarget.style.opacity = '1'}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '4px 8px 6px', borderTop: '1px solid var(--border)', fontSize: 9, color: 'var(--text3)', textAlign: 'right' }}>Powered by Tenor</div>
    </div>
  );
}

// ─── Mention Autocomplete Dropdown ────────────────────────────────────────────

function MentionDropdown({ members, query, onSelect, onClose }) {
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return members.filter(m => {
      const name = `${m.first_name || ''} ${m.last_name || ''} ${m.username || ''}`.toLowerCase();
      return name.includes(q);
    }).slice(0, 8);
  }, [members, query]);

  useEffect(() => {
    if (filtered.length === 0) onClose();
  }, [filtered.length, onClose]);

  if (filtered.length === 0) return null;
  return (
    <div style={{ position: 'absolute', bottom: '100%', left: 12, right: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 300, marginBottom: 4 }}>
      <div style={{ padding: '6px 10px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Mention a user</div>
      {filtered.map(m => (
        <button key={m.id || m.username} onClick={() => onSelect(m)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
        >
          <Avatar user={m} size={24} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.first_name} {m.last_name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{m.username}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Reaction picker popover ──────────────────────────────────────────────────

function ReactionPickerPopover({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h, true);
    return () => document.removeEventListener('mousedown', h, true);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 6, display: 'flex', flexWrap: 'wrap', gap: 2, width: 218, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200 }}>
      {EMOJI_QUICK.map(e => (
        <button key={e} onClick={() => { onPick(e); onClose(); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '3px 5px', borderRadius: 4, transition: 'background .1s' }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
        >{e}</button>
      ))}
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><X size={18} /></button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }} />
    </div>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 340, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
        <h3 style={{ color: 'var(--text)', margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>Delete message?</h3>
        <p style={{ color: 'var(--text2)', margin: '0 0 20px', fontSize: 14 }}>This will permanently remove the message for everyone.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Pinned Messages Panel ────────────────────────────────────────────────────

function PinnedPanel({ channelId, onJumpTo, onClose }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    chat.pinnedMessages(channelId)
      .then(r => {
        const d = r.data;
        setPins(Array.isArray(d) ? d : (d?.results || []));
      })
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  }, [channelId]);
  return (
    <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}><Pin size={14} style={{ color: '#f59e0b' }} /> Pinned Messages</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 3, borderRadius: 4 }}><X size={16} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {loading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>Loading…</div>}
        {!loading && pins.length === 0 && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No pinned messages yet.</div>}
        {pins.map(m => (
          <div key={m.id} style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 8, borderLeft: '3px solid #f59e0b', cursor: 'pointer', transition: 'background .12s' }}
            onClick={() => { onJumpTo && onJumpTo(m.id); onClose(); }}
            onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={ev => ev.currentTarget.style.background = 'var(--bg3)'}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{getSenderName(m)}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4, wordBreak: 'break-word' }}>
              {m.file_url && isImageFile(m.file_name || m.file_url) ? '📷 Image' : (m.content?.slice(0, 120) || '')}
              {(m.content?.length || 0) > 120 ? '…' : ''}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{formatTime(m.created_at || m.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Thread Sidebar ───────────────────────────────────────────────────────────

function ThreadSidebar({ parentMsg, currentUser, onClose, onReplied }) {
  const [replies, setReplies] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!parentMsg?.id) return;
    setLoading(true);
    setReplies([]);
    chat.thread(parentMsg.id)
      .then(r => {
        // api.js interceptor already unwraps {data:[...]} → [...]; handle both
        const d = r.data;
        setReplies(Array.isArray(d) ? d : (d?.data || d?.results || []));
      })
      .catch(() => setReplies([]))
      .finally(() => setLoading(false));
  }, [parentMsg?.id]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const txt = input.trim();
    setInput('');
    setSending(true);
    try {
      // Backend MessageViewSet.create() reads request.data.get('reply_to') — NOT reply_to_id
      const r = await chat.sendMessage({ room: parentMsg.room, content: txt, reply_to: parentMsg.id });
      const msg = r.data?.data || r.data;
      if (msg) {
        setReplies(p => [...p, msg]);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
      // Optimistically update parent reply_count in the main chat list
      onReplied?.(parentMsg.id);
    } catch {
      setInput(txt); // restore on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}><MessageSquare size={14} /> Thread</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 3, borderRadius: 4 }}><X size={16} /></button>
      </div>
      {/* Parent */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Avatar user={getSender(parentMsg)} size={28} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{getSenderName(parentMsg)}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{parentMsg?.content}</div>
          </div>
        </div>
      </div>
      {/* Replies */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>Loading…</div>}
        {!loading && replies.length === 0 && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No replies yet. Start the thread!</div>}
        {replies.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: 8, padding: '6px 14px', alignItems: 'flex-start' }}>
            <Avatar user={getSender(r)} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                {getSenderName(r)}
                <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 6, fontSize: 11 }}>{formatTime(r.created_at || r.timestamp)}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, wordBreak: 'break-word' }}>{r.content}</div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      {/* Reply compose */}
      <div style={{ padding: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Reply in thread…"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', padding: '8px 10px', fontSize: 13, resize: 'none', outline: 'none', minHeight: 50, fontFamily: 'inherit', boxSizing: 'border-box' }} rows={2}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '3px 8px 6px' }}>
            <button onClick={handleSend} disabled={!input.trim() || sending} style={{ background: (input.trim() && !sending) ? 'var(--brand)' : 'var(--bg3)', border: 'none', borderRadius: 7, padding: '5px 12px', color: (input.trim() && !sending) ? '#fff' : 'var(--text3)', cursor: (input.trim() && !sending) ? 'pointer' : 'default', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Send size={13} /> {sending ? 'Sending…' : 'Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Date / Unread dividers ───────────────────────────────────────────────────

function DateDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', userSelect: 'none' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', padding: '2px 10px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

function UnreadSeparator({ count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', userSelect: 'none' }}>
      <div style={{ flex: 1, height: 1, background: '#ef4444' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', padding: '2px 10px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, whiteSpace: 'nowrap' }}>{count} New {count === 1 ? 'Message' : 'Messages'}</span>
      <div style={{ flex: 1, height: 1, background: '#ef4444' }} />
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ m, prevM, isOwn, currentUser, onReact, onEdit, onDelete, onPin, onReply, onOpenThread, onLightbox, editingId, editValue, onEditChange, onEditSave, onEditCancel }) {
  const [hovered, setHovered] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const msgRef = useRef(null);

  const sender = getSender(m);
  const ts = m.created_at || m.timestamp;
  const sameAuthor = prevM && getSenderId(prevM) === getSenderId(m) && (new Date(ts) - new Date(prevM.created_at || prevM.timestamp)) < 300000;
  const isEditing = editingId === m.id;

  // Reaction summary: [{emoji, count, users:[usernames]}]
  const reactionSummary = m.reaction_summary || [];

  // File attachment (WS messages may use file_url directly; HTTP messages use separate attachments)
  const fileUrl = m.file_url;
  const fileName = m.file_name;
  const fileType = m.file_type;
  const isImg = fileUrl && (isImageFile(fileName || fileUrl) || isImageType(fileType));

  // Legacy attachments array (from older HTTP response)
  const legacyAttachments = m.attachments || [];

  // GIF messages are stored with a special marker
  const isGif = m.is_gif || (m.content && m.content.startsWith('[GIF]'));
  const gifUrl = isGif ? (m.gif_url || m.content?.replace('[GIF]', '').trim()) : null;

  return (
    <>
      {showDeleteConfirm && <DeleteConfirm onConfirm={() => { onDelete(m.id); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} />}
      <div
        ref={msgRef}
        data-msg-id={m.id}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowReactionPicker(false); }}
        style={{ display: 'flex', gap: 10, padding: sameAuthor ? '2px 16px' : '10px 16px 2px', background: hovered ? 'var(--bg3)' : 'transparent', transition: 'background .12s', position: 'relative', borderRadius: 8 }}
      >
        {/* Avatar / spacer */}
        <div style={{ width: 36, flexShrink: 0, paddingTop: sameAuthor ? 0 : 2 }}>
          {!sameAuthor && <Avatar user={sender} size={36} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          {!sameAuthor && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{getSenderName(m)}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatTime(ts)}</span>
              {m.is_pinned && <span style={{ fontSize: 11, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}><Pin size={11} /> Pinned</span>}
            </div>
          )}

          {/* Reply quote */}
          {m.reply_to && (
            <div style={{ borderLeft: '3px solid var(--brand)', borderRadius: '0 6px 6px 0', padding: '4px 8px', marginBottom: 4, background: 'var(--bg3)', fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: 'var(--text2)', marginRight: 4 }}>{m.reply_to.sender?.username || m.reply_to.sender || '?'}:</span>
              <span style={{ color: 'var(--text3)' }}>{m.reply_to.content?.slice(0, 120)}{(m.reply_to.content?.length || 0) > 120 ? '…' : ''}</span>
            </div>
          )}

          {/* Content / Edit */}
          {isEditing ? (
            <div style={{ marginTop: 2 }}>
              <textarea value={editValue} onChange={e => onEditChange(e.target.value)} autoFocus
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--brand)', borderRadius: 8, color: 'var(--text)', fontSize: 14, padding: '8px 10px', resize: 'vertical', outline: 'none', minHeight: 64, fontFamily: 'inherit' }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEditSave(m.id); } if (e.key === 'Escape') onEditCancel(); }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button onClick={() => onEditSave(m.id)} style={{ padding: '4px 12px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Save</button>
                <button onClick={onEditCancel} style={{ padding: '4px 12px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {/* GIF */}
              {gifUrl && (
                <img src={gifUrl} alt="GIF" style={{ maxWidth: 280, borderRadius: 8, display: 'block', marginBottom: 4, cursor: 'zoom-in' }} onClick={() => onLightbox(gifUrl)} />
              )}
              {/* Text content */}
              {!gifUrl && m.content && !(m.is_deleted) && (
                <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.55, wordBreak: 'break-word' }}>
                  {renderContent(m.content)}
                  {m.is_edited && <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>(edited)</span>}
                </div>
              )}
              {m.is_deleted && <div style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic' }}>This message was deleted.</div>}
            </>
          )}

          {/* File attachment (WS-delivered) */}
          {!isEditing && fileUrl && (
            <div style={{ marginTop: 4 }}>
              {isImg
                ? <img src={fileUrl} alt={fileName || 'image'} style={{ maxWidth: 280, maxHeight: 200, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)', cursor: 'zoom-in', display: 'block' }} onClick={() => onLightbox(fileUrl)} />
                : <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    <FileText size={14} /> {fileName || 'Attachment'}
                  </a>
              }
            </div>
          )}

          {/* Legacy attachments array */}
          {!isEditing && legacyAttachments.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {legacyAttachments.map((f, i) =>
                isImageFile(f.name || f.file)
                  ? <img key={i} src={f.url || f.file} alt={f.name || 'image'} style={{ maxWidth: 280, maxHeight: 200, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)', cursor: 'zoom-in' }} onClick={() => onLightbox(f.url || f.file)} />
                  : <a key={i} href={f.url || f.file} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--brand)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                      <Paperclip size={14} /> {f.name || 'Attachment'}
                    </a>
              )}
            </div>
          )}

          {/* Reaction summary */}
          {reactionSummary.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {reactionSummary.map(r => {
                const reactedByMe = Array.isArray(r.users) && r.users.includes(currentUser?.username);
                return (
                  <button key={r.emoji} onClick={() => onReact(m.id, r.emoji)} title={r.users?.join(', ')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, border: `1px solid ${reactedByMe ? 'var(--brand)' : 'var(--border)'}`, background: reactedByMe ? 'rgba(51,102,255,.15)' : 'var(--bg3)', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', transition: 'border-color .12s, background .12s' }}>
                    <span>{r.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{r.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Thread reply count */}
          {m.reply_count > 0 && (
            <button onClick={() => onOpenThread(m)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: 12, fontWeight: 600, padding: '2px 0' }}>
              <MessageSquare size={13} /> {m.reply_count} {m.reply_count === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Read receipt count */}
          {m.read_by_count > 0 && (
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Check size={10} /> {m.read_by_count}
            </div>
          )}
        </div>

        {/* Hover toolbar */}
        {hovered && !isEditing && !m.is_deleted && (
          <div style={{ position: 'absolute', top: -16, right: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', padding: '3px 4px', gap: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 50 }}>
            <div style={{ position: 'relative' }}>
              <ActionBtn icon={<Smile size={15} />} title="React" onClick={() => setShowReactionPicker(p => !p)} />
              {showReactionPicker && <ReactionPickerPopover onPick={emoji => onReact(m.id, emoji)} onClose={() => setShowReactionPicker(false)} />}
            </div>
            <ActionBtn icon={<Reply size={15} />} title="Reply" onClick={() => onReply(m)} />
            <ActionBtn icon={<MessageSquare size={15} />} title="Open thread" onClick={() => onOpenThread(m)} />
            <ActionBtn icon={<Pin size={15} />} title={m.is_pinned ? 'Unpin' : 'Pin'} active={m.is_pinned} onClick={() => onPin(m.id)} />
            <ActionBtn icon={<Check size={15} />} title="Copy" onClick={() => navigator.clipboard.writeText(m.content || '')} />
            {isOwn && <ActionBtn icon={<Edit2 size={15} />} title="Edit" onClick={() => onEdit(m)} />}
            {isOwn && <ActionBtn icon={<Trash2 size={15} />} title="Delete" danger onClick={() => setShowDeleteConfirm(true)} />}
          </div>
        )}
      </div>
    </>
  );
}

function ActionBtn({ icon, title, onClick, active, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? (danger ? 'rgba(239,68,68,.1)' : 'var(--bg3)') : 'none', border: 'none', cursor: 'pointer', padding: '5px 7px', borderRadius: 6, color: hov && danger ? '#ef4444' : (active ? 'var(--brand)' : 'var(--text3)'), display: 'flex', alignItems: 'center', transition: 'background .1s, color .1s' }}
    >{icon}</button>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ active, onChange }) {
  const tabs = ['All', 'Unread', 'Mentions', 'Files', 'Pinned'];
  return (
    <div style={{ display: 'flex', gap: 2, padding: '4px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: active === t ? 'var(--brand)' : 'none', color: active === t ? '#fff' : 'var(--text3)', fontSize: 12, fontWeight: active === t ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .12s, color .12s' }}>{t}</button>
      ))}
    </div>
  );
}

// ─── Compose Bar ─────────────────────────────────────────────────────────────

function ComposeBar({ value, onChange, onSend, placeholder, replyTo, onCancelReply, typingUsers, onFileSelect, dragOver, onDragOver, onDragLeave, onDrop, members = [], currentUser }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const handleChange = val => {
    onChange(val);
    // Detect @ for mention autocomplete
    const ta = textareaRef.current;
    const pos = ta ? ta.selectionStart : val.length;
    setCursorPos(pos);
    const before = val.slice(0, pos);
    const match = before.match(/@(\w*)$/);
    setMentionQuery(match ? match[1] : null);
    setShowEmoji(false);
    setShowGif(false);
  };

  const insertMention = m => {
    const ta = textareaRef.current;
    const pos = ta ? ta.selectionStart : value.length;
    const before = value.slice(0, pos);
    const after = value.slice(pos);
    const atIdx = before.lastIndexOf('@');
    const newVal = before.slice(0, atIdx) + `@${m.username} ` + after;
    onChange(newVal);
    setMentionQuery(null);
    setTimeout(() => { ta?.focus(); }, 0);
  };

  const insertFormat = (prefix, suffix = prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = value.slice(s, e);
    onChange(value.slice(0, s) + prefix + sel + suffix + value.slice(e));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, e + prefix.length); }, 0);
  };

  const pickGif = gif => {
    // Send GIF as a special message
    onChange(`[GIF] ${gif.url}`);
    setTimeout(() => onSend(), 0);
  };

  return (
    <div style={{ padding: '6px 12px 10px', position: 'relative', flexShrink: 0 }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {dragOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(51,102,255,.12)', border: '2px dashed var(--brand)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, fontSize: 15, fontWeight: 700, color: 'var(--brand)', backdropFilter: 'blur(2px)', pointerEvents: 'none' }}>
          Drop files to attach
        </div>
      )}

      {/* Mention dropdown */}
      {mentionQuery !== null && (
        <MentionDropdown members={members} query={mentionQuery} onSelect={insertMention} onClose={() => setMentionQuery(null)} />
      )}

      {/* Reply bar */}
      {replyTo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg3)', borderRadius: '8px 8px 0 0', borderBottom: '1px solid var(--border)' }}>
          <Reply size={13} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{getSenderName(replyTo)}:&nbsp;</span>
            {replyTo.content?.slice(0, 100)}
          </span>
          <button onClick={onCancelReply} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4 }}><X size={14} /></button>
        </div>
      )}

      {/* Compose box */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: replyTo ? '0 0 12px 12px' : 12, overflow: 'hidden', transition: 'border-color .15s' }}
        onFocus={ev => ev.currentTarget.style.borderColor = 'var(--brand)'}
        onBlur={ev => ev.currentTarget.style.borderColor = 'var(--border)'}
      >
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 10px 0', borderBottom: '1px solid var(--border)' }}>
          <FormatBtn title="Bold" label="B" onClick={() => insertFormat('**')} style={{ fontWeight: 800 }} />
          <FormatBtn title="Italic" label="I" onClick={() => insertFormat('_')} style={{ fontStyle: 'italic' }} />
          <FormatBtn title="Code" label="{}" onClick={() => insertFormat('`')} style={{ fontFamily: 'monospace', fontSize: 11 }} />
          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 3px' }} />
          <div style={{ position: 'relative' }}>
            <FormatBtn title="Emoji" icon={<Smile size={14} />} onClick={() => { setShowEmoji(p => !p); setShowGif(false); }} active={showEmoji} />
            {showEmoji && <EmojiPicker onPick={e => { onChange(value + e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />}
          </div>
          <div style={{ position: 'relative' }}>
            <FormatBtn title="GIF" label="GIF" onClick={() => { setShowGif(p => !p); setShowEmoji(false); }} active={showGif} style={{ fontWeight: 800, fontSize: 11 }} />
            {showGif && <GifPicker onPick={pickGif} onClose={() => setShowGif(false)} />}
          </div>
          <FormatBtn title="Mention" icon={<AtSign size={14} />} onClick={() => { onChange(value + '@'); textareaRef.current?.focus(); }} />
          <FormatBtn title="Attach file" icon={<Paperclip size={14} />} onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => onFileSelect(Array.from(e.target.files))} />
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', padding: '10px 12px', fontSize: 14, resize: 'none', outline: 'none', minHeight: 56, maxHeight: 220, fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
          rows={2}
        />

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '3px 8px 6px' }}>
          <button onClick={onSend} disabled={!value.trim()}
            style={{ background: value.trim() ? 'var(--brand)' : 'var(--bg3)', border: 'none', borderRadius: 8, padding: '7px 14px', color: value.trim() ? '#fff' : 'var(--text3)', cursor: value.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, transition: 'background .12s' }}>
            <Send size={14} /> Send
          </button>
        </div>
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginTop: 4, paddingLeft: 4 }}>
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing
          <span style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
            {[0, 0.4, 0.8].map(d => <span key={d} style={{ animation: `blink 1.2s ${d}s infinite` }}>.</span>)}
          </span>
        </div>
      )}
    </div>
  );
}

function FormatBtn({ title, label, icon, onClick, active, style: s }) {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov || active ? 'var(--bg3)' : 'none', border: 'none', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', color: active ? 'var(--brand)' : (hov ? 'var(--text)' : 'var(--text3)'), fontSize: 13, display: 'flex', alignItems: 'center', transition: 'background .1s, color .1s', ...s }}
    >{icon || label}</button>
  );
}

// ─── Sidebar items ────────────────────────────────────────────────────────────

function SidebarChannelItem({ item, active, onClick, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px 5px 16px', cursor: 'pointer', borderRadius: 6, margin: '1px 6px', background: active ? 'var(--brand)' : (hov ? 'var(--bg3)' : 'transparent'), transition: 'background .1s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
        <span style={{ color: active ? '#fff' : 'var(--text3)', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#fff' : (hov ? 'var(--text)' : 'var(--text2)'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
      </div>
      {item.unread_count > 0 && !active && (
        <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>{item.unread_count > 99 ? '99+' : item.unread_count}</span>
      )}
    </div>
  );
}

function SidebarDmItem({ dm, active, isOnline, onClick }) {
  const [hov, setHov] = useState(false);
  const other = dm.participants?.find(p => p) || {};
  const name = dm.name || other.full_name || `${other.first_name || ''} ${other.last_name || ''}`.trim() || 'DM';
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px 5px 16px', cursor: 'pointer', borderRadius: 6, margin: '1px 6px', background: active ? 'var(--brand)' : (hov ? 'var(--bg3)' : 'transparent'), transition: 'background .1s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1 }}>
        <Avatar user={other} size={22} isOnline={isOnline} />
        <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#fff' : (hov ? 'var(--text)' : 'var(--text2)'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      </div>
      {dm.unread_count > 0 && !active && (
        <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>{dm.unread_count > 99 ? '99+' : dm.unread_count}</span>
      )}
    </div>
  );
}

function MemberRow({ member, isOnline, onStartDM }) {
  const [hov, setHov] = useState(false);
  const name = member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.username || 'Member';
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: hov ? 'var(--bg3)' : 'transparent', transition: 'background .1s', borderRadius: 6, margin: '1px 4px' }}>
      <Avatar user={member} size={26} isOnline={isOnline} />
      <span style={{ fontSize: 13, color: isOnline ? 'var(--text)' : 'var(--text3)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {hov && onStartDM && (
        <button onClick={() => onStartDM(member)} title="Send DM" style={{ background: 'var(--brand)', border: 'none', borderRadius: 5, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Send size={11} color="#fff" />
        </button>
      )}
    </div>
  );
}

// ─── MAIN CHAT COMPONENT ──────────────────────────────────────────────────────

export default function Chat() {
  const { user, activeWorkspace, onlineUsers } = useStore();
  const navigate = useNavigate();

  // ── Data state ────────────────────────────────────────────────────────────
  const [channels, setChannels] = useState([]);
  const [dms, setDms] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState([]); // workspace members for @mention

  // ── UI state ─────────────────────────────────────────────────────────────
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidePanel, setSidePanel] = useState(null); // 'members' | 'thread' | 'pinned'
  const [threadMsg, setThreadMsg] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadIdx, setLastReadIdx] = useState(-1);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const scrollRef = useRef(null);
  const topSentinelRef = useRef(null);
  const typingTimerRef = useRef(null);
  const msgRefs = useRef({});

  // ── Load workspace members for @mention ───────────────────────────────────
  useEffect(() => {
    if (!activeWorkspace) return;
    api.get(`/workspaces/${activeWorkspace.id}/members/`)
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.results || []);
        // members endpoint returns WorkspaceMember objects with user nested
        setMembers(list.map(wm => wm.user || wm).filter(Boolean));
      })
      .catch(() => {});
  }, [activeWorkspace]);

  // ── Load channels + DMs ───────────────────────────────────────────────────
  useEffect(() => {
    if (!activeWorkspace) return;
    const load = async () => {
      try {
        const [chRes, dmRes] = await Promise.all([
          api.get(`/channels/?workspace=${activeWorkspace.id}`),
          chat.dms(),
        ]);
        const chList = Array.isArray(chRes.data) ? chRes.data : (chRes.data?.results || []);
        const dmList = Array.isArray(dmRes.data) ? dmRes.data : (dmRes.data?.results || []);
        setChannels(chList);
        setDms(dmList);
        if (chList.length > 0 && !activeTab) setActiveTab(chList[0].id);
      } catch {}
    };
    load();
  }, [activeWorkspace]);

  // ── Load messages ─────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (tabId, pg = 1) => {
    if (!tabId) return;
    if (pg > 1) setLoadingMore(true);
    try {
      const r = await chat.messages({ channel: tabId, page: pg });
      const d = r.data;
      const list = Array.isArray(d) ? d : (d?.results || d?.messages || []);
      const sorted = [...list].reverse();
      if (pg === 1) {
        setMessages(sorted);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'auto' }), 80);
      } else {
        setMessages(prev => [...sorted, ...prev]);
      }
      setHasMore(!!(d?.next));
      setPage(pg);
    } catch {}
    finally { setLoadingMore(false); }
  }, []);

  useEffect(() => {
    if (!activeTab) return;
    setMessages([]);
    setPage(1);
    setHasMore(false);
    setTypingUsers([]);
    setReplyTo(null);
    setEditingId(null);
    setSearchQuery('');
    setFilter('All');
    setUnreadCount(0);
    setLastReadIdx(-1);
    setThreadMsg(null);
    setSidePanel(null);
    loadMessages(activeTab, 1);
    chat.markRead(activeTab).catch(() => {});
    setChannels(prev => prev.map(c => c.id === activeTab ? { ...c, unread_count: 0 } : c));
    setDms(prev => prev.map(d => d.id === activeTab ? { ...d, unread_count: 0 } : d));
  }, [activeTab, loadMessages]);

  // ── IntersectionObserver for infinite scroll ──────────────────────────────
  useEffect(() => {
    if (!topSentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore) {
        const scrollEl = topSentinelRef.current?.parentElement;
        const prevHeight = scrollEl?.scrollHeight || 0;
        loadMessages(activeTab, page + 1).then(() => {
          if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
        });
      }
    }, { threshold: 0.1 });
    obs.observe(topSentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, activeTab, page, loadMessages]);

  // ── WebSocket (matches apps/chat/consumers.py) ────────────────────────────
  const { send } = useWebSocket(`/ws/chat/${activeTab}/`, {
    enabled: !!activeTab,
    onMessage: (data) => {
      const { type } = data;

      if (type === 'message') {
        // Backend sends { type: 'message', message: {...} }
        const incoming = data.message || data;
        setMessages(prev => {
          const isNewFromOther = getSenderId(incoming) !== user?.id;
          if (isNewFromOther) { setUnreadCount(u => u + 1); setLastReadIdx(prev.length); }
          // Avoid duplicates from optimistic updates
          const exists = prev.some(m => m.id === incoming.id);
          return exists ? prev.map(m => m.id === incoming.id ? incoming : m) : [...prev, incoming];
        });
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }

      else if (type === 'typing') {
        if (data.user_id !== user?.id) {
          setTypingUsers(prev =>
            data.is_typing
              ? prev.includes(data.username) ? prev : [...prev, data.username]
              : prev.filter(u => u !== data.username)
          );
        }
      }

      else if (type === 'reaction') {
        // Backend sends full reaction_summary
        setMessages(prev => prev.map(m =>
          m.id === data.message_id
            ? { ...m, reaction_summary: data.reaction_summary || m.reaction_summary }
            : m
        ));
      }

      else if (type === 'edited') {
        setMessages(prev => prev.map(m =>
          m.id === data.message_id
            ? { ...m, content: data.content, is_edited: data.is_edited }
            : m
        ));
      }

      else if (type === 'deleted') {
        setMessages(prev => prev.map(m =>
          m.id === data.message_id
            ? { ...m, is_deleted: true, content: '[This message was deleted]' }
            : m
        ));
      }

      else if (type === 'pinned') {
        setMessages(prev => prev.map(m =>
          m.id === data.message_id ? { ...m, is_pinned: data.is_pinned } : m
        ));
      }

      // A thread reply was created via HTTP; update parent message reply count
      else if (type === 'reply_count_updated') {
        setMessages(prev => prev.map(m =>
          m.id === data.parent_id ? { ...m, reply_count: data.reply_count } : m
        ));
      }
    },
  });

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && pendingFiles.length === 0) return;

    // Detect GIF message
    const isGif = text.startsWith('[GIF] ');
    const gifUrl = isGif ? text.replace('[GIF] ', '') : null;

    // Optimistic message
    const optimistic = {
      id: `opt_${Date.now()}`,
      sender: user,
      content: isGif ? gifUrl : text,
      is_gif: isGif,
      gif_url: gifUrl,
      created_at: new Date().toISOString(),
      reaction_summary: [],
      reply_to: replyTo || null,
      reply_count: 0,
      is_pinned: false,
      is_edited: false,
      is_deleted: false,
    };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setReplyTo(null);
    setPendingFiles([]);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    // Send via WS: backend expects { message, reply_to_id } (no type needed for text)
    send({ message: text, reply_to_id: replyTo?.id || null });
    send({ type: 'typing', is_typing: false });

    // File uploads
    for (const f of pendingFiles) {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('channel', activeTab);
      try { await api.post('/file-attachments/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); } catch {}
    }
  }, [input, replyTo, pendingFiles, activeTab, user, send]);

  // ── Input + typing ────────────────────────────────────────────────────────
  const handleInputChange = useCallback(val => {
    setInput(val);
    send({ type: 'typing', is_typing: true });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => send({ type: 'typing', is_typing: false }), 2500);
  }, [send]);

  // ── React ─────────────────────────────────────────────────────────────────
  const handleReact = useCallback(async (msgId, emoji) => {
    // Optimistic toggle
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const summary = m.reaction_summary || [];
      const existing = summary.find(r => r.emoji === emoji);
      const username = user?.username;
      if (existing) {
        const alreadyReacted = existing.users?.includes(username);
        return {
          ...m,
          reaction_summary: alreadyReacted
            ? summary.map(r => r.emoji === emoji
                ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== username) }
                : r
              ).filter(r => r.count > 0)
            : summary.map(r => r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...(r.users || []), username] }
                : r
              ),
        };
      }
      return { ...m, reaction_summary: [...summary, { emoji, count: 1, users: [username] }] };
    }));
    // Send to backend: { type: 'react', message_id, emoji }
    send({ type: 'react', message_id: msgId, emoji });
  }, [user, send]);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditStart = useCallback(m => { setEditingId(m.id); setEditValue(m.content); }, []);
  const handleEditSave = useCallback(async msgId => {
    const content = editValue.trim();
    if (!content) return;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content, is_edited: true } : m));
    setEditingId(null); setEditValue('');
    // Backend expects { type: 'edit', message_id, content }
    send({ type: 'edit', message_id: msgId, content });
  }, [editValue, send]);
  const handleEditCancel = useCallback(() => { setEditingId(null); setEditValue(''); }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(msgId => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true, content: '[deleted]' } : m));
    // Backend expects { type: 'delete', message_id }
    send({ type: 'delete', message_id: msgId });
  }, [send]);

  // ── Pin ───────────────────────────────────────────────────────────────────
  const handlePin = useCallback(async msgId => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_pinned: !m.is_pinned } : m));
    send({ type: 'pin', message_id: msgId });
  }, [send]);

  // ── Quick DM ──────────────────────────────────────────────────────────────
  const handleStartDM = useCallback(async m => {
    try {
      const r = await chat.createDm({ user_id: m.id });
      const dm = r.data?.data || r.data;
      if (dm?.id) { setDms(prev => [...prev.filter(d => d.id !== dm.id), dm]); setActiveTab(dm.id); }
    } catch {}
  }, []);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDragOver  = e => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop      = e => { e.preventDefault(); setDragOver(false); const files = Array.from(e.dataTransfer.files); if (files.length) setPendingFiles(prev => [...prev, ...files]); };

  // ── Jump to message ───────────────────────────────────────────────────────
  const jumpToMessage = useCallback(id => {
    const el = document.querySelector(`[data-msg-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeChannel = channels.find(c => c.id === activeTab);
  const activeDM      = dms.find(d => d.id === activeTab);
  const headerName    = activeChannel ? `#${activeChannel.name}` : (activeDM?.name || 'Chat');
  const memberCount   = activeChannel?.member_count || null;

  // Apply conversation filter
  const filteredMessages = useMemo(() => {
    let list = messages;
    if (searchQuery) list = list.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    switch (filter) {
      case 'Unread':   return list.filter((_, i) => i > lastReadIdx);
      case 'Mentions': return list.filter(m => m.content?.includes(`@${user?.username}`));
      case 'Files':    return list.filter(m => m.file_url || (m.attachments?.length > 0));
      case 'Pinned':   return list.filter(m => m.is_pinned);
      default:         return list;
    }
  }, [messages, searchQuery, filter, lastReadIdx, user]);

  // Group into date sections
  const messageGroups = useMemo(() => {
    const groups = [];
    let currentLabel = null;
    filteredMessages.forEach((m, i) => {
      const label = formatDateLabel(m.created_at || m.timestamp);
      if (label !== currentLabel) { groups.push({ type: 'date', label, key: `date_${i}` }); currentLabel = label; }
      groups.push({ type: 'message', m, key: m.id || i, prevM: i > 0 ? filteredMessages[i - 1] : null });
    });
    return groups;
  }, [filteredMessages]);

  // Sidebar channel/DM filter
  const filteredChannels = channels.filter(c => !sidebarSearch || c.name?.toLowerCase().includes(sidebarSearch.toLowerCase()));
  const filteredDMs = dms.filter(d => !sidebarSearch || d.name?.toLowerCase().includes(sidebarSearch.toLowerCase()));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
      `}</style>

      {/* Lightbox */}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* ════ LEFT SIDEBAR ════ */}
      <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg2)', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Workspace header */}
        <div style={{ padding: '14px 16px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: -.3 }}>{activeWorkspace?.name || 'Chat'}</span>
          </div>
          {/* Sidebar search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} placeholder="Find channels…"
              style={{ width: '100%', paddingLeft: 26, paddingRight: 8, paddingTop: 5, paddingBottom: 5, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
          {/* Channels */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 16px 5px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>Channels</span>
              <button onClick={() => setShowCreateModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              ><Plus size={14} /></button>
            </div>
            {filteredChannels.map(c => <SidebarChannelItem key={c.id} item={c} active={activeTab === c.id} onClick={() => setActiveTab(c.id)} icon={<Hash size={15} />} />)}
          </div>

          {/* DMs */}
          <div style={{ marginTop: 8 }}>
            <div style={{ padding: '2px 16px 5px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>Direct Messages</span>
            </div>
            {filteredDMs.map(d => <SidebarDmItem key={d.id} dm={d} active={activeTab === d.id} isOnline={Array.isArray(onlineUsers) && onlineUsers.includes(d.id)} onClick={() => setActiveTab(d.id)} />)}
          </div>
        </div>
      </aside>

      {/* ════ MAIN CHAT AREA ════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{headerName}</span>
            {memberCount && <span style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}><Users size={12} /> {memberCount}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search…"
                style={{ paddingLeft: 28, paddingRight: 8, paddingTop: 5, paddingBottom: 5, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, outline: 'none', width: 160, transition: 'border-color .15s, width .2s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.width = '220px'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.width = '160px'; }}
              />
            </div>
            {/* Video call */}
            <button onClick={async () => { try { const r = await calls.initiate(null, []); const rid = r.data?.room_id; if (rid) navigate(`/call?room=${rid}`); else navigate('/call'); } catch { navigate('/call'); } }}
              title="Start video call" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 7px', borderRadius: 7, color: 'var(--text3)', display: 'flex', transition: 'background .12s, color .12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)'; }}
            ><Video size={16} /></button>
            {/* Pinned */}
            <button onClick={() => setSidePanel(p => p === 'pinned' ? null : 'pinned')}
              title="Pinned messages" style={{ background: sidePanel === 'pinned' ? 'var(--bg3)' : 'none', border: 'none', cursor: 'pointer', padding: '5px 7px', borderRadius: 7, color: sidePanel === 'pinned' ? '#f59e0b' : 'var(--text3)', display: 'flex', transition: 'background .12s, color .12s' }}>
              <Pin size={16} />
            </button>
            {/* Members */}
            <button onClick={() => setSidePanel(p => p === 'members' ? null : 'members')}
              title="Members" style={{ background: sidePanel === 'members' ? 'var(--bg3)' : 'none', border: 'none', cursor: 'pointer', padding: '5px 7px', borderRadius: 7, color: sidePanel === 'members' ? 'var(--text)' : 'var(--text3)', display: 'flex', transition: 'background .12s, color .12s' }}>
              <Users size={16} />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <FilterBar active={filter} onChange={f => { setFilter(f); setSearchQuery(''); }} />

        {/* Message list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* IntersectionObserver sentinel */}
          <div ref={topSentinelRef} style={{ height: 1 }} />
          {loadingMore && <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--text3)', fontSize: 12 }}>Loading older messages…</div>}

          {messages.length === 0 && activeTab && (
            <div style={{ padding: '32px 24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Hash size={28} style={{ color: 'var(--text3)' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>Welcome to {headerName}</h2>
              <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>This is the beginning of {headerName}. Say hello! 👋</p>
            </div>
          )}

          {/* Pending file previews */}
          {pendingFiles.length > 0 && (
            <div style={{ padding: '0 16px 4px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pendingFiles.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <Paperclip size={12} style={{ color: 'var(--brand)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f.name}</span>
                  <button onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}

          {messageGroups.map((item, globalIdx) => {
            const msgIdx = messageGroups.slice(0, globalIdx + 1).filter(x => x.type === 'message').length - 1;
            const showUnread = item.type === 'message' && lastReadIdx >= 0 && msgIdx === lastReadIdx + 1 && unreadCount > 0;
            return (
              <div key={item.key}>
                {showUnread && <UnreadSeparator count={unreadCount} />}
                {item.type === 'date'
                  ? <DateDivider label={item.label} />
                  : <MessageBubble
                      m={item.m}
                      prevM={item.prevM}
                      isOwn={getSenderId(item.m) === user?.id}
                      currentUser={user}
                      onReact={handleReact}
                      onEdit={handleEditStart}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onReply={m => setReplyTo(m)}
                      onOpenThread={m => { setThreadMsg(m); setSidePanel('thread'); }}
                      onLightbox={src => setLightboxSrc(src)}
                      editingId={editingId}
                      editValue={editValue}
                      onEditChange={setEditValue}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                    />
                }
              </div>
            );
          })}
          <div ref={scrollRef} style={{ height: 1 }} />
        </div>

        {/* Compose */}
        <ComposeBar
          value={input}
          onChange={handleInputChange}
          onSend={handleSend}
          placeholder={`Message ${headerName}`}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          typingUsers={typingUsers}
          onFileSelect={files => setPendingFiles(prev => [...prev, ...files])}
          dragOver={dragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          members={members}
          currentUser={user}
        />
      </div>

      {/* ════ SIDE PANELS ════ */}
      {sidePanel === 'thread' && threadMsg && (
        <ThreadSidebar
          parentMsg={threadMsg}
          currentUser={user}
          onClose={() => { setSidePanel(null); setThreadMsg(null); }}
          onReplied={(parentId) => setMessages(prev => prev.map(m =>
            m.id === parentId ? { ...m, reply_count: (m.reply_count || 0) + 1 } : m
          ))}
        />
      )}
      {sidePanel === 'pinned' && (
        <PinnedPanel channelId={activeTab} onJumpTo={jumpToMessage} onClose={() => setSidePanel(null)} />
      )}
      {sidePanel === 'members' && (
        <aside style={{ width: 220, flexShrink: 0, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Members</span>
            <button onClick={() => setSidePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 3, borderRadius: 4 }}><X size={14} /></button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {/* Online */}
            {members.filter(m => Array.isArray(onlineUsers) && onlineUsers.includes(m.id)).length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, padding: '0 14px 4px' }}>Online — {members.filter(m => Array.isArray(onlineUsers) && onlineUsers.includes(m.id)).length}</div>
                {members.filter(m => Array.isArray(onlineUsers) && onlineUsers.includes(m.id)).map(m => (
                  <MemberRow key={m.id} member={m} isOnline onStartDM={m.id !== user?.id ? handleStartDM : null} />
                ))}
              </>
            )}
            {/* Offline */}
            {members.filter(m => !Array.isArray(onlineUsers) || !onlineUsers.includes(m.id)).length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 14px 4px' }}>Offline</div>
                {members.filter(m => !Array.isArray(onlineUsers) || !onlineUsers.includes(m.id)).map(m => (
                  <MemberRow key={m.id} member={m} isOnline={false} onStartDM={m.id !== user?.id ? handleStartDM : null} />
                ))}
              </>
            )}
          </div>
        </aside>
      )}

      {/* Create channel modal */}
      <CreateChannelModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}
        onCreated={newCh => { setChannels(prev => [...prev, newCh]); setActiveTab(newCh.id); setShowCreateModal(false); }} />
    </div>
  );
}
