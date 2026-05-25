import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff,
  Users, MessageSquare, Settings, Copy, Link, Clock, Maximize2,
  Volume2, VolumeX, MoreVertical, Hand, Smile
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_PARTICIPANTS = [
  { id: 1, name: 'You', initials: 'YO', color: '#3366ff', muted: false, videoOff: false, speaking: true },
  { id: 2, name: 'Alice Martin', initials: 'AM', color: '#10b981', muted: true, videoOff: false, speaking: false },
  { id: 3, name: 'Bob Chen', initials: 'BC', color: '#f59e0b', muted: false, videoOff: true, speaking: false },
  { id: 4, name: 'Diana Ross', initials: 'DR', color: '#8b5cf6', muted: true, videoOff: true, speaking: false },
];

function ParticipantTile({ p, large = false }) {
  return (
    <div style={{
      position: 'relative', borderRadius: large ? 16 : 12, overflow: 'hidden',
      background: '#1a1a2e', border: p.speaking ? '2px solid #3366ff' : '2px solid #2a2a4a',
      aspectRatio: large ? '16/9' : '4/3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border-color 0.2s',
    }}>
      {p.videoOff ? (
        <div style={{
          width: large ? 80 : 48, height: large ? 80 : 48, borderRadius: '50%',
          background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: large ? 28 : 18, fontWeight: 800, color: '#fff',
        }}>
          {p.initials}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${p.color}22, #1a1a2e)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: large ? 80 : 48, height: large ? 80 : 48, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: large ? 28 : 18, fontWeight: 800, color: '#fff' }}>
            {p.initials}
          </div>
        </div>
      )}
      {/* Name bar */}
      <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 6 }}>
          {p.name}
        </span>
        {p.muted && <MicOff size={12} color="#ef4444" />}
      </div>
      {p.speaking && (
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #3366ff', borderRadius: large ? 14 : 10, pointerEvents: 'none', animation: 'speaking-pulse 1s ease-in-out infinite' }} />
      )}
    </div>
  );
}

export default function VideoCall() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || Math.random().toString(36).slice(2, 8).toUpperCase();

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Alice Martin', text: 'Can everyone hear me?', time: '10:00' },
    { id: 2, sender: 'You', text: 'Yes, loud and clear!', time: '10:01' },
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/call?room=${roomId}`);
    toast.success('Meeting link copied!');
  };

  const endCall = () => {
    toast('Call ended', { icon: '📞' });
    navigate(-1);
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(m => [...m, { id: Date.now(), sender: 'You', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d1a', color: '#fff',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes speaking-pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'speaking-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>RemoteTeam Meeting</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: 20 }}>
            <Clock size={12} color="#aaa" />
            <span style={{ fontSize: 13, color: '#aaa', fontFamily: 'monospace' }}>{formatDuration(duration)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#aaa' }}>Room: <strong style={{ color: '#fff' }}>{roomId}</strong></span>
          <button onClick={copyLink} style={{ background: 'rgba(51,102,255,0.15)', border: '1px solid rgba(51,102,255,0.3)', color: '#3366ff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <Link size={14} /> Copy Link
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video grid */}
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Featured participant */}
          <div style={{ flex: 1 }}>
            <ParticipantTile p={MOCK_PARTICIPANTS[0]} large />
          </div>
          {/* Other participants */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {MOCK_PARTICIPANTS.slice(1).map(p => (
              <ParticipantTile key={p.id} p={p} />
            ))}
          </div>
        </div>

        {/* Side panel */}
        {(chatOpen || participantsOpen) && (
          <div style={{ width: 300, background: 'rgba(255,255,255,0.04)', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {[{ key: 'chat', label: 'Chat' }, { key: 'participants', label: `Participants (${MOCK_PARTICIPANTS.length})` }].map(tab => (
                <button key={tab.key} onClick={() => { setChatOpen(tab.key === 'chat'); setParticipantsOpen(tab.key === 'participants'); }} style={{ flex: 1, padding: '12px 8px', background: 'none', border: 'none', cursor: 'pointer', color: (chatOpen && tab.key === 'chat') || (participantsOpen && tab.key === 'participants') ? '#3366ff' : '#aaa', fontSize: 13, fontWeight: 600, borderBottom: (chatOpen && tab.key === 'chat') || (participantsOpen && tab.key === 'participants') ? '2px solid #3366ff' : '2px solid transparent' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {chatOpen && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: msg.sender === 'You' ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: 11, color: '#666' }}>{msg.sender} • {msg.time}</span>
                      <div style={{ background: msg.sender === 'You' ? '#3366ff' : 'rgba(255,255,255,0.08)', padding: '8px 12px', borderRadius: msg.sender === 'You' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', fontSize: 13, maxWidth: '85%' }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendChat} style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Message..." style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }} />
                  <button type="submit" style={{ background: '#3366ff', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Send</button>
                </form>
              </>
            )}

            {participantsOpen && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {MOCK_PARTICIPANTS.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{p.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      {p.speaking && <div style={{ fontSize: 11, color: '#3366ff' }}>Speaking</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.muted ? <MicOff size={14} color="#ef4444" /> : <Mic size={14} color="#10b981" />}
                      {p.videoOff ? <VideoOff size={14} color="#f59e0b" /> : <Video size={14} color="#10b981" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 24px', background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { icon: muted ? MicOff : Mic, label: muted ? 'Unmute' : 'Mute', action: () => setMuted(m => !m), active: muted, danger: muted },
          { icon: videoOff ? VideoOff : Video, label: videoOff ? 'Start Video' : 'Stop Video', action: () => setVideoOff(v => !v), active: videoOff, danger: videoOff },
          { icon: sharing ? MonitorOff : Monitor, label: sharing ? 'Stop Share' : 'Share Screen', action: () => { setSharing(s => !s); toast(sharing ? 'Screen share stopped' : 'Screen sharing started', { icon: '🖥️' }); }, active: sharing },
          { icon: MessageSquare, label: 'Chat', action: () => { setChatOpen(o => !o); setParticipantsOpen(false); }, active: chatOpen },
          { icon: Users, label: 'Participants', action: () => { setParticipantsOpen(o => !o); setChatOpen(false); }, active: participantsOpen },
          { icon: Hand, label: 'Raise Hand', action: () => toast('Hand raised!', { icon: '✋' }) },
        ].map(({ icon: Icon, label, action, active, danger }) => (
          <button key={label} onClick={action} title={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: danger ? 'rgba(239,68,68,0.15)' : active ? 'rgba(51,102,255,0.15)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : active ? 'rgba(51,102,255,0.3)' : 'rgba(255,255,255,0.12)'}`,
            color: danger ? '#ef4444' : active ? '#3366ff' : '#fff',
            borderRadius: 12, padding: '12px 16px', cursor: 'pointer', minWidth: 70,
            transition: 'all 0.15s',
          }}>
            <Icon size={20} />
            <span style={{ fontSize: 11 }}>{label}</span>
          </button>
        ))}

        {/* End call */}
        <button onClick={endCall} style={{ background: '#ef4444', border: 'none', borderRadius: 12, padding: '14px 28px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
          <PhoneOff size={20} /> End Call
        </button>
      </div>
    </div>
  );
}
