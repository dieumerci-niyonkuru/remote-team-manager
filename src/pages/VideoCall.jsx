import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import api, { calls, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Hand, MessageSquare, Users, X } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

function VideoTile({ stream, name, isLocal, audioOff, videoOff, handRaised }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{ background: '#1a1a2e', borderRadius: 8, position: 'relative', overflow: 'hidden', width: '100%', height: '100%', minHeight: isLocal ? 0 : 200 }}>
      {stream && !videoOff ? (
        <video ref={videoRef} autoPlay muted={isLocal} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 6, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '2px 6px' }}>{name || 'User'}</span>
      </div>
      <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 4 }}>
        {audioOff && <div style={{ background: 'var(--danger)', borderRadius: 4, padding: '2px 5px', display: 'flex' }}><MicOff size={10} color="#fff" /></div>}
        {videoOff && <div style={{ background: 'var(--danger)', borderRadius: 4, padding: '2px 5px', display: 'flex' }}><VideoOff size={10} color="#fff" /></div>}
      </div>
      {handRaised && (
        <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(234,179,8,0.9)', borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center' }}>
          <Hand size={14} color="#fff" />
        </div>
      )}
    </div>
  );
}

export default function VideoCall() {
  const { roomId } = useParams();
  const { user, lang = 'en' } = useStore();
  const t = getT(lang || 'en');

  const [joined, setJoined] = useState(false);
  const [starting, setStarting] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const localStreamRef = useRef(null);
  const remoteStreamsRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});
  // Mirrors localStreamRef in state: a ref alone never triggers the re-render
  // the self-view tile needs once the camera finishes opening.
  const [localStream, setLocalStream] = useState(null);
  const pcRef = useRef({});
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);

  const participantNamesRef = useRef({});
  const [participantNames, setParticipantNames] = useState({});
  const intentionalLeaveRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const heartbeatRef = useRef(null);

  const sendWs = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !audioOn; });
    }
    setAudioOn(prev => !prev);
  }, [audioOn]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !videoOn; });
    }
    setVideoOn(prev => !prev);
  }, [videoOn]);

  const toggleHand = useCallback(() => {
    const next = !handRaised;
    setHandRaised(next);
    sendWs({ type: 'raise_hand', user: user?.id });
  }, [handRaised, sendWs, user?.id]);

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    sendWs({ type: 'chat_message', content: text, user: user?.id });
    setChatMessages(prev => [...prev, { id: Date.now(), user: user?.id, name: user?.first_name || user?.username || 'You', content: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  }, [chatInput, sendWs, user?.id, user?.first_name, user?.username]);

  const handleLeave = useCallback(() => {
    intentionalLeaveRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    Object.values(pcRef.current).forEach(pc => pc.close());
    pcRef.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    remoteStreamsRef.current = {};
    setRemoteStreams({});
    setParticipants([]);
    setHandRaised(false);
    setReconnecting(false);
    setJoined(false);
  }, []);

  useEffect(() => {
    if (!joined) return;

    intentionalLeaveRef.current = false;
    reconnectAttemptRef.current = 0;
    let unmounted = false;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (unmounted) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        setLocalStream(stream);
        setVideoOn(true);
        setAudioOn(true);
      } catch {
        toast.error('Could not access camera/microphone');
        if (!unmounted) setJoined(false);
        return;
      }

      const accessToken = localStorage.getItem('rtm_access');
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${window.location.host}/ws/call/${roomId}/?token=${accessToken}`;

      const connectWebSocket = () => {
        if (intentionalLeaveRef.current) return;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          intentionalLeaveRef.current = false;
          reconnectAttemptRef.current = 0;
          setReconnecting(false);
          Object.values(pcRef.current).forEach(pc => pc.close());
          pcRef.current = {};
          remoteStreamsRef.current = {};
          setRemoteStreams({});
          setParticipants([]);
          setParticipantNames({});
          participantNamesRef.current = {};
          sendWs({ type: 'join', user: user?.id });
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          heartbeatRef.current = setInterval(() => {
            sendWs({ type: 'heartbeat' });
          }, 25000);
        };

        ws.onmessage = async (evt) => {
          let msg;
          try { msg = JSON.parse(evt.data); } catch { return; }

          if (msg.user == null || msg.user === user?.id) return;

          if (msg.type === 'user_joined') {
            const peerId = msg.user;
            if (!participantNamesRef.current[peerId]) {
              participantNamesRef.current[peerId] = msg.name || `User ${peerId}`;
              setParticipantNames({ ...participantNamesRef.current });
            }
            setParticipants(prev => prev.includes(peerId) ? prev : [...prev, peerId]);
            await createPeerConnection(peerId, true);
          } else if (msg.type === 'user_left') {
            const peerId = msg.user;
            if (pcRef.current[peerId]) { pcRef.current[peerId].close(); delete pcRef.current[peerId]; }
            delete remoteStreamsRef.current[peerId];
            delete participantNamesRef.current[peerId];
            setRemoteStreams({ ...remoteStreamsRef.current });
            setParticipantNames({ ...participantNamesRef.current });
            setParticipants(prev => prev.filter(p => p !== peerId));
          } else if (msg.type === 'offer') {
            const peerId = msg.user;
            if (!participantNamesRef.current[peerId]) {
              participantNamesRef.current[peerId] = msg.name || `User ${peerId}`;
              setParticipantNames({ ...participantNamesRef.current });
            }
            setParticipants(prev => prev.includes(peerId) ? prev : [...prev, peerId]);
            await handleOffer(peerId, msg.offer, msg.name);
          } else if (msg.type === 'answer') {
            const peerId = msg.user;
            const pc = pcRef.current[peerId];
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
          } else if (msg.type === 'ice_candidate') {
            const peerId = msg.user;
            const pc = pcRef.current[peerId];
            if (pc && msg.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
          } else if (msg.type === 'raise_hand') {
            const peerId = msg.user;
            setRemoteStreams(prev => {
              const updated = { ...prev };
              if (updated[peerId]) {
                updated[peerId] = { ...updated[peerId], handRaised: !updated[peerId].handRaised };
              }
              return updated;
            });
          } else if (msg.type === 'chat_message') {
            const peerId = msg.user;
            const name = participantNamesRef.current[peerId] || `User ${peerId}`;
            setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), user: peerId, name, content: msg.content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
          } else if (msg.type === 'participant_info') {
            const peerId = msg.user;
            if (msg.name) {
              participantNamesRef.current[peerId] = msg.name;
              setParticipantNames({ ...participantNamesRef.current });
            }
          }
        };

        ws.onclose = () => {
          if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
          if (intentionalLeaveRef.current || unmounted) return;
          const attempt = reconnectAttemptRef.current;
          if (attempt >= 5) {
            toast.error('Call connection lost');
            if (!unmounted) handleLeave();
            return;
          }
          const delay = Math.min(1000 * 2 ** attempt, 30000);
          reconnectAttemptRef.current = attempt + 1;
          setReconnecting(true);
          reconnectTimerRef.current = setTimeout(() => {
            if (!unmounted && !intentionalLeaveRef.current) {
              connectWebSocket();
            }
          }, delay);
        };

        ws.onerror = () => {};

        return ws;
      };

      connectWebSocket();
    };

    const createPeerConnection = async (peerId, initiator) => {
      if (pcRef.current[peerId]) return pcRef.current[peerId];

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current[peerId] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendWs({ type: 'ice_candidate', user: user?.id, to: peerId, candidate: e.candidate.toJSON() });
        }
      };

      pc.ontrack = (e) => {
        remoteStreamsRef.current[peerId] = { ...remoteStreamsRef.current[peerId], stream: e.streams[0] };
        setRemoteStreams({ ...remoteStreamsRef.current });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          pc.close();
          delete pcRef.current[peerId];
          delete remoteStreamsRef.current[peerId];
          setRemoteStreams({ ...remoteStreamsRef.current });
        }
      };

      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendWs({ type: 'offer', user: user?.id, to: peerId, offer: pc.localDescription.toJSON(), name: user?.first_name || user?.username });
      }

      return pc;
    };

    const handleOffer = async (peerId, offer, name) => {
      const pc = await createPeerConnection(peerId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendWs({ type: 'answer', user: user?.id, to: peerId, answer: pc.localDescription.toJSON(), name: user?.first_name || user?.username });
    };

    setup();

    return () => {
      unmounted = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      Object.values(pcRef.current).forEach(pc => pc.close());
      pcRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      remoteStreamsRef.current = {};
    };
  }, [joined, roomId, user?.id, user?.first_name, user?.username, sendWs, handleLeave]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!joined) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(24px,3vw,32px)', maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Video size={28} style={{ color: 'var(--brand)' }} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Join Video Call</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Room: {roomId}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            <button onClick={toggleVideo}
              style={{ width: 44, height: 44, borderRadius: 10, background: videoOn ? 'var(--bg3)' : 'var(--danger-subtle)', border: videoOn ? '1px solid var(--border)' : '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: videoOn ? 'var(--text)' : 'var(--danger)' }}>
              {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button onClick={toggleAudio}
              style={{ width: 44, height: 44, borderRadius: 10, background: audioOn ? 'var(--bg3)' : 'var(--danger-subtle)', border: audioOn ? '1px solid var(--border)' : '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: audioOn ? 'var(--text)' : 'var(--danger)' }}>
              {audioOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          </div>
          <button onClick={() => { setStarting(true); setJoined(true); }}
            disabled={starting}
            style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: 'var(--brand)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: starting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {starting ? <LoadingSpinner size={16} /> : <><PhoneOff size={14} style={{ transform: 'rotate(135deg)' }} /> Join Call</>}
          </button>
        </div>
      </div>
    );
  }

  const allParticipants = [user?.id, ...participants];
  const localUserId = user?.id;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: participants.length <= 1 ? '1fr' : participants.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 4, padding: 4, height: 'calc(100vh - 64px)' }}>
          {localUserId && (
            <VideoTile
              stream={localStream}
              name={`${user?.first_name || user?.username || 'You'} (You)`}
              isLocal
              audioOff={!audioOn}
              videoOff={!videoOn}
              handRaised={handRaised}
            />
          )}
          {participants.map(pid => {
            const rd = remoteStreams[pid] || {};
            return (
              <VideoTile
                key={pid}
                stream={rd.stream}
                name={participantNames[pid] || `User ${pid}`}
                audioOff={false}
                videoOff={!rd.stream}
                handRaised={!!rd.handRaised}
              />
            );
          })}
          {participants.length === 0 && (
            <div style={{ background: '#1a1a2e', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Waiting for others to join...</p>
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 160, height: 120, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', zIndex: 10 }}>
          <VideoTile
            stream={localStream}
            name="You"
            isLocal
            audioOff={!audioOn}
            videoOff={!videoOn}
            handRaised={handRaised}
          />
        </div>

        <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 50, alignItems: 'center' }}>
          {reconnecting && (
            <div style={{ fontSize: 12, color: '#eab308', fontWeight: 600, marginRight: 4, whiteSpace: 'nowrap' }}>Reconnecting...</div>
          )}
          <button onClick={toggleAudio}
            style={{ width: 40, height: 40, borderRadius: 10, background: audioOn ? 'var(--bg3)' : 'var(--danger)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: audioOn ? 'var(--text)' : '#fff' }}>
            {audioOn ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
          <button onClick={toggleVideo}
            style={{ width: 40, height: 40, borderRadius: 10, background: videoOn ? 'var(--bg3)' : 'var(--danger)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: videoOn ? 'var(--text)' : '#fff' }}>
            {videoOn ? <Video size={16} /> : <VideoOff size={16} />}
          </button>
          <button onClick={toggleHand}
            style={{ width: 40, height: 40, borderRadius: 10, background: handRaised ? '#eab308' : 'var(--bg3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: handRaised ? '#fff' : 'var(--text)' }}>
            <Hand size={16} />
          </button>
          <button onClick={() => setChatOpen(prev => !prev)}
            style={{ width: 40, height: 40, borderRadius: 10, background: chatOpen ? 'var(--brand)' : 'var(--bg3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: chatOpen ? '#fff' : 'var(--text)' }}>
            <MessageSquare size={16} />
          </button>
          <button onClick={() => setShowParticipants(prev => !prev)}
            style={{ width: 40, height: 40, borderRadius: 10, background: showParticipants ? 'var(--brand)' : 'var(--bg3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showParticipants ? '#fff' : 'var(--text)', position: 'relative' }}>
            <Users size={16} />
            {participants.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {participants.length + 1}
              </span>
            )}
          </button>
          <button onClick={handleLeave}
            style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--danger)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <PhoneOff size={16} />
          </button>
        </div>
      </div>

      {showParticipants && (
        <div style={{ position: 'fixed', top: 0, right: chatOpen ? 320 : 0, width: 260, height: '100vh', background: 'var(--bg2)', borderLeft: '1px solid var(--border)', zIndex: 60, display: 'flex', flexDirection: 'column', transition: 'right 0.2s', boxShadow: '-4px 0 16px rgba(0,0,0,0.15)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Participants ({allParticipants.length})</span>
            <button onClick={() => setShowParticipants(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}><X size={16} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>
                {(user?.first_name || user?.username || 'Y').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{user?.first_name || user?.username || 'You'} (You)</p>
                {handRaised && <p style={{ fontSize: 11, color: '#eab308', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}><Hand size={10} /> Hand raised</p>}
              </div>
            </div>
            {participants.map(pid => {
              const rd = remoteStreams[pid] || {};
              return (
                <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {(participantNames[pid] || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{participantNames[pid] || `User ${pid}`}</p>
                    {rd.handRaised && <p style={{ fontSize: 11, color: '#eab308', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}><Hand size={10} /> Hand raised</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {chatOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 320, height: '100vh', background: 'var(--bg2)', borderLeft: '1px solid var(--border)', zIndex: 70, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 16px rgba(0,0,0,0.15)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>In-Call Chat</span>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}><X size={16} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chatMessages.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', marginTop: 40 }}>No messages yet. Say hello!</p>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{ background: msg.user === localUserId ? 'var(--brand-bg)' : 'var(--bg3)', borderRadius: 8, padding: '8px 10px', maxWidth: '85%', alignSelf: msg.user === localUserId ? 'flex-end' : 'flex-start' }}>
                {msg.user !== localUserId && <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', margin: '0 0 2px' }}>{msg.name}</p>}
                <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, wordBreak: 'break-word' }}>{msg.content}</p>
                <p style={{ fontSize: 10, color: 'var(--text3)', margin: '4px 0 0', textAlign: msg.user === localUserId ? 'right' : 'left' }}>{msg.time}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <button onClick={sendChat}
              disabled={!chatInput.trim()}
              style={{ padding: '8px 14px', borderRadius: 8, background: chatInput.trim() ? 'var(--brand)' : 'var(--bg3)', color: chatInput.trim() ? '#fff' : 'var(--text3)', border: 'none', fontWeight: 600, fontSize: 13, cursor: chatInput.trim() ? 'pointer' : 'default' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
