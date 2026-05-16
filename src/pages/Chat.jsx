import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { chat } from '../services/api';
import { 
  Hash, Lock, Search, Phone, Video, MoreVertical, 
  Paperclip, Send, Smile, Plus, MessageCircle, X,
  ChevronDown, UserPlus, Info
} from 'lucide-react';
import Avatar from '../components/common/Avatar';
import CreateChannelModal from '../components/chat/CreateChannelModal';
import api from '../services/api';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import useWebSocket from '../hooks/useWebSocket';



export default function Chat() {
  const { user, theme, activeWorkspace, onlineUsers } = useStore();
  const [channels, setChannels] = useState([]);
  const [dms, setDms] = useState([]);
  
  const [activeTab, setActiveTab] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = async (tabId, pageNum = 1) => {
    if (!tabId) return;
    try {
      const res = await chat.messages({ channel: tabId, page: pageNum });
      const history = res.data?.data || res.data?.results || res.data || [];
      // Assuming backend returns history from oldest to newest, or newest to oldest. 
      // Typically history comes newest to oldest. We want them oldest to newest in UI.
      const formatted = Array.isArray(history) ? history.reverse() : [];
      
      if (pageNum === 1) {
        setMessages(formatted);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
      } else {
        setMessages(prev => [...formatted, ...prev]);
      }
      
      setHasMore(res.data?.next !== null);
      setPage(pageNum);
    } catch (err) {
      console.warn('Failed to load chat history:', err);
    }
  };
  
  const [input, setInput] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const scrollRef = useRef(null);
  const threadScrollRef = useRef(null);
  const observerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Load Channels & DMs when activeWorkspace changes
  useEffect(() => {
    const fetchData = async () => {
      if (!activeWorkspace) return;
      try {
        const [chData, dmData] = await Promise.all([
          api.get(`/channels/?workspace=${activeWorkspace.id}`),
          chat.dms()
        ]);
        const channelsData = chData.data.data || chData.data || [];
        const dmsData = dmData.data.data || dmData.data || [];
        
        setChannels(channelsData);
        setDms(dmsData);
        
        if (channelsData.length > 0 && !activeTab) {
          setActiveTab(channelsData[0].id);
        }
      } catch (err) {
        console.warn('Failed to fetch chat data:', err);
      }
    };
    fetchData();
  }, [activeWorkspace]);

  // Window Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mark channel as read when activeTab changes
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setTypingUsers([]);
    loadMessages(activeTab, 1);
    chat.markRead(activeTab).catch(() => {});
  }, [activeTab]);

  const { send, status } = useWebSocket(`/ws/chat/${activeTab}/`, {
    enabled: !!activeTab,
    onMessage: (data) => {
      switch (data.type) {
        case 'chat_message':
          setMessages(prev => [...prev, data]);
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          break;
        case 'typing':
          if (data.is_typing) {
            if (!typingUsers.includes(data.username)) {
              setTypingUsers(prev => [...prev, data.username]);
            }
          } else {
            setTypingUsers(prev => prev.filter(u => u !== data.username));
          }
          break;
        case 'message_update_broadcast':
          setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, content: data.message, edited_at: data.edited_at } : m));
          break;
        case 'reaction':
          setMessages(prev => prev.map(m => {
            if (m.id === data.message_id) {
              const existing = m.reactions?.find(r => r.emoji === data.emoji);
              let newReactions = m.reactions || [];
              if (existing) {
                newReactions = newReactions.map(r => r.emoji === data.emoji ? { ...r, count: r.count + 1 } : r);
              } else {
                newReactions.push({ emoji: data.emoji, count: 1 });
              }
              return { ...m, reactions: newReactions };
            }
            return m;
          }));
          break;
        case 'message_delete_broadcast':
          setMessages(prev => prev.filter(m => m.id !== data.message_id));
          break;
      }
    }
  });

  const handleInput = (e) => {
    setInput(e.target.value);
    
    // Broadcast typing event
    send({ type: 'typing', is_typing: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      send({ type: 'typing', is_typing: false });
    }, 2000);
  };

  const sendMessage = (e, isThread = false) => {
    e.preventDefault();
    const text = isThread ? e.target.elements.threadInput.value : input;
    if (!text.trim()) return;

    const msg = {
      message: text,
      type: 'chat_message',
      thread_id: isThread ? activeThread.id : null
    };

    const sent = editingMessage 
      ? send({
          type: 'edit_message',
          message_id: editingMessage.id,
          message: text
        })
      : send(msg);

    if (sent) {
      if (editingMessage) setEditingMessage(null);
    } else {
      // Fallback local UI update if WS is down
      const localMsg = {
        id: Date.now(),
        user: { first_name: user?.first_name || 'You', last_name: user?.last_name || '', avatar: user?.avatar },
        content: text,
        timestamp: new Date().toISOString(),
        reactions: [],
        thread_id: isThread ? activeThread.id : null,
        replyCount: 0
      };
      setMessages(prev => [...prev, localMsg]);
    }

    if (isThread) {
      e.target.reset();
      setTimeout(() => threadScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else {
      setInput('');
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const addReaction = async (msgId, emoji) => {
    // Optimistic UI Update
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions || [];
        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) {
          return { ...m, reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
        }
        return { ...m, reactions: [...reactions, { emoji, count: 1 }] };
      }
      return m;
    }));
    
    // API Call
    try {
      await chat.addReaction(msgId, emoji);
    } catch (err) {
      console.warn("Backend reaction failed, but UI updated optimistically.");
    }
  };

  const activeChannel = channels.find(c => c.id === activeTab);
  const activeDM = dms.find(d => d.id === activeTab);
  const headerName = activeChannel ? `#${activeChannel.name}` : activeDM?.name || 'General';

  // --- Components ---

  const SidebarItem = ({ id, name, icon, unread, isActive }) => (
    <div 
      onClick={() => { setActiveTab(id); if (isMobile) setShowSidebar(false); setActiveThread(null); }}
      className={`flex items-center justify-between px-4 py-3 mx-2 rounded-2xl cursor-pointer transition-all duration-200 group
        ${isActive ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-text-tertiary hover:bg-white/5 hover:text-white'}
      `}
    >
      <div className="flex items-center gap-3 truncate">
        <span className={`${isActive ? 'text-white' : 'text-text-tertiary'} group-hover:text-white transition-colors`}>{icon}</span>
        <span className={`truncate text-sm font-black tracking-tight`}>{name}</span>
      </div>
      {unread > 0 && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-brand' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
          {unread}
        </span>
      )}
    </div>
  );

  const MessageBubble = ({ m, index, isThreadItem = false }) => (
    <div 
      ref={index === 0 ? topMessageRef : null}
      className="flex gap-4 group hover:bg-black/5 dark:hover:bg-white/5 p-2 md:px-6 -mx-2 md:-mx-6 rounded-lg transition-colors relative"
    >
      {/* Hover Actions */}
      <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#121b33] border border-gray-200 dark:border-white/10 shadow-xl rounded-xl flex items-center p-1 z-10">
        <button onClick={() => addReaction(m.id, '👍')} className="p-2 hover:bg-white/5 rounded-lg text-text-tertiary hover:text-white" title="React"><Smile size={16} /></button>
        {m.user?.id === user?.id && (
          <>
            <button onClick={() => { setEditingMessage(m); setInput(m.content); }} className="p-2 hover:bg-white/5 rounded-lg text-text-tertiary hover:text-white" title="Edit"><Plus size={16} className="rotate-45" /></button>
            <button 
              onClick={() => {
                send({ type: 'delete_message', message_id: m.id });
              }} 
              className="p-2 hover:bg-rose-500/10 rounded-lg text-text-tertiary hover:text-rose-500" 
              title="Delete"
            >
              <X size={16} />
            </button>
          </>
        )}
        {!isThreadItem && (
          <button onClick={() => setActiveThread(m)} className="p-2 hover:bg-white/5 rounded-lg text-text-tertiary hover:text-white" title="Reply"><MessageCircle size={16} /></button>
        )}
      </div>

      <Avatar user={m.user} size={isMobile ? 32 : 40} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{m.user?.first_name} {m.user?.last_name}</span>
          <span className="text-[10px] font-bold text-text-tertiary opacity-60">{new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        <div className="text-sm text-gray-800 dark:text-text-secondary leading-relaxed break-words">
          {m.content}
        </div>

        {/* Reactions */}
        {(m.reactions?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {m.reactions.map(r => (
              <button 
                key={r.emoji} 
                onClick={() => addReaction(m.id, r.emoji)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
              >
                <span className="text-[13px]">{r.emoji}</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread Info */}
        {!isThreadItem && m.replyCount > 0 && (
          <div 
            onClick={() => setActiveThread(m)}
            className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline"
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-[#0b1429]"></div>
              <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white dark:border-[#0b1429]"></div>
            </div>
            {m.replyCount} {m.replyCount === 1 ? 'reply' : 'replies'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex h-full w-full overflow-hidden relative bg-white dark:bg-[#0b1429]`}>
      
      {/* Secondary Sidebar (Channels & DMs) */}
      <div className={`
        ${isMobile && !showSidebar ? 'hidden' : 'flex'} 
        ${isMobile ? 'absolute inset-0 z-20' : 'relative w-[260px] border-r'}
        flex-col bg-gray-50 dark:bg-[#060b18] border-gray-200 dark:border-gray-800 transition-all
      `}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-black text-lg text-gray-900 dark:text-white truncate">Remote Team HQ</h2>
          {isMobile && (
            <button onClick={() => setShowSidebar(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
          <div className="flex items-center justify-between px-4 mb-2 group">
            <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channels</span>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mb-6">
            {channels.map(c => (
              <SidebarItem 
                key={c.id} id={c.id} name={c.name} unread={c.unread} isActive={activeTab === c.id}
                icon={c.type === 'private' ? <Lock size={16} /> : <Hash size={16} />}
              />
            ))}
          </div>

          <div className="flex items-center justify-between px-4 mb-2 group">
            <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Direct Messages</span>
            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100"><Plus size={16} /></button>
          </div>
          <div>
            {dms.map(d => {
              const isOnline = onlineUsers.includes(d.id);
              return (
                <SidebarItem 
                  key={d.id} id={d.id} name={d.name} unread={d.unread} isActive={activeTab === d.id}
                  icon={
                    <Avatar user={d} size={24} status={isOnline ? 'online' : 'offline'} />
                  }
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0b1429] ${isMobile && showSidebar ? 'hidden' : 'flex'}`}>
        
        {/* Chat Header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0b1429]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4 truncate">
            {isMobile && (
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => setShowSidebar(true)} 
                className="font-black !px-3"
              >
                <Hash size={16} />
              </Button>
            )}
            <div className="font-black text-lg text-gray-900 dark:text-white truncate flex items-center gap-2 tracking-tight">
              {headerName}
            </div>
          </div>

          <div className="flex items-center gap-2 text-text-tertiary">
            <Button variant="icon" size="sm"><Phone size={18} /></Button>
            <Button variant="icon" size="sm"><Video size={18} /></Button>
            <div className="w-px h-6 bg-white/5 mx-2 hidden md:block"></div>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input type="text" placeholder="Search message..." className="pl-10 pr-4 py-2 bg-white/2 border border-white/5 focus:border-brand/50 rounded-xl text-xs outline-none transition-all w-48 focus:w-64 text-white" />
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col gap-6">
          
          {hasMore && (
            <div className="text-center text-xs font-bold text-gray-400 uppercase">Loading history...</div>
          )}

          {!hasMore && (
            <div className="mt-auto mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
                {activeChannel ? <Hash size={32} className="text-gray-400" /> : <Lock size={32} className="text-gray-400" />}
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Welcome to {headerName}!</h1>
              <p className="text-gray-500 dark:text-gray-400 text-[15px]">This is the start of the <strong className="text-gray-700 dark:text-gray-300">{headerName}</strong> channel.</p>
            </div>
          )}

          {messages.filter(m => !m.thread_id).map((m, index) => (
            <MessageBubble key={m.id || index} m={m} index={index} />
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-6 py-1 text-xs text-gray-500 font-medium italic">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 md:p-6 pt-0 pb-[env(safe-area-inset-bottom,16px)]">
          <form onSubmit={e => sendMessage(e, false)} className="relative border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm focus-within:border-gray-400 dark:focus-within:border-gray-500 focus-within:shadow-md transition-all">
            <textarea 
              rows="1"
              value={input}
              onChange={handleInput}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e, false);
                }
              }}
              placeholder={`Message ${headerName}`}
              className="w-full bg-transparent p-3 pb-12 outline-none text-[15px] text-gray-900 dark:text-white resize-none custom-scrollbar"
              style={{ minHeight: '80px', maxHeight: '300px' }}
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button type="button" className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"><Plus size={18} /></button>
                <button type="button" className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"><Paperclip size={18} /></button>
                <button type="button" className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"><Smile size={18} /></button>
              </div>
              <button 
                type="submit" 
                disabled={!input.trim()}
                className={`p-1.5 rounded-md transition-colors ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}
              >
                <Send size={18} className={input.trim() ? '' : 'opacity-50'} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Thread Sidebar (Right) */}
      {activeThread && (
        <div className={`
          ${isMobile ? 'absolute inset-0 z-30' : 'w-[350px] border-l'}
          flex flex-col bg-white dark:bg-[#0b1429] border-gray-200 dark:border-gray-800 shadow-xl transition-all
        `}>
          <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#060b18]">
            <div className="font-bold text-[15px] text-gray-900 dark:text-white flex items-center gap-2">
              Thread <span className="text-gray-500 font-normal">#general</span>
            </div>
            <button onClick={() => setActiveThread(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md text-gray-500">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
            <MessageBubble m={activeThread} isThreadItem={true} />
            
            <div className="flex items-center my-2">
              <span className="text-[13px] font-semibold text-gray-500">{activeThread.replyCount || 0} replies</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800 ml-3"></div>
            </div>

            {messages.filter(m => m.thread_id === activeThread.id).map((m, i) => (
              <MessageBubble key={m.id || i} m={m} isThreadItem={true} />
            ))}
            <div ref={threadScrollRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#060b18]">
            <form onSubmit={e => sendMessage(e, true)} className="relative border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden focus-within:border-blue-500 transition-all">
              <input 
                name="threadInput"
                placeholder="Reply in thread..."
                className="w-full bg-transparent py-2.5 pl-3 pr-10 outline-none text-[14px] text-gray-900 dark:text-white"
                autoComplete="off"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      <CreateChannelModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onCreated={(newCh) => {
          setChannels(prev => [...prev, newCh]);
          setActiveTab(newCh.id);
        }}
      />
    </div>
  );
}
