import React, { useState, useEffect } from 'react';
import api from '../../api';
import EmojiCountryPicker from './EmojiCountryPicker';

const Chat = ({ workspace }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');

  useEffect(() => {
    if (workspace) fetchChannels();
  }, [workspace]);

  const fetchChannels = async () => {
    const res = await api.get(`/channels/?workspace=${workspace.id}`);
    setChannels(res.data);
  };

  useEffect(() => {
    if (activeChannel) {
      api.get(`/messages/?channel=${activeChannel.id}`).then(res => setMessages(res.data));
    }
  }, [activeChannel]);

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    await api.post('/channels/', { name: newChannelName, workspace: workspace.id });
    fetchChannels();
    setNewChannelName('');
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await api.post('/messages/', { channel: activeChannel.id, content: newMessage });
    setNewMessage('');
    const res = await api.get(`/messages/?channel=${activeChannel.id}`);
    setMessages(res.data);
  };

  const insertEmoji = (emoji) => setNewMessage(prev => prev + emoji);

  return (
    <div className="flex h-96 border rounded-lg overflow-hidden">
      <div className="w-1/3 bg-gray-50 dark:bg-gray-800 p-3">
        <h3 className="font-bold mb-2">Channels</h3>
        <input type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="New channel name" className="border w-full p-1 my-2 text-sm rounded" />
        <button onClick={createChannel} className="bg-green-600 text-white px-2 py-1 rounded text-sm w-full mb-3">Create Channel</button>
        <ul className="space-y-1">
          {channels.map(ch => (
            <li key={ch.id} onClick={() => setActiveChannel(ch)} className={`p-2 rounded cursor-pointer ${activeChannel?.id === ch.id ? 'bg-purple-200' : 'hover:bg-gray-200'}`}>{ch.name}</li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900">
        {activeChannel ? (
          <>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="border-b pb-1"><b>{msg.user?.username}:</b> {msg.content}</div>
              ))}
            </div>
            <div className="border-t p-2 flex gap-1 items-center">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 border rounded p-2" placeholder="Type a message... 😊🇷🇼" />
              <EmojiCountryPicker onSelect={insertEmoji} />
              <button onClick={sendMessage} className="bg-purple-600 text-white px-4 py-2 rounded">Send</button>
            </div>
          </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-400">Select a channel</div>}
      </div>
    </div>
  );
};
export default Chat;
