/**
 * VideoCall.jsx — Enterprise WebRTC video/audio calling
 *
 * Features:
 *  • Pre-call lobby with device selection + camera preview
 *  • Group video calls (N-way mesh WebRTC)
 *  • Audio calls (video-off mode)
 *  • Screen sharing (replaceTrack across all peers)
 *  • Web Audio API speaking detection per participant
 *  • Adaptive participant grid (1 / 2 / 3-4 / 5+)
 *  • WebSocket exponential-backoff reconnect
 *  • Call reactions (floating emoji overlays)
 *  • Fullscreen toggle
 *  • Mobile responsive layout
 *  • STUN + open-relay TURN production configuration
 *  • In-call chat sidebar (broadcasts via signaling WS)
 *  • Participants panel with speaking/mute indicators
 *  • Waiting room state
 *  • Incoming call_invite notification banner
 */
import React, {
  useState, useRef, useEffect, useCallback, useReducer,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff,
  Users, MessageSquare, Copy, Link, Clock, Hand,
  Maximize2, Minimize2, Settings, AlertTriangle, CheckCircle,
  Loader2, ChevronDown, Send, Phone, PhoneIncoming, X,
  Volume2, VolumeX, SmilePlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── ICE / TURN configuration ──────────────────────────────────────────────────
// Public STUN + Open Relay TURN as production fallback.
// Replace turn: credentials with your own Metered/Twilio/Xirsys TURN in prod.
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Open Relay TURN — free tier, good for demos/staging
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

// ─── Reaction emojis ───────────────────────────────────────────────────────────
const REACTIONS = ['👍', '❤️', '😂', '😮', '🎉', '👏', '🔥'];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}
function getInitials(name = '') {
  return name.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase() || '??';
}
const COLORS = ['#3366ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
function colorForUser(id) {
  return COLORS[Math.abs((id || 0) + 7) % COLORS.length];
}
function getGridCols(n) {
  if (n <= 1) return 1;
  if (n <= 2) return 2;
  if (n <= 4) return 2;
  if (n <= 6) return 3;
  return 4;
}

// ─── Hook: speaking detection via Web Audio API ────────────────────────────────
function useSpeakingDetection(stream, threshold = 18) {
  const [speaking, setSpeaking] = useState(false);
  const ctxRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!stream || !stream.getAudioTracks().length) return;
    let active = true;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      ctxRef.current = ctx;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!active) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setSpeaking(avg > threshold);
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {/* AudioContext may be blocked by browser policy before user gesture */}
    return () => {
      active = false;
      cancelAnimationFrame(frameRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, [stream, threshold]);

  return speaking;
}

// ─── VideoTile ─────────────────────────────────────────────────────────────────
function VideoTile({ participant, isLocal = false, large = false, onClick }) {
  const videoRef = useRef(null);
  const { stream, muted: peerMuted, videoOff, displayName, userId, speaking } = participant;
  const localSpeaking = useSpeakingDetection(isLocal ? stream : null);
  const isSpeaking = isLocal ? localSpeaking : speaking;
  const color = colorForUser(userId);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', borderRadius: large ? 16 : 10,
        overflow: 'hidden', background: '#0d1025',
        border: isSpeaking ? `2.5px solid ${color}` : '2px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
        width: '100%', height: '100%',
        aspectRatio: large ? undefined : '4/3',
        boxShadow: isSpeaking ? `0 0 16px ${color}44` : 'none',
      }}
    >
      {stream && !videoOff ? (
        <video
          ref={videoRef}
          autoPlay playsInline muted={isLocal}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: large ? 88 : 52, height: large ? 88 : 52,
          borderRadius: '50%', background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: large ? 32 : 20, fontWeight: 800, color: '#fff',
          boxShadow: `0 0 0 6px ${color}22`,
          flexShrink: 0,
        }}>
          {getInitials(displayName)}
        </div>
      )}

      {/* Speaking pulse ring */}
      {isSpeaking && (
        <div style={{
          position: 'absolute', inset: 2, borderRadius: large ? 14 : 8,
          border: `2px solid ${color}`,
          animation: 'speakPulse 1s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Name / status bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        padding: '16px 8px 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: large ? 13 : 11, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isLocal ? 'You' : displayName}
        </span>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
          {peerMuted && <MicOff size={10} color="#ef4444" />}
          {videoOff && <VideoOff size={10} color="#f59e0b" />}
          {isSpeaking && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'speakPulse 0.8s ease-in-out infinite' }} />}
        </div>
      </div>
    </div>
  );
}

