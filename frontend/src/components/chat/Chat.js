import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import EmojiCountryPicker from './EmojiCountryPicker';

const Chat = ({ workspace }) => {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');

  useEffect(() => {
    if (workspace) {
      api.get(`/channels/?workspace=${workspace.id}`).then(res => setChannels(res.data));
    }
  }, [workspace]);

  useEffect(() => {
    if (activeChannel) {
      api.get(`/messages/?channel=${activeChannel.id}`).then(res => setMessages(res.data));
    }
  }, [activeChannel]);

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    await api.post('/channels/', { name: newChannelName, workspace: workspace.id });
    const res = await api.get(`/channels/?workspace=${workspace.id}`);
    setChannels(res.data);
    setNewChannelName('');
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await api.post('/messages/', { channel: activeChannel.id, content: newMessage });
    setNewMessage('');
    const res = await api.get(`/messages/?channel=${activeChannel.id}`);
    setMessages(res.data);
  };

  const insertEmojiOrFlag = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  return (
    <div className="flex h-96">
      <div className="w-1/3 border-r p-2">
        <h3 className="font-bold">Channels</h3>
        <input type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="New channel name" className="border w-full p-1 my-2 text-sm" />
        <button onClick={createChannel} className="bg-green-600 text-white px-2 py-1 rounded text-sm w-full">Create Channel</button>
        <ul className="mt-2">
          {channels.map(ch => <li key={ch.id} onClick={() => setActiveChannel(ch)} className={`p-1 cursor-pointer ${activeChannel?.id === ch.id ? 'bg-purple-200' : ''}`}>{ch.name}</li>)}
        </ul>
      </div>
      <div className="w-2/3 flex flex-col">
        {activeChannel && (
          <>
            <div className="flex-1 overflow-auto p-2 space-y-1">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <b>{msg.user?.username}:</b> {msg.content}
                </div>
              ))}
            </div>
            <div className="border-t p-2 flex gap-1 items-center">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 border p-1" placeholder="Type message... 😍🇷🇼" />
              <EmojiCountryPicker onSelect={insertEmojiOrFlag} />
              <button onClick={sendMessage} className="bg-purple-600 text-white px-3 py-1 rounded">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Chat;
