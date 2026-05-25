import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { chat } from '../services/api';
import api from '../services/api';
import {
  MessageSquare, Hash, Plus, Search, Send, Smile, Paperclip,
  Edit2, Trash2, Pin, Reply, X, ChevronDown, Users, MoreHorizontal,
  Check, CheckCheck, AtSign
} from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import CreateChannelModal from '../components/chat/CreateChannelModal';

// ─── helpers ────────────────────────────────────────────────────────────────

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '✅', '🎉', '🙌'];

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime()) return 'Today';
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function renderContent(content) {
  if (!content) return null;
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} style={{ color: 'var(--brand)', fontWeight: 600 }}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

function isImageFile(name) {
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name || '');
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ user, size = 36, isOnline }) {
  const initials = user
    ? `${(user.first_name || user.name || '?')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '?';
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {user?.avatar
        ? <img src={user.avatar} alt={initials}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        : <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'var(--brand)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 700, userSelect: 'none'
          }}>{initials}</div>
      }
      {isOnline !== undefined && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.3, height: size * 0.3, borderRadius: '50%',
          background: isOnline ? '#22c55e' : '#6b7280',
          border: '2px solid var(--bg2)'
        }} />
      )}
    </div>
  );
}

// ─── EmojiPicker ─────────────────────────────────────────────────────────────

function EmojiPicker({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div ref={ref} style={{
      position: 'absolute', bottom: '110%', left: 0,
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap',
      gap: 4, width: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100
    }}>
      {COMMON_EMOJIS.map(e => (
        <button key={e} onClick={() => { onPick(e); onClose(); }}
          style={{
            background: 'none', border: 'none', fontSize: 22,
            cursor: 'pointer', padding: '4px 6px', borderRadius: 6,
            transition: 'background .15s'
          }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
        >{e}</button>
      ))}
    </div>
  );
}

// ─── MessageReactionPicker ───────────────────────────────────────────────────

function ReactionPickerPopover({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', right: 0,
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 10, padding: 6, display: 'flex', flexWrap: 'wrap',
      gap: 2, width: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200
    }}>
      {COMMON_EMOJIS.map(e => (
        <button key={e} onClick={() => { onPick(e); onClose(); }}
          style={{
            background: 'none', border: 'none', fontSize: 20,
            cursor: 'pointer', padding: '3px 5px', borderRadius: 4,
            transition: 'background .12s'
          }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
        >{e}</button>
      ))}
    </div>
  );
}

// ─── DeleteConfirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500
    }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 28, maxWidth: 340, width: '90%',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ color: 'var(--text)', margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>Delete message?</h3>
        <p style={{ color: 'var(--text2)', margin: '0 0 20px', fontSize: 14 }}>
          This will permanently delete the message. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, fontSize: 14
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── MessageBubble ───────────────────────────────────────────────────────────

function MessageBubble({
  m, prevM, isOwn, onReact, onEdit, onDelete, onPin, onReply,
  editingId, editValue, onEditChange, onEditSave, onEditCancel
}) {
  const [hovered, setHovered] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmingPin, setConfirmingPin] = useState(false);

  const sameAuthor = prevM && prevM.user?.id === m.user?.id &&
    (new Date(m.timestamp) - new Date(prevM.timestamp)) < 300000;

  const isEditing = editingId === m.id;

  const fileAttachments = m.attachments || [];

  return (
    <>
      {showDeleteConfirm && (
        <DeleteConfirm
          onConfirm={() => { onDelete(m.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowReactionPicker(false); }}
        style={{
          display: 'flex', gap: 10, padding: sameAuthor ? '2px 16px' : '10px 16px',
          background: hovered ? 'var(--bg3)' : 'transparent',
          transition: 'background .12s', position: 'relative', borderRadius: 8
        }}
      >
        {/* Avatar or spacer */}
        <div style={{ width: 36, flexShrink: 0, paddingTop: sameAuthor ? 0 : 2 }}>
          {!sameAuthor && <Avatar user={m.user} size={36} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          {!sameAuthor && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                {m.user?.first_name} {m.user?.last_name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)', opacity: 0.7 }}>
                {formatTime(m.timestamp)}
              </span>
              {m.is_pinned && (
                <span style={{ fontSize: 11, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Pin size={11} /> Pinned
                </span>
              )}
            </div>
          )}

          {/* Reply quote */}
          {m.reply_to && (
            <div style={{
              borderLeft: '3px solid var(--brand)', paddingLeft: 8,
              marginBottom: 4, color: 'var(--text3)', fontSize: 12,
              background: 'var(--bg3)', borderRadius: '0 6px 6px 0', padding: '4px 8px',
              marginLeft: -2
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text2)', marginRight: 6 }}>
                {m.reply_to.user?.first_name}:
              </span>
              {m.reply_to.content?.slice(0, 120)}{(m.reply_to.content?.length || 0) > 120 ? '…' : ''}
            </div>
          )}

          {/* Content or edit box */}
          {isEditing ? (
            <div style={{ marginTop: 2 }}>
              <textarea
                value={editValue}
                onChange={e => onEditChange(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg)', border: '1px solid var(--brand)',
                  borderRadius: 8, color: 'var(--text)', fontSize: 14, padding: '8px 10px',
                  resize: 'vertical', outline: 'none', minHeight: 64,
                  fontFamily: 'inherit'
                }}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEditSave(m.id); }
                  if (e.key === 'Escape') onEditCancel();
                }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button onClick={() => onEditSave(m.id)} style={{
                  padding: '4px 12px', background: 'var(--brand)', color: '#fff',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13
                }}>Save</button>
                <button onClick={onEditCancel} style={{
                  padding: '4px 12px', background: 'var(--bg3)', color: 'var(--text2)',
                  border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 13
                }}>Cancel</button>
                <span style={{ fontSize: 11, color: 'var(--text3)', alignSelf: 'center' }}>
                  Esc to cancel · Enter to save
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.55, wordBreak: 'break-word' }}>
              {renderContent(m.content)}
              {m.edited_at && (
                <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>(edited)</span>
              )}
            </div>
          )}

          {/* File attachments */}
          {fileAttachments.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fileAttachments.map((f, i) => isImageFile(f.name || f.file) ? (
                <img key={i} src={f.url || f.file} alt={f.name || 'image'}
                  style={{ maxWidth: 280, maxHeight: 200, borderRadius: 8, objectFit: 'cover',
                    border: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => window.open(f.url || f.file, '_blank')}
                />
              ) : (
                <a key={i} href={f.url || f.file} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                    color: 'var(--brand)', fontSize: 13, fontWeight: 600, textDecoration: 'none'
                  }}>
                  <Paperclip size={14} />
                  <span>{f.name || 'Attachment'}</span>
                </a>
              ))}
            </div>
          )}

          {/* Reactions */}
          {m.reactions?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {m.reactions.map(r => (
                <button key={r.emoji} onClick={() => onReact(m.id, r.emoji)} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                  borderRadius: 12, border: '1px solid var(--border)',
                  background: r.reacted_by_me ? 'rgba(99,102,241,.15)' : 'var(--bg3)',
                  cursor: 'pointer', fontSize: 13, color: 'var(--text2)',
                  transition: 'border-color .15s, background .15s'
                }}
                  onMouseEnter={ev => ev.currentTarget.style.borderColor = 'var(--brand)'}
                  onMouseLeave={ev => ev.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span>{r.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{r.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Reply count */}
          {m.reply_count > 0 && (
            <button onClick={() => onReply(m)} style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--brand)', fontSize: 12, fontWeight: 600, padding: '2px 0'
            }}>
              <MessageSquare size={13} />
              {m.reply_count} {m.reply_count === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Hover action toolbar */}
        {hovered && !isEditing && (
          <div style={{
            position: 'absolute', top: -16, right: 12,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            padding: '3px 4px', gap: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            zIndex: 50
          }}>
            {/* React */}
            <div style={{ position: 'relative' }}>
              <ActionBtn icon={<Smile size={15} />} title="Add reaction"
                onClick={() => setShowReactionPicker(p => !p)} />
              {showReactionPicker && (
                <ReactionPickerPopover
                  onPick={emoji => onReact(m.id, emoji)}
                  onClose={() => setShowReactionPicker(false)}
                />
              )}
            </div>
            {/* Reply */}
            <ActionBtn icon={<Reply size={15} />} title="Reply" onClick={() => onReply(m)} />
            {/* Pin */}
            <ActionBtn icon={<Pin size={15} />} title={m.is_pinned ? 'Unpin' : 'Pin message'}
              onClick={() => onPin(m.id)} active={m.is_pinned} />
            {/* Copy */}
            <ActionBtn icon={<Check size={15} />} title="Copy text"
              onClick={() => navigator.clipboard.writeText(m.content || '')} />
            {/* Edit (own only) */}
            {isOwn && (
              <ActionBtn icon={<Edit2 size={15} />} title="Edit message"
                onClick={() => onEdit(m)} />
            )}
            {/* Delete (own only) */}
            {isOwn && (
              <ActionBtn icon={<Trash2 size={15} />} title="Delete message" danger
                onClick={() => setShowDeleteConfirm(true)} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function ActionBtn({ icon, title, onClick, active, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? (danger ? 'rgba(239,68,68,.1)' : 'var(--bg3)') : 'none',
        border: 'none', cursor: 'pointer', padding: '5px 7px', borderRadius: 6,
        color: hov && danger ? '#ef4444' : (active ? 'var(--brand)' : 'var(--text3)'),
        display: 'flex', alignItems: 'center', transition: 'background .12s, color .12s'
      }}
    >{icon}</button>
  );
}

// ─── DateDivider ─────────────────────────────────────────────────────────────

function DateDivider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', userSelect: 'none'
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{
        fontSize: 12, fontWeight: 700, color: 'var(--text3)',
        padding: '2px 10px', background: 'var(--bg2)',
        border: '1px solid var(--border)', borderRadius: 10
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

// ─── ComposeBar ──────────────────────────────────────────────────────────────

function ComposeBar({
  value, onChange, onSend, placeholder, replyTo, onCancelReply,
  typingUsers, onFileSelect, dragOver, onDragOver, onDragLeave, onDrop
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const insertFormat = (prefix, suffix = prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div
      style={{ padding: '8px 12px 12px', position: 'relative' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(99,102,241,.15)',
          border: '2px dashed var(--brand)', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20, fontSize: 15, fontWeight: 700, color: 'var(--brand)',
          backdropFilter: 'blur(2px)', pointerEvents: 'none'
        }}>
          Drop files to attach
        </div>
      )}

      {/* Reply bar */}
      {replyTo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', background: 'var(--bg3)',
          borderRadius: '8px 8px 0 0', borderBottom: '1px solid var(--border)',
          marginBottom: 0
        }}>
          <Reply size={13} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>
              {replyTo.user?.first_name}:&nbsp;
            </span>
            {replyTo.content?.slice(0, 100)}
          </span>
          <button onClick={onCancelReply} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
            display: 'flex', padding: 2, borderRadius: 4
          }}><X size={14} /></button>
        </div>
      )}

      {/* Compose box */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: replyTo ? '0 0 12px 12px' : 12,
        transition: 'border-color .15s',
        overflow: 'hidden'
      }}
        onFocus={ev => ev.currentTarget.style.borderColor = 'var(--brand)'}
        onBlur={ev => ev.currentTarget.style.borderColor = 'var(--border)'}
      >
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 10px 0', borderBottom: '1px solid var(--border)' }}>
          <FormatBtn title="Bold" label="B" onClick={() => insertFormat('**')} style={{ fontWeight: 800 }} />
          <FormatBtn title="Italic" label="I" onClick={() => insertFormat('_')} style={{ fontStyle: 'italic' }} />
          <FormatBtn title="Code" label="<>" onClick={() => insertFormat('`')} style={{ fontFamily: 'monospace' }} />
          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
          <div style={{ position: 'relative' }}>
            <FormatBtn title="Emoji" icon={<Smile size={14} />} onClick={() => setShowEmoji(p => !p)} />
            {showEmoji && <EmojiPicker onPick={e => { onChange(value + e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />}
          </div>
          <FormatBtn title="Mention" icon={<AtSign size={14} />} onClick={() => { onChange(value + '@'); textareaRef.current?.focus(); }} />
          <FormatBtn title="Attach file" icon={<Paperclip size={14} />} onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => onFileSelect(Array.from(e.target.files))} />
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            color: 'var(--text)', padding: '10px 12px', fontSize: 14,
            resize: 'none', outline: 'none', minHeight: 60, maxHeight: 240,
            fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box'
          }}
          rows={2}
        />

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '4px 8px 6px' }}>
          <button
            onClick={onSend}
            disabled={!value.trim()}
            style={{
              background: value.trim() ? 'var(--brand)' : 'var(--bg3)',
              border: 'none', borderRadius: 8, padding: '7px 14px',
              color: value.trim() ? '#fff' : 'var(--text3)',
              cursor: value.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: 6,
              fontWeight: 700, fontSize: 13, transition: 'background .15s'
            }}
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginTop: 4, paddingLeft: 4 }}>
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing
          <span style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
            <span style={{ animation: 'blink 1.2s infinite' }}>.</span>
            <span style={{ animation: 'blink 1.2s .4s infinite' }}>.</span>
            <span style={{ animation: 'blink 1.2s .8s infinite' }}>.</span>
          </span>
        </div>
      )}
    </div>
  );
}

