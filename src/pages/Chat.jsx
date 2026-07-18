import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import api, { chat, ws as wsApi, presence, calls, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Hash, Send, Plus, MessageSquare, X, Users, Search, Reply, ChevronLeft, Video, Menu } from 'lucide-react';
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
      setMessages(unwrapData(res));
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
          } else {
            setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
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
      setThreadReplies(unwrapData(res));
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

  const openDm = async (dm) => {
    const name = dm.name || dm.participants?.map(p => p.first_name || p.username).join(', ') || 'Direct Message';
    setActiveChannel({ id: dm.id, name, description: 'Direct Message', is_dm: true });
  };

  const joinedIds = new Set(channels.map(c => c.id));
  const filteredJoined = channels.filter(c => c.name?.toLowerCase().includes(channelSearch.toLowerCase()));
  const filteredAll = allChannels.filter(c => !joinedIds.has(c.id) && c.name?.toLowerCase().includes(channelSearch.toLowerCase()));
  const filteredDms = dms.filter(dm => {
    const label = dm.name || dm.participants?.map(p => p.first_name || p.username).join(', ') || '';
    return label.toLowerCase().includes(channelSearch.toLowerCase());
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const countReplies = (msgId) => messages.filter(m => m.parent === msgId).length;

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
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>Your Channels</div>
              {filteredJoined.map(ch => (
                <button key={ch.id} onClick={() => { setThreadMsg(null); setActiveChannel(ch); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: isMobile ? '10px 8px' : '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', background: activeChannel?.id === ch.id && !threadMsg ? 'var(--brand-bg)' : 'transparent', color: activeChannel?.id === ch.id && !threadMsg ? 'var(--brand)' : 'var(--text3)' }}>
                  <Hash size={13} />
                  <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                </button>
              ))}
            </div>
          )}
          {filteredAll.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>All Channels</div>
              {filteredAll.map(ch => (
                <button key={ch.id} onClick={() => handleJoinChannel(ch)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: isMobile ? '10px 8px' : '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent', color: 'var(--text3)' }}>
                  <Plus size={12} />
                  <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                </button>
              ))}
            </div>
          )}
          {filteredDms.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px', marginTop: 4 }}>Direct Messages</div>
              {filteredDms.map(dm => (
                <button key={dm.id} onClick={() => { setThreadMsg(null); openDm(dm); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: isMobile ? '10px 8px' : '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', background: activeChannel?.id === dm.id && !threadMsg ? 'var(--brand-bg)' : 'transparent', color: activeChannel?.id === dm.id && !threadMsg ? 'var(--brand)' : 'var(--text3)' }}>
                  <MessageSquare size={13} />
                  <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dm.name || dm.participants?.map(p => p.first_name || p.username).join(', ') || 'Direct Message'}
                  </span>
                </button>
              ))}
            </div>
          )}
          {filteredJoined.length === 0 && filteredAll.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>No channels found</div>
          )}
        </>
      )}
    </div>
  );

  const MessageBubble = ({ msg, isThread = false }) => {
    const sender = msg.sender || msg.user || {};
    const isMe = sender.id === user?.id;
    const replyCount = isThread ? 0 : countReplies(msg.id);
    const maxW = isMobile ? '85%' : '70%';
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexDirection: isMe ? 'row-reverse' : 'row' }}>
        <Avatar user={sender} size={isMobile ? 26 : 28} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ maxWidth: maxW, textAlign: isMe ? 'right' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{sender.first_name || sender.username || 'Unknown'}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
          <div style={{ padding: isMobile ? '7px 10px' : '8px 12px', borderRadius: 12, fontSize: isMobile ? 14 : 13, lineHeight: 1.5, background: isMe ? 'var(--brand)' : 'var(--bg3)', color: isMe ? '#fff' : 'var(--text)', borderTopRightRadius: isMe ? 4 : 12, borderTopLeftRadius: isMe ? 12 : 4, wordBreak: 'break-word' }}>
            {msg.content}
          </div>
          {!isThread && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <button onClick={() => openThread(msg)} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}>
                <Reply size={12} /> Reply
              </button>
              {replyCount > 0 && (
                <button onClick={() => openThread(msg)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px 4px', fontSize: 11 }}>
                  {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          )}
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
              <Hash size={isMobile ? 14 : 16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {threadMsg ? `Thread` : activeChannel?.name || 'Select a channel'}
                </h2>
                {!threadMsg && activeChannel?.description && <p style={{ fontSize: 11, color: 'var(--text3)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeChannel.description}</p>}
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
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '8px 10px' : '12px 16px' }}>
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
                <input value={threadReply} onChange={e => setThreadReply(e.target.value)}
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
