import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import api, { chat, ws as wsApi, presence, calls, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Hash, Send, Plus, MessageSquare, X, Users, Search, Reply, ChevronLeft, Video, Trash2, Smile, LogOut, Paperclip, Pin } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Avatar } from '../components/common/Avatar';

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    setMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return mobile;
}

const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

export default function Chat() {
  const { activeWorkspace, user, lang = 'en' } = useStore();
  const navigate = useNavigate();
  const t = getT(lang);
  const isMobile = useIsMobile();

  const [channels, setChannels] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [dms, setDms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState('group');
  const [creating, setCreating] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [threadMsg, setThreadMsg] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threadReply, setThreadReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const threadEndRef = useRef(null);

  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [onlineIds, setOnlineIds] = useState(new Set());

  const [showSidebar, setShowSidebar] = useState(true);

  const [replyCounts, setReplyCounts] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);

  useEffect(() => {
    if (!activeWorkspace) return;
    loadChannels();
    loadAllChannels();
    loadDms();
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeChannel) {
      loadMessages();
      connectWebSocket();
      if (isMobile) setShowSidebar(false);
    }
    return () => {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    };
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadReplies]);

  useEffect(() => {
    if (!isMobile) setShowSidebar(true);
  }, [isMobile]);

  useEffect(() => {
    if (!showSearch || !activeChannel) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await chat.searchMessages(activeChannel.id, searchQuery.trim());
        setSearchResults(unwrapData(res));
      } catch { setSearchResults([]); } finally { setSearching(false); }
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery, showSearch, activeChannel]);

  const loadChannels = async () => {
    setLoadingChannels(true);
    try {
      const res = await chat.channels();
      const ch = unwrapData(res);
      setChannels(ch);
      if (ch.length && !activeChannel) setActiveChannel(ch[0]);
    } catch { toast.error('Failed to load channels'); } finally { setLoadingChannels(false); }
  };

  const loadAllChannels = async () => {
    try {
      const res = await api.get('/channels/', { params: { workspace: activeWorkspace.id, all: true } });
      setAllChannels(unwrapData(res));
    } catch {}
  };

  const loadDms = async () => {
    try { const res = await chat.dms(); setDms(unwrapData(res)); } catch {}
  };

  const loadMessages = async () => {
    if (!activeChannel) return;
    setLoadingMessages(true);
    try {
      const res = await chat.messages({ channel: activeChannel.id });
      const msgs = unwrapData(res);
      setMessages(msgs);
      const initialReactions = {};
      msgs.forEach(m => {
        if (m.reactions?.length) initialReactions[m.id] = m.reactions;
      });
      setMessageReactions(prev => ({ ...prev, ...initialReactions }));
    } catch { toast.error('Failed to load messages'); } finally { setLoadingMessages(false); }
  };

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (!activeChannel) return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const token = localStorage.getItem('rtm_access');
    const url = `${protocol}://${window.location.host}/ws/chat/${activeChannel.id}/?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.message) {
          const msg = data.message;
          if (msg.parent) {
            setThreadReplies(prev => {
              if (prev.find(r => r.id === msg.id)) return prev;
              return [...prev, msg];
            });
            setReplyCounts(prev => ({ ...prev, [msg.parent]: (prev[msg.parent] || 0) + 1 }));
          } else {
            setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
          if (msg.reactions) {
            setMessageReactions(prev => ({ ...prev, [msg.id]: msg.reactions }));
          }
        }
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {};
  }, [activeChannel]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMsg.trim();
    if (!text || !activeChannel) return;
    setSending(true);
    try {
      await chat.sendMessage({ channel: activeChannel.id, content: text });
      setNewMsg('');
      await loadMessages();
    } catch { toast.error('Failed to send message'); } finally { setSending(false); }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const res = await chat.createChannel({ name: createName.trim(), room_type: createType, workspace: activeWorkspace.id });
      const created = unwrapData(res);
      const newChannel = Array.isArray(created) ? created[0] : created;
      if (newChannel?.id) {
        await chat.joinChannel(newChannel.id);
        await loadChannels();
        await loadAllChannels();
        setActiveChannel(newChannel);
      }
      setShowCreateModal(false);
      setCreateName('');
      setCreateType('group');
      toast.success('Channel created');
    } catch { toast.error('Failed to create channel'); } finally { setCreating(false); }
  };

  const handleJoinChannel = async (channel) => {
    try {
      await chat.joinChannel(channel.id);
      await loadChannels();
      setActiveChannel(channel);
      toast.success(`Joined #${channel.name}`);
    } catch { toast.error('Failed to join channel'); }
  };

  const openThread = async (msg) => {
    setThreadMsg(msg);
    setLoadingThread(true);
    try {
      const res = await chat.thread(msg.id);
      const replies = unwrapData(res);
      setThreadReplies(replies);
      setReplyCounts(prev => ({ ...prev, [msg.id]: replies.length }));
    } catch { setThreadReplies([]); } finally { setLoadingThread(false); }
  };

  const handleThreadReply = async (e) => {
    e.preventDefault();
    const text = threadReply.trim();
    if (!text || !threadMsg) return;
    setSendingReply(true);
    try {
      await chat.sendMessage({ channel: activeChannel.id, content: text, parent: threadMsg.id });
      setThreadReply('');
      const res = await chat.thread(threadMsg.id);
      setThreadReplies(unwrapData(res));
    } catch { toast.error('Failed to send reply'); } finally { setSendingReply(false); }
  };

  const loadMembers = async () => {
    if (!activeWorkspace) return;
    try {
      const [memRes, onlineRes] = await Promise.all([
        wsApi.members(activeWorkspace.id),
        presence.onlineUsers().catch(() => ({ data: [] })),
      ]);
      setMembers(unwrapData(memRes));
      const online = unwrapData(onlineRes);
      setOnlineIds(new Set(online.map(u => u.id || u.user?.id).filter(Boolean)));
    } catch { toast.error('Failed to load members'); }
  };

  const toggleMembers = () => {
    const next = !showMembers;
    setShowMembers(next);
    if (next) loadMembers();
  };

  const handleStartCall = async () => {
    if (!activeChannel) return;
    const roomId = `channel-${activeChannel.id}-${Date.now()}`;
    try {
      const userIds = members.map(m => m.id).filter(id => id !== user?.id);
      await calls.initiate(roomId, userIds);
      navigate(`/call/${roomId}`);
    } catch {
      toast.error('Failed to start call');
    }
  };

  const handleLeaveChannel = async () => {
    if (!activeChannel || activeChannel.is_dm) return;
    try {
      await chat.leaveChannel(activeChannel.id);
      setChannels(prev => prev.filter(c => c.id !== activeChannel.id));
      const remaining = channels.filter(c => c.id !== activeChannel.id);
      setActiveChannel(remaining.length > 0 ? remaining[0] : null);
      toast.success(`Left #${activeChannel.name}`);
    } catch {
      toast.error('Failed to leave channel');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChannel) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace', activeWorkspace.id);
    formData.append('content_type', 'chat_message');
    try {
      const res = await chat.uploadFile(formData);
      const uploaded = unwrapData(res);
      const fileUrl = uploaded?.url || uploaded?.file || file.name;
      await chat.sendMessage({ channel: activeChannel.id, content: fileUrl });
      await loadMessages();
      toast.success('File sent');
    } catch {
      toast.error('Failed to upload file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePinMessage = async (msgId) => {
    try {
      await chat.pinMessage(msgId);
      toast.success('Message pinned');
    } catch {
      toast.error('Failed to pin message');
    }
  };

  const scrollToMessage = (msgId) => {
    setHighlightedMsgId(msgId);
    const el = document.getElementById(`msg-${msgId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightedMsgId(null), 3000);
  };

  const handleDeleteMessage = async (msgId) => {
    if (!confirm('Delete this message?')) return;
    try {
      await chat.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      setThreadReplies(prev => prev.filter(m => m.id !== msgId));
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleReact = async (msgId, emoji) => {
    setShowEmojiPicker(null);
    try {
      await chat.addReaction(msgId, emoji);
      setMessageReactions(prev => {
        const existing = prev[msgId] || [];
        const userReaction = existing.find(r => r.emoji === emoji && r.user === user?.id);
        let next;
        if (userReaction) {
          next = existing.filter(r => !(r.emoji === emoji && r.user === user?.id));
        } else {
          next = [...existing, { emoji, user: user?.id }];
        }
        return { ...prev, [msgId]: next };
      });
    } catch {
      toast.error('Failed to react');
    }
  };

  const openDm = async (dm) => {
    const other = dm.participants?.find(p => p.id !== user?.id) || dm.participants?.[0];
    const name = other?.full_name || [other?.first_name, other?.last_name].filter(Boolean).join(' ') || other?.username || dm.name || 'Direct Message';
    setActiveChannel({ id: dm.id, name, description: 'Direct Message', is_dm: true, dm_user: other });
  };

  const getDmName = (dm) => {
    const other = dm.participants?.find(p => p.id !== user?.id) || dm.participants?.[0];
    return other?.full_name || [other?.first_name, other?.last_name].filter(Boolean).join(' ') || other?.username || dm.name || 'Direct Message';
  };

  const getDmUser = (dm) => {
    return dm.participants?.find(p => p.id !== user?.id) || dm.participants?.[0] || {};
  };

  const joinedIds = new Set(channels.map(c => c.id));
  const filteredJoined = channels.filter(c => c.name?.toLowerCase().includes(channelSearch.toLowerCase()));
  const filteredAll = allChannels.filter(c => !joinedIds.has(c.id) && c.name?.toLowerCase().includes(channelSearch.toLowerCase()));
  const filteredDms = dms.filter(dm => {
    const label = getDmName(dm);
    return label.toLowerCase().includes(channelSearch.toLowerCase());
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const pad = isMobile ? '10px 12px' : '16px 24px';
  const containerH = isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 140px)';

  const ChannelList = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '6px 4px' : '8px 6px' }}>
      {loadingChannels ? (
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}><LoadingSpinner size={16} /></div>
      ) : (
        <>
          {filteredJoined.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>Your Channels</div>
              {filteredJoined.map(ch => (
                  <button key={ch.id} onClick={() => { setThreadMsg(null); setActiveChannel(ch); }}
                    title={ch.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: isMobile ? '10px 8px' : '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', background: activeChannel?.id === ch.id && !threadMsg ? 'var(--brand-bg)' : 'transparent', color: activeChannel?.id === ch.id && !threadMsg ? 'var(--brand)' : 'var(--text3)' }}>
                    <Hash size={13} />
                    <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                </button>
              ))}
            </div>
          )}
          {filteredAll.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>All Channels</div>
              {filteredAll.map(ch => (
                <button key={ch.id} onClick={() => handleJoinChannel(ch)}
                  title={ch.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: isMobile ? '10px 8px' : '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent', color: 'var(--text3)' }}>
                  <Plus size={12} />
                  <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                </button>
              ))}
            </div>
          )}
          {filteredDms.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px', marginTop: 4 }}>DMs</div>
              {filteredDms.map(dm => {
                const dmUser = getDmUser(dm);
                return (
                  <button key={dm.id} onClick={() => { setThreadMsg(null); openDm(dm); }}
                    title={getDmName(dm)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: isMobile ? '10px 8px' : '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', background: activeChannel?.id === dm.id && !threadMsg ? 'var(--brand-bg)' : 'transparent', color: activeChannel?.id === dm.id && !threadMsg ? 'var(--brand)' : 'var(--text3)' }}>
                    <Avatar user={dmUser} size={isMobile ? 24 : 20} />
                    <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDmName(dm)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {filteredJoined.length === 0 && filteredAll.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>No channels found</div>
          )}
        </>
      )}
    </div>
  );

  const EMOJI_LIST = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '💯', '🚀', '✅', '👎', '😮', '🙏'];

  const MessageBubble = ({ msg, isThread = false }) => {
    const sender = msg.sender || msg.user || {};
    const isMe = sender.id === user?.id;
    const replyCount = isThread ? 0 : (replyCounts[msg.id] || 0);
    const maxW = isMobile ? '85%' : '70%';
    const reactions = messageReactions[msg.id] || msg.reactions || [];
    const groupedReactions = reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});
    return (
      <div id={`msg-${msg.id}`} style={{ display: 'flex', gap: 8, marginBottom: 10, flexDirection: isMe ? 'row-reverse' : 'row', background: highlightedMsgId === msg.id ? 'var(--brand-bg)' : 'transparent', borderRadius: 8, padding: highlightedMsgId === msg.id ? '4px 0' : 0, transition: 'background 0.3s' }}>
        <Avatar user={sender} size={isMobile ? 26 : 28} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ maxWidth: maxW, textAlign: isMe ? 'right' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{sender.first_name || sender.username || 'Unknown'}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
          <div style={{ padding: isMobile ? '7px 10px' : '8px 12px', borderRadius: 12, fontSize: isMobile ? 14 : 13, lineHeight: 1.5, background: isMe ? 'var(--brand)' : 'var(--bg3)', color: isMe ? '#fff' : 'var(--text)', borderTopRightRadius: isMe ? 4 : 12, borderTopLeftRadius: isMe ? 12 : 4, wordBreak: 'break-word' }}>
            {msg.content}
          </div>
          {Object.keys(groupedReactions).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              {Object.entries(groupedReactions).map(([emoji, count]) => {
                const iReacted = reactions.some(r => r.emoji === emoji && r.user === user?.id);
                return (
                  <button key={emoji} onClick={() => handleReact(msg.id, emoji)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 10, fontSize: 12, cursor: 'pointer', border: iReacted ? '1px solid var(--brand)' : '1px solid var(--border)', background: iReacted ? 'var(--brand-bg)' : 'var(--bg3)', color: 'var(--text)' }}>
                    <span>{emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start', position: 'relative' }}>
            {!isThread && (
              <button onClick={() => openThread(msg)} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}>
                <Reply size={12} /> Reply
              </button>
            )}
            {!isThread && replyCount > 0 && (
              <button onClick={() => openThread(msg)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px 4px', fontSize: 11 }}>
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
            <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', fontSize: 11 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              title="Add reaction">
              <Smile size={13} />
            </button>
            {isMe && (
              <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', fontSize: 11 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                title="Delete message">
                <Trash2 size={12} />
              </button>
            )}
            {!isThread && (
              <button onClick={() => handlePinMessage(msg.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', fontSize: 11 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                title="Pin message">
                <Pin size={12} />
              </button>
            )}
            {showEmojiPicker === msg.id && (
              <div onClick={e => e.stopPropagation()}
                style={{ position: 'absolute', bottom: '100%', [isMe ? 'right' : 'left']: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, zIndex: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', marginBottom: 4 }}>
                {EMOJI_LIST.map(em => (
                  <button key={em} onClick={() => handleReact(msg.id, em)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, fontSize: 16, lineHeight: 1, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: pad, background: 'var(--bg)', minHeight: '100vh', boxSizing: 'border-box' }}>
      {!isMobile && <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>{t('chat.title', 'Chat')}</h1>}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', height: containerH, overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar */}
        {(!isMobile || showSidebar) && (
          <div style={{ width: isMobile ? '100%' : 260, borderRight: isMobile ? 'none' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: isMobile ? '10px 12px 6px' : '12px 12px 8px', borderBottom: '1px solid var(--border)' }}>
              {isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{t('chat.title', 'Chat')}</h2>
                  <button onClick={() => setShowCreateModal(true)} style={{ background: 'var(--brand)', border: 'none', color: '#fff', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}><Plus size={16} /></button>
                </div>
              )}
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input value={channelSearch} onChange={e => setChannelSearch(e.target.value)} placeholder="Search..."
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: isMobile ? '8px 8px 8px 28px' : '5px 8px 5px 24px', color: 'var(--text)', fontSize: isMobile ? 13 : 11, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Channels</span>
                  <button onClick={() => setShowCreateModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: 2, display: 'flex' }}><Plus size={14} /></button>
                </div>
              )}
            </div>
            <ChannelList />
          </div>
        )}

        {/* Main chat area */}
        {(!isMobile || !showSidebar) && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header */}
            <div style={{ padding: isMobile ? '8px 10px' : '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
              {isMobile && showSidebar === false && (
                <button onClick={() => { setShowSidebar(true); setThreadMsg(null); }} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}>
                  <ChevronLeft size={20} />
                </button>
              )}
              {threadMsg && (
                <button onClick={() => setThreadMsg(null)} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}>
                  <ChevronLeft size={16} />
                </button>
              )}
              {activeChannel?.is_dm && activeChannel?.dm_user ? (
                <Avatar user={activeChannel.dm_user} size={isMobile ? 24 : 28} style={{ flexShrink: 0 }} />
              ) : (
                <Hash size={isMobile ? 14 : 16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <h2 title={threadMsg ? 'Thread' : activeChannel?.name || 'Select a channel'} style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {threadMsg ? `Thread` : activeChannel?.name || 'Select a channel'}
                </h2>
                {!threadMsg && showSearch && activeChannel ? (
                  <div style={{ position: 'relative' }}>
                    <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search messages..." style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--brand)', borderRadius: 6, padding: '4px 8px', color: 'var(--text)', fontSize: 11, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 2 }} />
                    {searchQuery.trim() && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, maxHeight: 260, overflowY: 'auto', zIndex: 30, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', marginTop: 4 }}>
                        {searching ? (
                          <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}><LoadingSpinner size={14} /></div>
                        ) : searchResults.length === 0 ? (
                          <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', padding: 12, margin: 0 }}>No results found</p>
                        ) : (
                          searchResults.map(r => (
                            <button key={r.id} onClick={() => { scrollToMessage(r.id); setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{r.sender?.first_name || r.user?.first_name || 'Unknown'}</span>
                                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content}</p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : !threadMsg && activeChannel?.description && (
                  <p style={{ fontSize: 11, color: 'var(--text3)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeChannel.description}</p>
                )}
                {threadMsg && <p style={{ fontSize: 11, color: 'var(--text3)', margin: '1px 0 0' }}>{threadReplies.length} replies</p>}
              </div>
              {!threadMsg && activeChannel && (
                <button onClick={handleStartCall} title="Start video call" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)', flexShrink: 0 }}>
                  <Video size={15} />
                </button>
              )}
              {!threadMsg && (
                <button onClick={toggleMembers} style={{ width: 32, height: 32, borderRadius: 8, background: showMembers ? 'var(--brand)' : 'var(--bg3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showMembers ? '#fff' : 'var(--text3)', flexShrink: 0 }}>
                  <Users size={15} />
                </button>
              )}
              {!threadMsg && activeChannel && (
                <button onClick={() => { setShowSearch(prev => !prev); setSearchQuery(''); setSearchResults([]); }} title="Search messages" style={{ width: 32, height: 32, borderRadius: 8, background: showSearch ? 'var(--brand)' : 'var(--bg3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showSearch ? '#fff' : 'var(--text3)', flexShrink: 0 }}>
                  <Search size={15} />
                </button>
              )}
              {!threadMsg && activeChannel && !activeChannel.is_dm && (
                <button onClick={handleLeaveChannel} title="Leave channel" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                  <LogOut size={15} />
                </button>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '8px 10px' : '12px 16px' }} onClick={() => setShowEmojiPicker(null)}>
                {!activeChannel ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)' }}>
                    <MessageSquare size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p style={{ fontSize: 13 }}>Select a channel to start chatting</p>
                  </div>
                ) : loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><LoadingSpinner size={20} /></div>
                ) : threadMsg ? (
                  <div>
                    <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 12, borderLeft: '3px solid var(--brand)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Avatar user={threadMsg.sender || threadMsg.user || {}} size={20} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{(threadMsg.sender || threadMsg.user || {}).first_name || 'Unknown'}</span>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{threadMsg.created_at ? new Date(threadMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{threadMsg.content}</p>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                      {loadingThread ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><LoadingSpinner size={16} /></div>
                      ) : threadReplies.length === 0 ? (
                        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No replies yet</p>
                      ) : (
                        threadReplies.map((reply, i) => <MessageBubble key={reply.id || i} msg={reply} isThread />)
                      )}
                      <div ref={threadEndRef} />
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)' }}>
                    <Hash size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>No messages yet</p>
                    <p style={{ fontSize: 11 }}>Send the first message to start the conversation</p>
                  </div>
                ) : (
                  <div>
                    {messages.map((msg, i) => <MessageBubble key={msg.id || i} msg={msg} />)}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Members panel — overlay on mobile, side panel on desktop */}
              {showMembers && !threadMsg && (
                <div style={isMobile ? {
                  position: 'absolute', top: 0, right: 0, bottom: 0, width: 260, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: '-4px 0 16px rgba(0,0,0,0.3)'
                } : {
                  width: 220, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'var(--bg2)'
                }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Members ({members.length})</span>
                    <button onClick={() => setShowMembers(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2, display: 'flex' }}><X size={14} /></button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
                    {members.length === 0 ? (
                      <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No members found</p>
                    ) : (
                      members.map((m, i) => {
                        const isOnline = onlineIds.has(m.id);
                        const name = m.first_name ? `${m.first_name} ${m.last_name || ''}`.trim() : m.username || m.email;
                        return (
                          <div key={m.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, marginBottom: 2 }}>
                            <div style={{ position: 'relative' }}>
                              <Avatar user={m} size={28} />
                              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: isOnline ? 'var(--success)' : 'var(--bg3)', border: '2px solid var(--bg2)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                              <p style={{ fontSize: 10, color: isOnline ? 'var(--success)' : 'var(--text3)', margin: 0 }}>{isOnline ? 'Online' : 'Offline'}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {!threadMsg ? (
              <form onSubmit={handleSend} style={{ padding: isMobile ? '8px 10px' : '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!activeChannel} title="Attach file" style={{ background: 'none', border: 'none', color: activeChannel ? 'var(--text3)' : 'var(--text3)', cursor: activeChannel ? 'pointer' : 'default', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: activeChannel ? 1 : 0.5 }}
                  onMouseEnter={e => { if (activeChannel) e.currentTarget.style.color = 'var(--brand)'; }}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                  <Paperclip size={isMobile ? 18 : 16} />
                </button>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={activeChannel ? `Message #${activeChannel.name}...` : 'Select a channel'}
                  disabled={!activeChannel || sending}
                  style={{ ...inputStyle, flex: 1, opacity: activeChannel ? 1 : 0.5, fontSize: isMobile ? 15 : 13, padding: isMobile ? '10px 12px' : '8px 12px' }}
                  inputMode="text" autoComplete="off" />
                <button type="submit" disabled={!newMsg.trim() || !activeChannel || sending}
                  style={{ background: newMsg.trim() && activeChannel ? 'var(--brand)' : 'var(--bg3)', border: 'none', borderRadius: 8, padding: isMobile ? '10px' : '8px 12px', color: newMsg.trim() && activeChannel ? '#fff' : 'var(--text3)', cursor: newMsg.trim() && activeChannel ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  {sending ? <LoadingSpinner size={14} /> : <Send size={isMobile ? 18 : 15} />}
                  {!isMobile && (sending ? 'Sending...' : 'Send')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleThreadReply} style={{ padding: isMobile ? '8px 10px' : '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={threadReply} onChange={e => setThreadReply(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleThreadReply(e); } }}
                  placeholder="Reply to thread..." autoFocus
                  style={{ ...inputStyle, flex: 1, fontSize: isMobile ? 15 : 13, padding: isMobile ? '10px 12px' : '8px 12px' }}
                  inputMode="text" autoComplete="off" />
                <button type="submit" disabled={!threadReply.trim() || sendingReply}
                  style={{ background: threadReply.trim() ? 'var(--brand)' : 'var(--bg3)', border: 'none', borderRadius: 8, padding: isMobile ? '10px' : '8px 12px', color: threadReply.trim() ? '#fff' : 'var(--text3)', cursor: threadReply.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  {sendingReply ? <LoadingSpinner size={14} /> : <Send size={isMobile ? 18 : 15} />}
                  {!isMobile && 'Reply'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Create channel modal */}
      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: isMobile ? 16 : 24, width: 360, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Create Channel</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateChannel}>
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Name</span>
                <input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g. general" autoFocus style={{ ...inputStyle, fontSize: isMobile ? 15 : 13 }} />
              </label>
              <label style={{ display: 'block', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Type</span>
                <select value={createType} onChange={e => setCreateType(e.target.value)} style={{ ...inputStyle, fontSize: isMobile ? 15 : 13 }}>
                  <option value="group">Group</option>
                  <option value="workspace">Workspace</option>
                </select>
              </label>
              <button type="submit" disabled={!createName.trim() || creating}
                style={{ width: '100%', background: createName.trim() ? 'var(--brand)' : 'var(--bg3)', border: 'none', borderRadius: 8, padding: '10px', color: createName.trim() ? '#fff' : 'var(--text3)', fontSize: 13, fontWeight: 600, cursor: createName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                {creating ? 'Creating...' : 'Create Channel'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