function FormatBtn({ title, label, icon, onClick, style: s }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg3)' : 'none', border: 'none', borderRadius: 5,
        padding: '3px 6px', cursor: 'pointer', color: hov ? 'var(--text)' : 'var(--text3)',
        fontSize: 13, display: 'flex', alignItems: 'center', transition: 'background .12s, color .12s',
        ...s
      }}
    >{icon || label}</button>
  );
}

// ─── Main Chat component ─────────────────────────────────────────────────────

export default function Chat() {
  const { user, activeWorkspace, onlineUsers } = useStore();

  // ── data state ──
  const [channels, setChannels] = useState([]);
  const [dms, setDms] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // ── UI state ──
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── load channels & DMs ──
  useEffect(() => {
    if (!activeWorkspace) return;
    const fetchData = async () => {
      try {
        const [chRes, dmRes] = await Promise.all([
          api.get(`/channels/?workspace=${activeWorkspace.id}`),
          chat.dms()
        ]);
        const chList = Array.isArray(chRes.data) ? chRes.data : (chRes.data?.results || []);
        const dmList = Array.isArray(dmRes.data) ? dmRes.data : (dmRes.data?.results || []);
        setChannels(chList);
        setDms(dmList);
        if (chList.length > 0 && !activeTab) setActiveTab(chList[0].id);
      } catch (e) {
        console.warn('Failed to load chat lists', e);
      }
    };
    fetchData();
  }, [activeWorkspace]);

  // ── load messages when tab changes ──
  const loadMessages = useCallback(async (tabId, pg = 1) => {
    if (!tabId) return;
    try {
      const res = await chat.messages({ channel: tabId, page: pg });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      const sorted = [...list].reverse();
      if (pg === 1) {
        setMessages(sorted);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'auto' }), 80);
      } else {
        setMessages(prev => [...sorted, ...prev]);
      }
      setHasMore(!!(data?.next));
      setPage(pg);
    } catch (e) {
      console.warn('Failed to load messages', e);
    }
  }, []);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(false);
    setTypingUsers([]);
    setReplyTo(null);
    setEditingId(null);
    setSearchQuery('');
    if (activeTab) {
      loadMessages(activeTab, 1);
      chat.markRead(activeTab).catch(() => {});
      // mark channel as read in sidebar
      setChannels(prev => prev.map(c => c.id === activeTab ? { ...c, unread: 0 } : c));
      setDms(prev => prev.map(d => d.id === activeTab ? { ...d, unread: 0 } : d));
    }
  }, [activeTab, loadMessages]);

  // ── WebSocket ──
  const { send } = useWebSocket(`/ws/chat/${activeTab}/`, {
    enabled: !!activeTab,
    onMessage: (data) => {
      switch (data.type) {
        case 'chat_message':
          setMessages(prev => [...prev, data]);
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          break;
        case 'typing':
          if (data.user_id !== user?.id) {
            setTypingUsers(prev =>
              data.is_typing
                ? prev.includes(data.username) ? prev : [...prev, data.username]
                : prev.filter(u => u !== data.username)
            );
          }
          break;
        case 'message_update_broadcast':
          setMessages(prev => prev.map(m =>
            m.id === data.message_id
              ? { ...m, content: data.message, edited_at: data.edited_at }
              : m
          ));
          break;
        case 'message_delete_broadcast':
          setMessages(prev => prev.filter(m => m.id !== data.message_id));
          break;
        case 'reaction':
          setMessages(prev => prev.map(m => {
            if (m.id !== data.message_id) return m;
            const reactions = m.reactions || [];
            const exists = reactions.find(r => r.emoji === data.emoji);
            return {
              ...m,
              reactions: exists
                ? reactions.map(r => r.emoji === data.emoji ? { ...r, count: r.count + 1 } : r)
                : [...reactions, { emoji: data.emoji, count: 1 }]
            };
          }));
          break;
        default: break;
      }
    }
  });

  // ── send message ──
  const handleSend = useCallback(async () => {
    if (!input.trim() && pendingFiles.length === 0) return;

    const payload = {
      type: 'chat_message',
      message: input,
      reply_to_id: replyTo?.id || null
    };

    // Optimistic add
    const optimistic = {
      id: `opt_${Date.now()}`,
      user,
      content: input,
      timestamp: new Date().toISOString(),
      reactions: [],
      reply_to: replyTo || null,
      reply_count: 0,
      is_pinned: false
    };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setReplyTo(null);
    setPendingFiles([]);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const sent = send(payload);
    if (!sent) {
      // WS down — keep optimistic message
      console.warn('WS unavailable, message shown optimistically');
    }

    // Handle file uploads
    if (pendingFiles.length > 0) {
      for (const f of pendingFiles) {
        const fd = new FormData();
        fd.append('file', f);
        fd.append('channel', activeTab);
        try {
          await api.post('/file-attachments/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } catch (e) { console.warn('File upload failed', e); }
      }
    }

    // Send typing stopped
    send({ type: 'typing', is_typing: false });
  }, [input, replyTo, pendingFiles, activeTab, user, send]);

  // ── input change + typing ──
  const handleInputChange = useCallback((val) => {
    setInput(val);
    send({ type: 'typing', is_typing: true });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => send({ type: 'typing', is_typing: false }), 2500);
  }, [send]);

  // ── reactions ──
  const handleReact = useCallback(async (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const reactions = m.reactions || [];
      const exists = reactions.find(r => r.emoji === emoji);
      return {
        ...m,
        reactions: exists
          ? reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
          : [...reactions, { emoji, count: 1 }]
      };
    }));
    try { await chat.addReaction(msgId, emoji); } catch (e) {}
  }, []);

  // ── edit ──
  const handleEditStart = useCallback((m) => {
    setEditingId(m.id);
    setEditValue(m.content);
  }, []);

  const handleEditSave = useCallback(async (msgId) => {
    const newContent = editValue.trim();
    if (!newContent) return;
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, content: newContent, edited_at: new Date().toISOString() } : m
    ));
    setEditingId(null);
    setEditValue('');
    const sent = send({ type: 'edit_message', message_id: msgId, message: newContent });
    if (!sent) { try { await chat.editMessage(msgId, newContent); } catch (e) {} }
  }, [editValue, send]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, []);

  // ── delete ──
  const handleDelete = useCallback(async (msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    const sent = send({ type: 'delete_message', message_id: msgId });
    if (!sent) { try { await chat.deleteMessage(msgId); } catch (e) {} }
  }, [send]);

  // ── pin ──
  const handlePin = useCallback(async (msgId) => {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, is_pinned: !m.is_pinned } : m
    ));
    try { await chat.pinMessage(msgId); } catch (e) {}
  }, []);

  // ── file drop ──
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) setPendingFiles(prev => [...prev, ...files]);
  };

  // ── helpers ──
  const activeChannel = channels.find(c => c.id === activeTab);
  const activeDM = dms.find(d => d.id === activeTab);
  const headerName = activeChannel ? `#${activeChannel.name}` : (activeDM?.name || 'Chat');
  const memberCount = activeChannel?.member_count || activeDM?.member_count || null;

  const filteredMessages = searchQuery
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // ── group messages by date ──
  const messageGroups = [];
  let currentLabel = null;
  filteredMessages.forEach((m, i) => {
    const label = formatDateLabel(m.timestamp);
    if (label !== currentLabel) {
      messageGroups.push({ type: 'date', label, key: `date_${i}` });
      currentLabel = label;
    }
    messageGroups.push({ type: 'message', m, key: m.id || i, prevM: i > 0 ? filteredMessages[i - 1] : null });
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden',
      background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit' }}>

      {/* ── Blink keyframes ── */}
      <style>{`@keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }`}</style>

      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <aside style={{
        width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        {/* Workspace header */}
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: -.3 }}>
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronDown size={15} style={{ color: 'var(--text3)' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 10 }}>
          {/* Channels section */}
          <div style={{ marginBottom: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '2px 16px 6px', userSelect: 'none'
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: 1 }}>Channels</span>
              <button onClick={() => setShowCreateModal(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
                display: 'flex', padding: 2, borderRadius: 4, transition: 'color .15s'
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              ><Plus size={14} /></button>
            </div>

            {channels.map(c => (
              <SidebarChannelItem
                key={c.id}
                item={c}
                active={activeTab === c.id}
                onClick={() => setActiveTab(c.id)}
                icon={<Hash size={15} />}
              />
            ))}
          </div>

          {/* DMs section */}
          <div style={{ marginTop: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '2px 16px 6px', userSelect: 'none'
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: 1 }}>Direct Messages</span>
            </div>

            {dms.map(d => {
              const isOnline = Array.isArray(onlineUsers) && onlineUsers.includes(d.other_user?.id || d.id);
              return (
                <SidebarDmItem
                  key={d.id}
                  dm={d}
                  active={activeTab === d.id}
                  isOnline={isOnline}
                  onClick={() => setActiveTab(d.id)}
                />
              );
            })}
          </div>
        </div>
      </aside>

      {/* ══════════ MAIN CHAT AREA ══════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Channel header */}
        <div style={{
          height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px',
          borderBottom: '1px solid var(--border)', background: 'var(--bg)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{headerName}</span>
            {memberCount && (
              <span style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Users size={12} /> {memberCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Inline search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{
                position: 'absolute', left: 8, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text3)'
              }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                style={{
                  paddingLeft: 28, paddingRight: 10, paddingTop: 5, paddingBottom: 5,
                  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text)', fontSize: 13, outline: 'none', width: 180,
                  transition: 'border-color .15s, width .2s'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.width = '240px'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.width = '180px'; }}
              />
            </div>
            {/* Toggle members panel */}
            <button
              onClick={() => setShowMembersPanel(p => !p)}
              title="Toggle members"
              style={{
                background: showMembersPanel ? 'var(--bg3)' : 'none',
                border: 'none', cursor: 'pointer', padding: '6px 8px',
                borderRadius: 7, color: showMembersPanel ? 'var(--text)' : 'var(--text3)',
                display: 'flex', transition: 'background .15s, color .15s'
              }}
            ><Users size={16} /></button>
          </div>
        </div>

        {/* Message list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <button onClick={() => loadMessages(activeTab, page + 1)} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                color: 'var(--text2)', borderRadius: 8, padding: '5px 16px',
                cursor: 'pointer', fontSize: 12, fontWeight: 600
              }}>Load older messages</button>
            </div>
          )}

          {!hasMore && messages.length === 0 && activeTab && (
            <div style={{ padding: '32px 24px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
              }}>
                <Hash size={28} style={{ color: 'var(--text3)' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
                Welcome to {headerName}
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>
                This is the beginning of the {headerName} channel.
              </p>
            </div>
          )}

          {/* Pending file preview */}
          {pendingFiles.length > 0 && (
            <div style={{ padding: '0 16px 4px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pendingFiles.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8
                }}>
                  <Paperclip size={12} style={{ color: 'var(--brand)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f.name}</span>
                  <button onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {messageGroups.map(item =>
            item.type === 'date'
              ? <DateDivider key={item.key} label={item.label} />
              : <MessageBubble
                  key={item.key}
                  m={item.m}
                  prevM={item.prevM}
                  isOwn={item.m.user?.id === user?.id}
                  onReact={handleReact}
                  onEdit={handleEditStart}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onReply={setReplyTo}
                  editingId={editingId}
                  editValue={editValue}
                  onEditChange={setEditValue}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                />
          )}
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
        />
      </div>

      {/* ══════════ RIGHT MEMBERS PANEL ══════════ */}
      {showMembersPanel && (
        <aside style={{
          width: 220, flexShrink: 0, background: 'var(--bg2)',
          borderLeft: '1px solid var(--border)', display: 'flex',
          flexDirection: 'column', overflowY: 'auto'
        }}>
          <div style={{
            padding: '14px 14px 10px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Members</span>
            <button onClick={() => setShowMembersPanel(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', display: 'flex', padding: 3, borderRadius: 4 }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ padding: '10px 0' }}>
            {/* Online members */}
            {dms.length > 0 && (
              <>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: 1, padding: '0 14px',
                  display: 'block', marginBottom: 6 }}>
                  Online — {dms.filter(d => Array.isArray(onlineUsers) && onlineUsers.includes(d.other_user?.id || d.id)).length}
                </span>
                {dms.filter(d => Array.isArray(onlineUsers) && onlineUsers.includes(d.other_user?.id || d.id)).map(d => (
                  <MemberRow key={d.id} dm={d} isOnline={true} onSelect={() => setActiveTab(d.id)} />
                ))}

                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: 1, padding: '10px 14px 6px',
                  display: 'block' }}>
                  Offline — {dms.filter(d => !Array.isArray(onlineUsers) || !onlineUsers.includes(d.other_user?.id || d.id)).length}
                </span>
                {dms.filter(d => !Array.isArray(onlineUsers) || !onlineUsers.includes(d.other_user?.id || d.id)).map(d => (
                  <MemberRow key={d.id} dm={d} isOnline={false} onSelect={() => setActiveTab(d.id)} />
                ))}
              </>
            )}
          </div>
        </aside>
      )}

      {/* ══════════ CREATE CHANNEL MODAL ══════════ */}
      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={newCh => {
          setChannels(prev => [...prev, newCh]);
          setActiveTab(newCh.id);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

// ─── Sidebar channel item ────────────────────────────────────────────────────

function SidebarChannelItem({ item, active, onClick, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 12px 5px 16px', cursor: 'pointer', borderRadius: 6,
        margin: '1px 6px',
        background: active ? 'var(--brand)' : (hov ? 'var(--bg3)' : 'transparent'),
        transition: 'background .12s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
        <span style={{ color: active ? '#fff' : 'var(--text3)', flexShrink: 0 }}>{icon}</span>
        <span style={{
          fontSize: 13, fontWeight: active ? 700 : 500,
          color: active ? '#fff' : (hov ? 'var(--text)' : 'var(--text2)'),
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{item.name}</span>
      </div>
      {item.unread > 0 && !active && (
        <span style={{
          background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800,
          padding: '1px 6px', borderRadius: 10, flexShrink: 0
        }}>{item.unread > 99 ? '99+' : item.unread}</span>
      )}
    </div>
  );
}

// ─── Sidebar DM item ─────────────────────────────────────────────────────────

function SidebarDmItem({ dm, active, isOnline, onClick }) {
  const [hov, setHov] = useState(false);
  const name = dm.name || dm.other_user?.first_name || 'Unknown';
  const lastSeen = dm.other_user?.last_seen;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 12px 5px 16px', cursor: 'pointer', borderRadius: 6,
        margin: '1px 6px',
        background: active ? 'var(--brand)' : (hov ? 'var(--bg3)' : 'transparent'),
        transition: 'background .12s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1 }}>
        <Avatar user={dm.other_user || { first_name: name }} size={22} isOnline={isOnline} />
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: active ? 700 : 500,
            color: active ? '#fff' : (hov ? 'var(--text)' : 'var(--text2)'),
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{name}</div>
          {!isOnline && lastSeen && (
            <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,.6)' : 'var(--text3)' }}>
              {new Date(lastSeen).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
      {dm.unread > 0 && !active && (
        <span style={{
          background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800,
          padding: '1px 6px', borderRadius: 10, flexShrink: 0
        }}>{dm.unread > 99 ? '99+' : dm.unread}</span>
      )}
    </div>
  );
}

// ─── Member row ──────────────────────────────────────────────────────────────

function MemberRow({ dm, isOnline, onSelect }) {
  const [hov, setHov] = useState(false);
  const name = dm.name || dm.other_user?.first_name || 'Unknown';
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 14px', cursor: 'pointer',
        background: hov ? 'var(--bg3)' : 'transparent',
        transition: 'background .12s'
      }}
    >
      <Avatar user={dm.other_user || { first_name: name }} size={26} isOnline={isOnline} />
      <span style={{ fontSize: 13, color: isOnline ? 'var(--text)' : 'var(--text3)', fontWeight: 500 }}>
        {name}
      </span>
    </div>
  );
}
