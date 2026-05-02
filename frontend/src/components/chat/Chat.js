import React, { useState, useEffect } from 'react';
import api from '../../api';
import EmojiCountryPicker from './EmojiCountryPicker';
import { FaThumbsUp, FaHeart, FaLaugh, FaSadTear, FaAngry, FaSmile } from 'react-icons/fa';

const Chat = ({ workspace }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const fetchChannels = async () => {
    const res = await api.get('/channels/');
    setChannels(res.data);
  };

  useEffect(() => {
    fetchChannels();
  }, [workspace]);

  useEffect(() => {
    if (activeChannel) {
      api.get(`/messages/?channel=${activeChannel.id}`).then(res => setMessages(res.data));
    }
  }, [activeChannel]);

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    await api.post('/channels/', { name: newChannelName, workspace: workspace.id, is_public: isPublic });
    fetchChannels();
    setNewChannelName('');
    setIsPublic(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await api.post('/messages/', { channel: activeChannel.id, content: newMessage });
    setNewMessage('');
    const res = await api.get(`/messages/?channel=${activeChannel.id}`);
    setMessages(res.data);
  };

  const addReaction = async (messageId, emoji) => {
    await api.post('/reactions/', { message: messageId, emoji });
    const res = await api.get(`/messages/?channel=${activeChannel.id}`);
    setMessages(res.data);
  };

  const insertEmoji = (emoji) => setNewMessage(prev => prev + emoji);

  const renderReactions = (msg) => {
    const reactions = msg.reactions || [];
    const grouped = reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([emoji, count]) => (
      <span key={emoji} className="inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs mr-1">
        {emoji} {count}
      </span>
    ));
  };

  return (
    <div className="flex h-96 border rounded-lg overflow-hidden">
      <div className="w-1/3 bg-gray-50 dark:bg-gray-800 p-3">
        <h3 className="font-bold mb-2">Channels</h3>
        <div className="mb-3">
          <input type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="New channel name" className="border w-full p-1 my-1 text-sm rounded" />
          <label className="flex items-center text-sm my-1">
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="mr-1" /> Public (visible to all)
          </label>
          <button onClick={createChannel} className="bg-green-600 text-white px-2 py-1 rounded text-sm w-full">Create Channel</button>
        </div>
        <ul className="space-y-1">
          {channels.map(ch => (
            <li key={ch.id} onClick={() => setActiveChannel(ch)} className={`p-2 rounded cursor-pointer ${activeChannel?.id === ch.id ? 'bg-purple-200' : 'hover:bg-gray-200'}`}>
              {ch.name} {ch.is_public && <span className="text-xs text-green-600">(public)</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900">
        {activeChannel ? (
          <>
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className="border-b pb-2">
                  <div><b>{msg.user?.username}:</b> {msg.content}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => addReaction(msg.id, '👍')} className="text-xs"><FaThumbsUp /></button>
                    <button onClick={() => addReaction(msg.id, '❤️')} className="text-xs"><FaHeart /></button>
                    <button onClick={() => addReaction(msg.id, '😂')} className="text-xs"><FaLaugh /></button>
                    <button onClick={() => addReaction(msg.id, '😢')} className="text-xs"><FaSadTear /></button>
                    <button onClick={() => addReaction(msg.id, '😡')} className="text-xs"><FaAngry /></button>
                    <button onClick={() => addReaction(msg.id, '😊')} className="text-xs"><FaSmile /></button>
                    {renderReactions(msg)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-2 flex gap-1 items-center">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 border rounded p-2" placeholder="Type message... use @username to mention" />
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
