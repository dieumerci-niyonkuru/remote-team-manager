import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import Picker from 'emoji-picker-react';
import ReactCountryFlag from 'react-country-flag';
import { FaSmile, FaPaperPlane, FaUserPlus } from 'react-icons/fa';

const Chat = ({ workspaceId }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return;
    api.get('/channels/').then(res => setRooms(res.data));
    const heartbeat = setInterval(() => api.post('/presence/heartbeat/'), 30000);
    return () => clearInterval(heartbeat);
  }, [workspaceId]);

  useEffect(() => {
    if (!activeRoom) return;
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socket = new WebSocket(`${protocol}${window.location.host}/ws/chat/${activeRoom.id}/`);
    setWs(socket);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
      if (data.mention && data.mention === user?.username) {
        new Notification(`Mention from ${data.username}`, { body: data.message });
      }
    };
    api.get(`/messages/?room=${activeRoom.id}`).then(res => setMessages(res.data));
    return () => socket.close();
  }, [activeRoom]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await api.get('/presence/online_users/');
      setOnlineUsers(res.data);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !ws) return;
    ws.send(JSON.stringify({ message: newMessage }));
    setNewMessage('');
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  const mention = (username) => {
    setNewMessage(prev => prev + ` @${username} `);
  };

  return (
    <div className="flex h-full gap-4">
      <div className="w-80 bg-white rounded shadow p-4">
        <h3 className="font-bold mb-2">Chat Rooms</h3>
        <div className="space-y-1">
          {rooms.map(room => (
            <button key={room.id} onClick={() => setActiveRoom(room)} className={`w-full text-left px-3 py-2 rounded ${activeRoom?.id === room.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
              {room.name}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <h4 className="font-semibold">Online</h4>
          {onlineUsers.map(u => (
            <div key={u.id} className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{u.first_name || u.username}</span>
              <button onClick={() => mention(u.username)} className="text-xs text-blue-500"><FaUserPlus /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white rounded shadow flex flex-col">
        {activeRoom ? (
          <>
            <div className="p-3 border-b font-bold">{activeRoom.name}</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.username === user?.username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-lg px-3 py-2 ${msg.username === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    <div className="text-xs opacity-75">{msg.username}</div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t flex gap-2 relative">
              <textarea rows="1" className="flex-1 border rounded px-3 py-2" placeholder="Type @ to mention, use emojis..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2"><FaSmile /></button>
              {showEmoji && <div className="absolute bottom-12 right-12 z-10"><Picker onEmojiClick={onEmojiClick} /></div>}
              <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded"><FaPaperPlane /></button>
            </div>
          </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-500">Select a room</div>}
      </div>
    </div>
  );
};
export default Chat;