// ─── Audio level meter ─────────────────────────────────────────────────────────
function AudioMeter({ stream }) {
  const [level, setLevel] = useState(0);
  const frameRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!stream) return;
    let alive = true;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      ctxRef.current = ctx;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!alive) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(100, Math.round((avg / 128) * 100)));
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
    return () => {
      alive = false;
      cancelAnimationFrame(frameRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, [stream]);

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 20 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2,
          height: 4 + i * 2,
          background: level > (i + 1) * 12 ? '#10b981' : 'rgba(255,255,255,0.15)',
          transition: 'background 0.1s',
        }} />
      ))}
    </div>
  );
}

// ─── Lobby Screen ──────────────────────────────────────────────────────────────
function LobbyScreen({ roomId, user, onJoin, onAudioOnly }) {
  const [devices, setDevices] = useState({ cameras: [], mics: [] });
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [previewStream, setPreviewStream] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [camOff, setCamOff] = useState(false);
  const [micOff, setMicOff] = useState(false);
  const previewRef = useRef(null);

  // Enumerate devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(list => {
      setDevices({
        cameras: list.filter(d => d.kind === 'videoinput'),
        mics: list.filter(d => d.kind === 'audioinput'),
      });
    }).catch(() => {});
  }, []);

  // Preview stream
  useEffect(() => {
    let stream = null;
    (async () => {
      try {
        const constraints = {
          video: camOff ? false : (selectedCam ? { deviceId: { exact: selectedCam } } : true),
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        setPreviewStream(stream);
        setPreviewError('');
        if (previewRef.current) previewRef.current.srcObject = stream;
      } catch (err) {
        setPreviewError(err.message);
      }
    })();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [selectedCam, selectedMic, camOff]);

  const handleJoin = (audioOnly = false) => {
    previewStream?.getTracks().forEach(t => t.stop());
    onJoin({ audioOnly, selectedCam, selectedMic, micOff, camOff: audioOnly || camOff });
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #060b18 0%, #0d1530 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, width: '100%', maxWidth: 860, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>Ready to join?</h1>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
              Room: <strong style={{ color: '#3366ff', letterSpacing: 1 }}>{roomId}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Joining as <strong style={{ color: '#e2e8f0' }}>{user?.first_name || user?.username}</strong>
            </span>
          </div>
        </div>

        {/* Body: preview + settings */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 28 }}>
          {/* Camera preview */}
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={{
              position: 'relative', borderRadius: 14, overflow: 'hidden',
              background: '#0d1025', aspectRatio: '16/9',
              border: '2px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!camOff && previewStream ? (
                <video ref={previewRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: colorForUser(user?.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff' }}>
                    {getInitials(user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || '')}
                  </div>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{camOff ? 'Camera off' : 'Camera unavailable'}</span>
                </div>
              )}
              {previewError && !previewStream && (
                <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, background: 'rgba(239,68,68,0.85)', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#fff' }}>
                  {previewError}
                </div>
              )}
            </div>

            {/* Camera / mic toggles */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setCamOff(v => !v)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                  background: camOff ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${camOff ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)'}`,
                  color: camOff ? '#ef4444' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {camOff ? <VideoOff size={15} /> : <Video size={15} />}
                {camOff ? 'Camera off' : 'Camera on'}
              </button>
              <button
                onClick={() => setMicOff(v => !v)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                  background: micOff ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${micOff ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)'}`,
                  color: micOff ? '#ef4444' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {micOff ? <MicOff size={15} /> : <Mic size={15} />}
                {micOff ? 'Muted' : 'Mic on'}
              </button>
            </div>
          </div>

          {/* Settings + join */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            {/* Device selectors */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Camera</label>
              <select
                value={selectedCam}
                onChange={e => setSelectedCam(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 10px', color: '#e2e8f0', fontSize: 12, outline: 'none' }}
              >
                <option value="">Default camera</option>
                {devices.cameras.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 8)}`}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Microphone</label>
              <select
                value={selectedMic}
                onChange={e => setSelectedMic(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 10px', color: '#e2e8f0', fontSize: 12, outline: 'none' }}
              >
                <option value="">Default microphone</option>
                {devices.mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 8)}`}</option>)}
              </select>
            </div>

            {/* Audio level meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Mic level</span>
              <AudioMeter stream={previewStream} />
            </div>

            <div style={{ flex: 1 }} />

            {/* Join buttons */}
            <button
              onClick={() => handleJoin(false)}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12,
                background: 'linear-gradient(135deg, #3366ff, #6644ff)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(51,102,255,0.4)',
              }}
            >
              <Video size={18} /> Join with Video
            </button>
            <button
              onClick={() => handleJoin(true)}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Phone size={16} /> Join Audio Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reactions overlay ─────────────────────────────────────────────────────────
function ReactionsOverlay({ reactions }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 20 }}>
      {reactions.map(r => (
        <div key={r.id} style={{
          position: 'absolute', bottom: 80, left: `${r.x}%`,
          fontSize: 36, animation: 'floatUp 3.5s ease-out forwards',
          userSelect: 'none',
        }}>
          {r.emoji}
        </div>
      ))}
    </div>
  );
}

// ─── Incoming call banner ──────────────────────────────────────────────────────
function IncomingCallBanner({ invite, onAccept, onDecline }) {
  if (!invite) return null;
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: 'rgba(13,16,37,0.96)', border: '1px solid rgba(51,102,255,0.4)',
      borderRadius: 16, padding: '16px 20px', minWidth: 280,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', gap: 12,
      animation: 'slideInRight 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3366ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, animation: 'ringPulse 1s ease-in-out infinite' }}>
          <PhoneIncoming size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Incoming Call</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{invite.callerName} is calling…</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onDecline(invite)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <PhoneOff size={13} /> Decline
        </button>
        <button onClick={() => onAccept(invite)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Phone size={13} /> Accept
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VideoCall() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useStore();

  const roomId = searchParams.get('room') || (() => {
    const r = Math.random().toString(36).slice(2, 8).toUpperCase();
    window.history.replaceState(null, '', `?room=${r}`);
    return r;
  })();

  // ── Phase state machine ─────────────────────────────────────────────────────
  const [phase, setPhase] = useState('lobby'); // 'lobby' | 'call'
  const [lobbyConfig, setLobbyConfig] = useState(null);

  // ── Media state ─────────────────────────────────────────────────────────────
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [sidePanel, setSidePanel] = useState(null); // 'chat' | 'participants' | null
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [connectionState, setConnectionState] = useState('connecting'); // connecting|connected|reconnecting|error
  const [mediaError, setMediaError] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [spotlightUserId, setSpotlightUserId] = useState(null);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const peersRef = useRef({});
  const remoteStreamsRef = useRef({});
  const containerRef = useRef(null);
  const chatEndRef = useRef(null);
  const inCallRef = useRef(false);
  const reconnectRef = useRef({ attempt: 0, timer: null });

  // ── Participants ─────────────────────────────────────────────────────────────
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : (user?.username || 'You');

  const [localParticipant, setLocalParticipant] = useState({
    userId: user?.id,
    displayName,
    stream: null,
    muted: false,
    videoOff: false,
    speaking: false,
  });
  const [remoteParticipants, setRemoteParticipants] = useState([]);

  // ── Timer ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'call') return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // ── Chat scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Fullscreen sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── getUserMedia (when entering call) ─────────────────────────────────────────
  const startLocalMedia = useCallback(async (config) => {
    try {
      const videoConstraint = config?.audioOnly || config?.camOff ? false
        : config?.selectedCam ? { deviceId: { exact: config.selectedCam } } : true;
      const audioConstraint = config?.selectedMic
        ? { deviceId: { exact: config.selectedMic } }
        : true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: audioConstraint,
      });

      if (config?.micOff) stream.getAudioTracks().forEach(t => { t.enabled = false; });
      const vOff = config?.audioOnly || config?.camOff || false;

      localStreamRef.current = stream;
      setLocalParticipant(p => ({ ...p, stream, muted: config?.micOff || false, videoOff: vOff }));
      setMuted(config?.micOff || false);
      setVideoOff(vOff);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      setMediaError(err.message);
      // Audio-only fallback
      try {
        const audio = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = audio;
        setLocalParticipant(p => ({ ...p, stream: audio, videoOff: true }));
        setVideoOff(true);
        toast('Audio-only mode — camera unavailable', { icon: '🎤' });
      } catch {
        toast.error('Could not access microphone. You can still watch.');
      }
    }
  }, []);

  // ── WebSocket connect (with exponential backoff) ──────────────────────────────
  const connectWS = useCallback(() => {
    if (!user) return;
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = import.meta.env.PROD
      ? (import.meta.env.VITE_WS_HOST || window.location.host)
      : 'localhost:8000';
    const token = localStorage.getItem('rtm_access');
    const url = `${proto}://${host}/ws/call/${roomId}/?token=${token}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('connected');
      reconnectRef.current.attempt = 0;
      clearTimeout(reconnectRef.current.timer);
    };

    ws.onclose = () => {
      if (!inCallRef.current) return;
      setConnectionState('reconnecting');
      const attempt = ++reconnectRef.current.attempt;
      const delay = Math.min(1000 * 2 ** attempt, 30000);
      reconnectRef.current.timer = setTimeout(() => {
        if (inCallRef.current) connectWS();
      }, delay);
    };

    ws.onerror = () => {
      setConnectionState('error');
    };

    ws.onmessage = async (evt) => {
      let data;
      try { data = JSON.parse(evt.data); } catch { return; }
      const { type, from_user_id, from_username, from_display_name } = data;

      switch (type) {
        case 'user_joined': {
          const id = data.user_id;
          if (id === user.id) break;
          const pc = createPeerConnection(id, data.display_name || data.username);
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: 'offer', target_user_id: id, sdp: offer.sdp }));
          } catch (e) { console.error('[RTC] Offer failed', e); }
          setRemoteParticipants(prev =>
            prev.find(p => p.userId === id) ? prev
              : [...prev, { userId: id, displayName: data.display_name || data.username || `User ${id}`, stream: null, muted: false, videoOff: false, speaking: false }]
          );
          toast(`${data.display_name || data.username} joined`, { icon: '👋' });
          break;
        }
        case 'offer': {
          if (data.target_user_id !== user.id) break;
          const pc = createPeerConnection(from_user_id, from_display_name || from_username);
          try {
            await pc.setRemoteDescription({ type: 'offer', sdp: data.sdp });
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', target_user_id: from_user_id, sdp: answer.sdp }));
          } catch (e) { console.error('[RTC] Answer failed', e); }
          break;
        }
        case 'answer': {
          if (data.target_user_id !== user.id) break;
          const pc = peersRef.current[from_user_id];
          if (pc) { try { await pc.setRemoteDescription({ type: 'answer', sdp: data.sdp }); } catch (e) { console.error('[RTC] setRemoteAnswer failed', e); } }
          break;
        }
        case 'ice_candidate': {
          if (data.target_user_id !== user.id) break;
          const pc = peersRef.current[from_user_id];
          if (pc && data.candidate) {
            try {
              await pc.addIceCandidate({ candidate: data.candidate, sdpMid: data.sdpMid, sdpMLineIndex: data.sdpMLineIndex });
            } catch (e) { console.error('[RTC] addIceCandidate failed', e); }
          }
          break;
        }
        case 'user_left': {
          const id = data.user_id;
          peersRef.current[id]?.close();
          delete peersRef.current[id];
          delete remoteStreamsRef.current[id];
          setRemoteParticipants(prev => prev.filter(p => p.userId !== id));
          toast(`${data.username || 'A participant'} left`, { icon: '👋' });
          break;
        }
        case 'call_end': {
          toast('Call ended');
          doEndCall(false);
          break;
        }
        case 'reaction': {
          addReaction({ emoji: data.emoji, fromUser: from_display_name || from_username || 'Someone', x: 20 + Math.random() * 60 });
          break;
        }
        case 'chat_message': {
          const msg = {
            id: Date.now() + Math.random(),
            sender: from_display_name || from_username || 'Participant',
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isLocal: false,
          };
          setChatMessages(m => [...m, msg]);
          if (sidePanel !== 'chat') toast(`${msg.sender}: ${msg.text.slice(0, 40)}`, { icon: '💬', duration: 3000 });
          break;
        }
        case 'peer_state': {
          // peer sent mute/video-off status update
          setRemoteParticipants(prev => prev.map(p =>
            p.userId === from_user_id
              ? { ...p, muted: data.muted ?? p.muted, videoOff: data.video_off ?? p.videoOff }
              : p
          ));
          break;
        }
        case 'call_invite': {
          setIncomingCall({ roomId: data.room_id, callerName: data.caller_name || 'Someone' });
          break;
        }
        default: break;
      }
    };
  }, [user, roomId, sidePanel]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create RTCPeerConnection ──────────────────────────────────────────────────
  const createPeerConnection = useCallback((targetUserId, targetDisplayName) => {
    if (peersRef.current[targetUserId]) return peersRef.current[targetUserId];
    const pc = new RTCPeerConnection(ICE_CONFIG);
    peersRef.current[targetUserId] = pc;

    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

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

    pc.ontrack = ({ streams }) => {
      const stream = streams[0];
      remoteStreamsRef.current[targetUserId] = stream;
      setRemoteParticipants(prev => {
        const exists = prev.find(p => p.userId === targetUserId);
        if (exists) return prev.map(p => p.userId === targetUserId ? { ...p, stream } : p);
        return [...prev, {
          userId: targetUserId,
          displayName: targetDisplayName || `User ${targetUserId}`,
          stream, muted: false, videoOff: false, speaking: false,
        }];
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        console.warn(`[RTC] Peer ${targetUserId} connection failed — restarting ICE`);
        pc.restartIce?.();
      }
    };

    return pc;
  }, []);

  // ── Enter call ────────────────────────────────────────────────────────────────
  const enterCall = useCallback(async (config) => {
    setLobbyConfig(config);
    await startLocalMedia(config);
    inCallRef.current = true;
    setPhase('call');
    connectWS();
  }, [startLocalMedia, connectWS]);

  // ── End call ──────────────────────────────────────────────────────────────────
  const doEndCall = useCallback((sendEndSignal = true) => {
    inCallRef.current = false;
    clearTimeout(reconnectRef.current.timer);
    if (sendEndSignal && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'call_end' }));
    }
    wsRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    navigate(-1);
    toast('Call ended', { icon: '📞' });
  }, [navigate]);

  // ── Controls ──────────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = muted;
      setMuted(m => !m);
      setLocalParticipant(p => ({ ...p, muted: !muted }));
      wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ type: 'peer_state', muted: !muted, video_off: videoOff }));
    }
  }, [muted, videoOff]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = videoOff;
      setVideoOff(v => !v);
      setLocalParticipant(p => ({ ...p, videoOff: !videoOff }));
      wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ type: 'peer_state', muted, video_off: !videoOff }));
    }
  }, [videoOff, muted]);

  const toggleScreenShare = useCallback(async () => {
    if (sharing) {
      // Restore camera
      try {
        const cam = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = cam.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && camTrack) sender.replaceTrack(camTrack);
        });
        const old = localStreamRef.current?.getVideoTracks()[0];
        old?.stop();
        localStreamRef.current?.removeTrack(old);
        localStreamRef.current?.addTrack(camTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      } catch (e) { console.error('[ScreenShare] Camera restore failed', e); }
      setSharing(false);
      toast('Screen sharing stopped', { icon: '🖥️' });
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: false });
        const screenTrack = screen.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = screen;
        screenTrack.onended = () => { if (sharing) toggleScreenShare(); else setSharing(false); };
        setSharing(true);
        toast('You are sharing your screen', { icon: '🖥️' });
      } catch (e) {
        if (e.name !== 'NotAllowedError') toast.error('Screen share failed');
      }
    }
  }, [sharing]);

  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, [fullscreen]);

  const sendReaction = useCallback((emoji) => {
    addReaction({ emoji, fromUser: 'You', x: 20 + Math.random() * 60 });
    wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ type: 'reaction', emoji }));
    setShowReactionPicker(false);
  }, []);

  const addReaction = useCallback(({ emoji, fromUser, x }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setReactions(r => [...r, { id, emoji, fromUser, x }]);
    setTimeout(() => setReactions(r => r.filter(rx => rx.id !== id)), 3500);
  }, []);

  const sendChatMsg = useCallback((e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    const msg = {
      id: Date.now() + Math.random(),
      sender: displayName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLocal: true,
    };
    setChatMessages(m => [...m, msg]);
    wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ type: 'chat_message', text }));
    setChatInput('');
  }, [chatInput, displayName]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/call?room=${roomId}`);
    toast.success('Meeting link copied!');
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      inCallRef.current = false;
      clearTimeout(reconnectRef.current.timer);
      wsRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, []);

  // ── Local video ref sync ──────────────────────────────────────────────────────
  useEffect(() => {
    if (localVideoRef.current && localParticipant.stream && !sharing) {
      localVideoRef.current.srcObject = localParticipant.stream;
    }
  }, [localParticipant.stream, sharing]);

  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <>
        <style>{`
          @keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-180px) scale(1.3);opacity:0} }
          @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
          @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(51,102,255,0.5)} 50%{box-shadow:0 0 0 10px rgba(51,102,255,0)} }
        `}</style>
        <IncomingCallBanner
          invite={incomingCall}
          onAccept={inv => { setIncomingCall(null); window.location.search = `?room=${inv.roomId}`; }}
          onDecline={() => setIncomingCall(null)}
        />
        <LobbyScreen roomId={roomId} user={user} onJoin={enterCall} onAudioOnly={cfg => enterCall({ ...cfg, audioOnly: true })} />
      </>
    );
  }

  // ── In-call view ──────────────────────────────────────────────────────────────
  const allParticipants = [localParticipant, ...remoteParticipants];
  const cols = getGridCols(allParticipants.length);
  const spotlightParticipant = spotlightUserId
    ? allParticipants.find(p => p.userId === spotlightUserId) || allParticipants[0]
    : null;

  const connLabel = { connecting: 'Connecting', connected: 'Live', reconnecting: 'Reconnecting…', error: 'Disconnected' }[connectionState] || connectionState;
  const connColor = { connecting: '#f59e0b', connected: '#10b981', reconnecting: '#f59e0b', error: '#ef4444' }[connectionState] || '#64748b';

  return (
    <div ref={containerRef} style={{
      height: '100vh', background: '#060b18', color: '#fff',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes speakPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-180px) scale(1.4);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(51,102,255,0.5)} 50%{box-shadow:0 0 0 10px rgba(51,102,255,0)} }
        @media(max-width:600px) { .call-topbar-room { display: none !important; } }
      `}</style>

      <IncomingCallBanner
        invite={incomingCall}
        onAccept={inv => { setIncomingCall(null); window.location.search = `?room=${inv.roomId}`; }}
        onDecline={() => setIncomingCall(null)}
      />

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
        backdropFilter: 'blur(10px)', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>RemoteTeam</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', padding: '3px 9px', borderRadius: 20 }}>
            <Clock size={10} color="#aaa" />
            <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{formatDuration(duration)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {connectionState === 'connecting' || connectionState === 'reconnecting'
              ? <Loader2 size={11} color={connColor} style={{ animation: 'spin 1s linear infinite' }} />
              : connectionState === 'connected' ? <CheckCircle size={11} color={connColor} />
              : <AlertTriangle size={11} color={connColor} />
            }
            <span style={{ fontSize: 10, color: connColor, fontWeight: 600 }}>{connLabel}</span>
          </div>
        </div>

        <div className="call-topbar-room" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            Room: <strong style={{ color: '#fff', letterSpacing: 1 }}>{roomId}</strong>
          </span>
          <button onClick={copyLink} style={{
            background: 'rgba(51,102,255,0.15)', border: '1px solid rgba(51,102,255,0.3)',
            color: '#3366ff', borderRadius: 6, padding: '4px 10px',
            cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
          }}>
            <Link size={11} /> Copy Link
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>{allParticipants.length} in call</span>
          <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── Media error ── */}
      {mediaError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <AlertTriangle size={12} color="#ef4444" />
          <span style={{ fontSize: 11, color: '#ef4444' }}>Camera/mic error: {mediaError}</span>
        </div>
      )}

      {/* ── Main call area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>

        {/* Reactions overlay */}
        <ReactionsOverlay reactions={reactions} />

        {/* Video grid */}
        <div style={{ flex: 1, padding: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {spotlightParticipant ? (
            // Spotlight mode: one large + strip
            <>
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <VideoTile
                  participant={{ ...spotlightParticipant, stream: spotlightParticipant.userId === user?.id ? localParticipant.stream : spotlightParticipant.stream }}
                  isLocal={spotlightParticipant.userId === user?.id}
                  large
                />
              </div>
              <div style={{ display: 'flex', gap: 6, height: 110, flexShrink: 0, overflowX: 'auto', paddingBottom: 2 }}>
                {allParticipants.filter(p => p.userId !== spotlightParticipant.userId).map(p => (
                  <div key={p.userId} style={{ width: 150, flexShrink: 0, position: 'relative' }}>
                    <VideoTile
                      participant={{ ...p, stream: p.userId === user?.id ? localParticipant.stream : p.stream }}
                      isLocal={p.userId === user?.id}
                      onClick={() => setSpotlightUserId(p.userId)}
                    />
                    <button onClick={() => setSpotlightUserId(null)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 4, color: '#aaa', cursor: 'pointer', fontSize: 9, padding: '2px 4px' }}>Exit</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Grid mode: adaptive columns
            <>
              <div style={{
                flex: 1, minHeight: 0,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 8,
                alignItems: 'stretch',
              }}>
                {allParticipants.map(p => (
                  <VideoTile
                    key={p.userId}
                    participant={{ ...p, stream: p.userId === user?.id ? localParticipant.stream : p.stream }}
                    isLocal={p.userId === user?.id}
                    large={allParticipants.length === 1}
                    onClick={() => allParticipants.length > 1 && setSpotlightUserId(p.userId)}
                  />
                ))}
              </div>
              {allParticipants.length === 1 && (
                <div style={{ textAlign: 'center', color: '#475569', fontSize: 12, paddingBottom: 8 }}>
                  Waiting for others to join… Share the link above.
                </div>
              )}
            </>
          )}
        </div>

        {/* Side panel */}
        {sidePanel && (
          <div style={{
            width: 300, background: 'rgba(13,16,37,0.97)',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.2s ease-out',
          }}>
            {/* Panel tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              {[
                { key: 'chat', label: 'Chat' },
                { key: 'participants', label: `People (${allParticipants.length})` },
              ].map(tab => (
                <button key={tab.key} onClick={() => setSidePanel(tab.key)} style={{
                  flex: 1, padding: '11px 8px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  color: sidePanel === tab.key ? '#3366ff' : '#64748b',
                  borderBottom: sidePanel === tab.key ? '2px solid #3366ff' : '2px solid transparent',
                }}>{tab.label}</button>
              ))}
              <button onClick={() => setSidePanel(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '0 10px' }}>
                <X size={15} />
              </button>
            </div>

            {/* Chat */}
            {sidePanel === 'chat' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#475569', fontSize: 11, marginTop: 32 }}>No messages yet. Say hi! 👋</div>
                  )}
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: msg.isLocal ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: 9, color: '#475569' }}>{msg.sender} · {msg.time}</span>
                      <div style={{
                        background: msg.isLocal ? '#3366ff' : 'rgba(255,255,255,0.09)',
                        padding: '7px 11px', fontSize: 12, lineHeight: 1.5, maxWidth: '85%',
                        borderRadius: msg.isLocal ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        wordBreak: 'break-word',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendChatMsg} style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 6, flexShrink: 0 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Message to everyone…"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 10px', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                  <button type="submit" style={{ background: '#3366ff', border: 'none', borderRadius: 8, padding: '7px 10px', color: '#fff', cursor: 'pointer' }}>
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}

            {/* Participants */}
            {sidePanel === 'participants' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {allParticipants.map(p => (
                  <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer' }}
                    onClick={() => { setSpotlightUserId(p.userId === spotlightUserId ? null : p.userId); setSidePanel(null); }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: colorForUser(p.userId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(p.displayName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.userId === user?.id ? `${p.displayName} (You)` : p.displayName}
                      </div>
                      {p.speaking && <div style={{ fontSize: 9, color: '#3366ff', fontWeight: 600 }}>Speaking</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
                      {p.muted ? <MicOff size={11} color="#ef4444" /> : <Mic size={11} color="#10b981" />}
                      {p.videoOff ? <VideoOff size={11} color="#f59e0b" /> : <Video size={11} color="#10b981" />}
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '12px 16px', flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0, backdropFilter: 'blur(12px)',
        position: 'relative',
      }}>
        {/* Reaction picker */}
        {showReactionPicker && (
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(13,16,37,0.97)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '8px 10px', display: 'flex', gap: 8,
            boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            marginBottom: 8, zIndex: 30,
          }}>
            {REACTIONS.map(e => (
              <button key={e} onClick={() => sendReaction(e)} style={{
                background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
                padding: 4, borderRadius: 8,
                transition: 'transform 0.1s',
              }} onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.3)'}
                onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}
              >{e}</button>
            ))}
          </div>
        )}

        {[
          { Icon: muted ? MicOff : Mic, label: muted ? 'Unmute' : 'Mute', action: toggleMute, danger: muted },
          { Icon: videoOff ? VideoOff : Video, label: videoOff ? 'Start Cam' : 'Stop Cam', action: toggleVideo, danger: videoOff },
          { Icon: sharing ? MonitorOff : Monitor, label: sharing ? 'Stop Share' : 'Share', action: toggleScreenShare, active: sharing },
        ].map(({ Icon, label, action, active, danger }) => (
          <button key={label} onClick={action} title={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: danger ? 'rgba(239,68,68,0.15)' : active ? 'rgba(51,102,255,0.15)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : active ? 'rgba(51,102,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: danger ? '#ef4444' : active ? '#3366ff' : '#cbd5e1',
            borderRadius: 10, padding: '9px 14px', cursor: 'pointer', minWidth: 58,
            transition: 'all 0.15s',
          }}>
            <Icon size={17} />
            <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
          </button>
        ))}

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />

        {[
          { Icon: SmilePlus, label: 'React', action: () => setShowReactionPicker(p => !p), active: showReactionPicker },
          { Icon: MessageSquare, label: 'Chat', action: () => setSidePanel(p => p === 'chat' ? null : 'chat'), active: sidePanel === 'chat', badge: chatMessages.filter(m => !m.isLocal).length > 0 },
          { Icon: Users, label: 'People', action: () => setSidePanel(p => p === 'participants' ? null : 'participants'), active: sidePanel === 'participants' },
          { Icon: Hand, label: handRaised ? 'Lower' : 'Raise', action: () => { setHandRaised(h => !h); toast(handRaised ? 'Hand lowered' : 'Hand raised ✋', { duration: 2000 }); }, active: handRaised },
        ].map(({ Icon, label, action, active }) => (
          <button key={label} onClick={action} title={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: active ? 'rgba(51,102,255,0.15)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${active ? 'rgba(51,102,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: active ? '#3366ff' : '#cbd5e1',
            borderRadius: 10, padding: '9px 14px', cursor: 'pointer', minWidth: 58,
            transition: 'all 0.15s',
          }}>
            <Icon size={17} />
            <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
          </button>
        ))}

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />

        <button onClick={() => doEndCall(true)} style={{
          background: '#ef4444', border: 'none', borderRadius: 10,
          padding: '11px 22px', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7,
          fontWeight: 700, fontSize: 13,
          boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
        }}>
          <PhoneOff size={16} /> Leave
        </button>
      </div>
    </div>
  );
}
