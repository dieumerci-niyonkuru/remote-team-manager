import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Chat = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/chat/rooms/').then(res => setRooms(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${protocol}${window.location.host}/ws/chat/${activeRoom.id}/`;
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => console.log('WebSocket connected');
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };
    socket.onclose = () => console.log('WebSocket disconnected');

    api.get(`/chat/messages/?room=${activeRoom.id}`).then(res => setMessages(res.data)).catch(console.error);

    return () => socket.close();
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !ws) return;
    ws.send(JSON.stringify({ message: newMessage }));
    setNewMessage('');
  };

  return (
    <div className="flex h-[70vh] bg-gray-100 rounded-2xl overflow-hidden">
      <div className="w-80 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
        <div className="space-y-2">
          {rooms.map(room => (
            <button key={room.id} onClick={() => setActiveRoom(room)} className={`w-full text-left px-4 py-2 rounded-lg ${activeRoom?.id === room.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}>
              {room.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            <div className="bg-white border-b p-4"><h2 className="text-xl font-bold">{activeRoom.name}</h2></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.username === user?.username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-lg px-4 py-2 ${msg.username === user?.username ? 'bg-purple-600 text-white' : 'bg-white shadow'}`}>
                    <div className="text-xs text-gray-500">{msg.username}</div>
                    <div>{msg.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="bg-white border-t p-4">
              <div className="flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Type a message..." />
                <button onClick={sendMessage} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Send</button>
              </div>
            </div>
          </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat room</div>}
      </div>
    </div>
  );
};
export default Chat;
