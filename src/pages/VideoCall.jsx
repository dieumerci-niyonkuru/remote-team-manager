/**
 * VideoCall.jsx — Full WebRTC peer-to-peer video/audio calling
 * Uses the signaling server at /ws/call/{roomId}/
 * Supports N-way calls, screen sharing, mute, camera toggle, in-call chat.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff,
  Users, MessageSquare, Copy, Link, Clock, Hand,
  Maximize2, Minimize2, Settings, Volume2, VolumeX,
  Wifi, WifiOff, AlertTriangle, CheckCircle, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── STUN servers (public Google STUN) ──────────────────────────────────────
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

// ─── helpers ────────────────────────────────────────────────────────────────
function formatDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase() || '??';
}

const COLORS = ['#3366ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
function colorForUser(id) {
  return COLORS[Math.abs(id || 0) % COLORS.length];
}

// ─── VideoTile ───────────────────────────────────────────────────────────────
function VideoTile({ participant, large = false, isLocal = false }) {
  const videoRef = useRef(null);
  const { stream, muted: peerMuted, videoOff, displayName, userId } = participant;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const color = colorForUser(userId);
  const initials = getInitials(displayName);

  return (
    <div style={{
      position: 'relative', borderRadius: large ? 16 : 12, overflow: 'hidden',
      background: '#0d1025',
      border: participant.speaking
        ? `2px solid ${color}`
        : '2px solid rgba(255,255,255,0.08)',
      aspectRatio: large ? '16/9' : '4/3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border-color 0.2s',
      flexShrink: 0,
    }}>
      {/* Video element */}
      {!videoOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: large ? 80 : 52, height: large ? 80 : 52,
          borderRadius: '50%', background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: large ? 30 : 20, fontWeight: 800, color: '#fff',
          boxShadow: `0 0 0 4px ${color}33`,
        }}>
          {initials}
        </div>
      )}

      {/* Speaking ring */}
      {participant.speaking && (
        <div style={{
          position: 'absolute', inset: 0,
          border: `2px solid ${color}`,
          borderRadius: large ? 14 : 10,
          pointerEvents: 'none',
          animation: 'speakPulse 1.2s ease-in-out infinite',
        }} />
      )}

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
        padding: '12px 10px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
          {isLocal ? 'You' : displayName}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {peerMuted && <MicOff size={12} color="#ef4444" />}
          {videoOff && <VideoOff size={12} color="#f59e0b" />}
          {isLocal && <span style={{ fontSize: 10, color: '#aaa' }}>local</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function VideoCall() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useStore();

  const roomId = searchParams.get('room') || Math.random().toString(36).slice(2, 8).toUpperCase();

  // ── Local media state ────────────────────────────────────────────────────
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [sidePanel, setSidePanel] = useState(null); // 'chat' | 'participants' | null
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [connectionState, setConnectionState] = useState('connecting');
  const [mediaError, setMediaError] = useState(null);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const peersRef = useRef({}); // { [userId]: RTCPeerConnection }
  const remoteStreamsRef = useRef({}); // { [userId]: MediaStream }

  // ── Participants state ────────────────────────────────────────────────────
  const [localParticipant, setLocalParticipant] = useState({
    userId: user?.id,
    displayName: user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : (user?.username || 'You'),
    stream: null,
    muted: false,
    videoOff: false,
    speaking: false,
  });
  const [remoteParticipants, setRemoteParticipants] = useState([]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── getUserMedia ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setLocalParticipant(p => ({ ...p, stream }));
        toast.success('Camera and microphone ready', { icon: '🎥' });
      } catch (err) {
        console.error('getUserMedia failed:', err);
        setMediaError(err.message);
        // Try audio-only fallback
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = audioStream;
          setLocalParticipant(p => ({ ...p, stream: audioStream, videoOff: true }));
          setVideoOff(true);
          toast('Audio-only mode — camera unavailable', { icon: '🎤' });
        } catch {
          toast.error('Could not access microphone or camera');
        }
      }
    })();

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── WebSocket + WebRTC signaling ─────────────────────────────────────────
  const createPeerConnection = useCallback((targetUserId, targetDisplayName) => {
    if (peersRef.current[targetUserId]) return peersRef.current[targetUserId];

    const pc = new RTCPeerConnection(ICE_CONFIG);
    peersRef.current[targetUserId] = pc;

    // Add our local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE candidates → send to signaling
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          target_user_id: targetUserId,
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        }));
      }
    };

    // Remote track → display
    pc.ontrack = ({ streams }) => {
      const stream = streams[0];
      remoteStreamsRef.current[targetUserId] = stream;
      setRemoteParticipants(prev => {
        const existing = prev.find(p => p.userId === targetUserId);
        if (existing) {
          return prev.map(p => p.userId === targetUserId ? { ...p, stream } : p);
        }
        return [...prev, {
          userId: targetUserId,
          displayName: targetDisplayName || `User ${targetUserId}`,
          stream,
          muted: false,
          videoOff: false,
          speaking: false,
        }];
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${targetUserId} state: ${pc.connectionState}`);
    };

    return pc;
  }, []);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = import.meta.env.PROD ? window.location.host : 'localhost:8000';
    const token = localStorage.getItem('rtm_access');
    const wsUrl = `${protocol}://${host}/ws/call/${roomId}/?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('connected');
      console.log('[Call] Signaling WS connected');
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
    };

    ws.onerror = () => {
      setConnectionState('error');
      toast.error('Signaling connection failed');
    };

    ws.onmessage = async (evt) => {
      let data;
      try { data = JSON.parse(evt.data); } catch { return; }

      const { type, from_user_id, from_username } = data;

      switch (type) {
        case 'user_joined': {
          const id = data.user_id;
          if (id === user.id) break;
          // We are existing — create offer for newcomer
          const pc = createPeerConnection(id, data.display_name || data.username);
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({
              type: 'offer',
              target_user_id: id,
              sdp: offer.sdp,
            }));
          } catch (e) {
            console.error('[WebRTC] Offer failed', e);
          }
          setRemoteParticipants(prev => {
            if (prev.find(p => p.userId === id)) return prev;
            return [...prev, { userId: id, displayName: data.display_name || data.username, stream: null, muted: false, videoOff: false, speaking: false }];
          });
          toast(`${data.display_name || data.username} joined`, { icon: '👋' });
          break;
        }

        case 'offer': {
          if (data.target_user_id !== user.id) break;
          const pc = createPeerConnection(from_user_id, from_username);
          try {
            await pc.setRemoteDescription({ type: 'offer', sdp: data.sdp });
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({
              type: 'answer',
              target_user_id: from_user_id,
              sdp: answer.sdp,
            }));
          } catch (e) {
            console.error('[WebRTC] Answer failed', e);
          }
          break;
        }

        case 'answer': {
          if (data.target_user_id !== user.id) break;
          const pc = peersRef.current[from_user_id];
          if (pc) {
            try {
              await pc.setRemoteDescription({ type: 'answer', sdp: data.sdp });
            } catch (e) {
              console.error('[WebRTC] Set remote answer failed', e);
            }
          }
          break;
        }

        case 'ice_candidate': {
          if (data.target_user_id !== user.id) break;
          const pc = peersRef.current[from_user_id];
          if (pc && data.candidate) {
            try {
              await pc.addIceCandidate({
                candidate: data.candidate,
                sdpMid: data.sdpMid,
                sdpMLineIndex: data.sdpMLineIndex,
              });
            } catch (e) {
              console.error('[WebRTC] Add ICE failed', e);
            }
          }
          break;
        }

        case 'user_left': {
          const id = data.user_id;
          if (peersRef.current[id]) {
            peersRef.current[id].close();
            delete peersRef.current[id];
          }
          delete remoteStreamsRef.current[id];
          setRemoteParticipants(prev => prev.filter(p => p.userId !== id));
          toast(`${data.username} left the call`, { icon: '👋' });
          break;
        }

        case 'call_end': {
          toast('Call ended by host');
          endCall();
          break;
        }

        default:
          break;
      }
    };

    return () => {
      ws.close();
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
    };
  }, [user, roomId, createPeerConnection]);

  // ── Local video ref sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (localVideoRef.current && localParticipant.stream) {
      localVideoRef.current.srcObject = localParticipant.stream;
    }
  }, [localParticipant.stream]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audio = stream.getAudioTracks()[0];
    if (audio) {
      audio.enabled = muted; // toggle
      setMuted(m => !m);
      setLocalParticipant(p => ({ ...p, muted: !muted }));
    }
  }, [muted]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const video = stream.getVideoTracks()[0];
    if (video) {
      video.enabled = videoOff;
      setVideoOff(v => !v);
      setLocalParticipant(p => ({ ...p, videoOff: !videoOff }));
    }
  }, [videoOff]);

  const toggleScreenShare = useCallback(async () => {
    if (sharing) {
      // Stop screen share, restore camera
      const stream = localStreamRef.current;
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) videoTrack.stop();
      }
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];
        if (camTrack && localStreamRef.current) {
          const sender = Object.values(peersRef.current).map(pc =>
            pc.getSenders().find(s => s.track?.kind === 'video')
          ).filter(Boolean)[0];
          if (sender) await sender.replaceTrack(camTrack);
          localStreamRef.current.getVideoTracks().forEach(t => t.stop());
          localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
          localStreamRef.current.addTrack(camTrack);
        }
      } catch (e) {
        console.error('Camera restore failed', e);
      }
      setSharing(false);
      toast('Screen sharing stopped', { icon: '🖥️' });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        // Replace video track in all peer connections
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        // Update local preview
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = () => toggleScreenShare();
        setSharing(true);
        toast('Screen sharing started', { icon: '🖥️' });
      } catch (e) {
        if (e.name !== 'NotAllowedError') toast.error('Screen share failed');
      }
    }
  }, [sharing]);

  const endCall = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'call_end' }));
    }
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peersRef.current).forEach(pc => pc.close());
    navigate(-1);
    toast('Call ended', { icon: '📞' });
  }, [navigate]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/call?room=${roomId}`);
    toast.success('Meeting link copied!');
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = {
      id: Date.now(),
      sender: user?.first_name || user?.username || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLocal: true,
    };
    setChatMessages(m => [...m, msg]);
    // Also broadcast via WebSocket (if signaling WS supports it)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat_message', text: chatInput.trim() }));
    }
    setChatInput('');
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const allParticipants = [localParticipant, ...remoteParticipants];
  const featured = allParticipants[0];
  const others = allParticipants.slice(1);

  const connIcon = { connecting: Loader, connected: CheckCircle, disconnected: WifiOff, error: AlertTriangle };
  const ConnIcon = connIcon[connectionState] || Wifi;
  const connColor = { connecting: '#f59e0b', connected: '#10b981', disconnected: '#6b7280', error: '#ef4444' };

  return (
    <div style={{
      minHeight: '100vh', background: '#060b18', color: '#fff',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes speakPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.02)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>RemoteTeam Meeting</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 20 }}>
            <Clock size={11} color="#aaa" />
            <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>{formatDuration(duration)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ConnIcon size={13} color={connColor[connectionState] || '#aaa'}
              style={connectionState === 'connecting' ? { animation: 'spin 1s linear infinite' } : undefined} />
            <span style={{ fontSize: 11, color: connColor[connectionState] || '#aaa', textTransform: 'capitalize' }}>
              {connectionState}
            </span>
          </div>
          {allParticipants.length > 1 && (
            <span style={{ fontSize: 12, color: '#aaa' }}>
              {allParticipants.length} participants
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>
            Room: <strong style={{ color: '#fff', letterSpacing: 1 }}>{roomId}</strong>
          </span>
          <button onClick={copyLink} style={{
            background: 'rgba(51,102,255,0.15)', border: '1px solid rgba(51,102,255,0.3)',
            color: '#3366ff', borderRadius: 8, padding: '5px 12px',
            cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600,
          }}>
            <Link size={13} /> Copy Link
          </button>
        </div>
      </div>

      {/* ── Media error banner ── */}
      {mediaError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span style={{ fontSize: 12, color: '#ef4444' }}>
            Camera/mic error: {mediaError}. You may still join audio-only.
          </span>
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Video grid */}
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
          {/* Featured (spotlight) */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            {featured && (
              <div style={{ height: '100%', borderRadius: 16, overflow: 'hidden', background: '#0d1025', border: '2px solid rgba(255,255,255,0.08)' }}>
                {featured.stream && !featured.videoOff ? (
                  <video
                    ref={featured.userId === user?.id ? localVideoRef : undefined}
                    autoPlay playsInline
                    muted={featured.userId === user?.id}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: colorForUser(featured.userId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 800 }}>
                      {getInitials(featured.displayName)}
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0' }}>
                      {featured.userId === user?.id ? 'You' : featured.displayName}
                    </span>
                    {featured.videoOff && <span style={{ fontSize: 12, color: '#64748b' }}>Camera off</span>}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '3px 10px', borderRadius: 8 }}>
                    {featured.userId === user?.id ? 'You' : featured.displayName}
                    {featured.muted ? ' 🔇' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail strip for other participants */}
          {others.length > 0 && (
            <div style={{
              display: 'flex', gap: 8, overflowX: 'auto',
              flexShrink: 0, height: 120, paddingBottom: 4,
            }}>
              {others.map(p => (
                <div key={p.userId} style={{
                  width: 160, height: 120, borderRadius: 10, overflow: 'hidden',
                  background: '#0d1025', border: '2px solid rgba(255,255,255,0.08)',
                  flexShrink: 0, position: 'relative',
                }}>
                  {p.stream && !p.videoOff ? (
                    <video
                      ref={el => { if (el && p.stream) el.srcObject = p.stream; }}
                      autoPlay playsInline
                      muted={p.userId === user?.id}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: colorForUser(p.userId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700 }}>
                        {getInitials(p.displayName)}
                      </div>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 10, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '1px 6px', borderRadius: 4 }}>
                    {p.displayName}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Waiting state */}
          {allParticipants.length === 1 && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: '#64748b', fontSize: 13 }}>
              <span>Waiting for others to join...</span>
              <span style={{ marginLeft: 8, opacity: 0.6 }}>Share the link above</span>
            </div>
          )}
        </div>

        {/* ── Side Panel ── */}
        {sidePanel && (
          <div style={{
            width: 300, background: 'rgba(255,255,255,0.03)',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Panel tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { key: 'chat', label: 'Chat', badge: chatMessages.length },
                { key: 'participants', label: `People (${allParticipants.length})` },
              ].map(tab => (
                <button key={tab.key}
                  onClick={() => setSidePanel(tab.key)}
                  style={{
                    flex: 1, padding: '11px 8px', background: 'none', border: 'none',
                    cursor: 'pointer',
                    color: sidePanel === tab.key ? '#3366ff' : '#aaa',
                    fontSize: 12, fontWeight: 600,
                    borderBottom: sidePanel === tab.key ? '2px solid #3366ff' : '2px solid transparent',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chat panel */}
            {sidePanel === 'chat' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 24 }}>
                      No messages yet
                    </div>
                  )}
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: msg.isLocal ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: 10, color: '#64748b' }}>{msg.sender} · {msg.time}</span>
                      <div style={{
                        background: msg.isLocal ? '#3366ff' : 'rgba(255,255,255,0.08)',
                        padding: '7px 11px', borderRadius: msg.isLocal ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        fontSize: 12, maxWidth: '85%', lineHeight: 1.5,
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendChatMessage} style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 6 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Message to call..."
                    style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '7px 10px', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                  <button type="submit" style={{ background: '#3366ff', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#fff', cursor: 'pointer', fontSize: 12 }}>
                    Send
                  </button>
                </form>
              </>
            )}

            {/* Participants panel */}
            {sidePanel === 'participants' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {allParticipants.map(p => (
                  <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: colorForUser(p.userId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(p.displayName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.userId === user?.id ? `${p.displayName} (You)` : p.displayName}
                      </div>
                      {p.speaking && <div style={{ fontSize: 10, color: '#3366ff' }}>Speaking</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {p.muted ? <MicOff size={12} color="#ef4444" /> : <Mic size={12} color="#10b981" />}
                      {p.videoOff ? <VideoOff size={12} color="#f59e0b" /> : <Video size={12} color="#10b981" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '14px 20px',
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {[
          { Icon: muted ? MicOff : Mic, label: muted ? 'Unmute' : 'Mute', action: toggleMute, danger: muted },
          { Icon: videoOff ? VideoOff : Video, label: videoOff ? 'Start Video' : 'Stop Video', action: toggleVideo, danger: videoOff },
          { Icon: sharing ? MonitorOff : Monitor, label: sharing ? 'Stop Share' : 'Share Screen', action: toggleScreenShare, active: sharing },
          { Icon: MessageSquare, label: 'Chat', action: () => setSidePanel(p => p === 'chat' ? null : 'chat'), active: sidePanel === 'chat' },
          { Icon: Users, label: 'People', action: () => setSidePanel(p => p === 'participants' ? null : 'participants'), active: sidePanel === 'participants' },
          { Icon: Hand, label: handRaised ? 'Lower Hand' : 'Raise Hand', action: () => { setHandRaised(h => !h); toast(handRaised ? 'Hand lowered' : 'Hand raised ✋'); }, active: handRaised },
        ].map(({ Icon, label, action, active, danger }) => (
          <button key={label} onClick={action} title={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: danger ? 'rgba(239,68,68,0.15)' : active ? 'rgba(51,102,255,0.15)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : active ? 'rgba(51,102,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: danger ? '#ef4444' : active ? '#3366ff' : '#cbd5e1',
            borderRadius: 10, padding: '10px 14px', cursor: 'pointer', minWidth: 64,
            transition: 'all 0.15s',
          }}>
            <Icon size={18} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
          </button>
        ))}

        <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />

        <button onClick={endCall} style={{
          background: '#ef4444', border: 'none', borderRadius: 10,
          padding: '12px 24px', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7,
          fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
          transition: 'all 0.15s',
        }}>
          <PhoneOff size={18} /> End Call
        </button>
      </div>
    </div>
  );
}
