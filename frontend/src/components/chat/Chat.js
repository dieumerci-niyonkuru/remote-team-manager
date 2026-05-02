import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import EmojiCountryPicker from './EmojiCountryPicker';
import { FaUsers, FaEnvelope, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';

const Chat = ({ workspace }) => {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeDM, setActiveDM] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [directMessages, setDirectMessages] = useState([]);
  const [selectedUserForDM, setSelectedUserForDM] = useState(null);

  const fetchChannels = async () => {
    if (!workspace) return;
    const res = await api.get(`/channels/?workspace=${workspace.id}`);
    setChannels(res.data);
  };
  const fetchDirectMessages = async () => {
    const res = await api.get('/direct-messages/');
    setDirectMessages(res.data);
  };

  useEffect(() => {
    fetchChannels();
    fetchDirectMessages();
  }, [workspace]);

  useEffect(() => {
    if (activeChannel) {
      api.get(`/messages/?channel=${activeChannel.id}`).then(res => setMessages(res.data));
      api.get(`/channels/${activeChannel.id}/members/`).then(res => setMembers(res.data));
    } else if (activeDM) {
      api.get(`/messages/?direct_message=${activeDM.id}`).then(res => setMessages(res.data));
    }
  }, [activeChannel, activeDM]);

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    await api.post('/channels/', { name: newChannelName, workspace: workspace.id, is_private: isPrivate });
    fetchChannels();
    setNewChannelName('');
    setIsPrivate(false);
  };

  const joinChannel = async (channelId) => {
    await api.post(`/channels/${channelId}/join/`);
    fetchChannels();
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (activeChannel) {
      await api.post('/messages/', { channel: activeChannel.id, content: newMessage });
    } else if (activeDM) {
      await api.post('/messages/', { direct_message: activeDM.id, content: newMessage });
    }
    setNewMessage('');
    // refresh messages
    if (activeChannel) api.get(`/messages/?channel=${activeChannel.id}`).then(res => setMessages(res.data));
    else if (activeDM) api.get(`/messages/?direct_message=${activeDM.id}`).then(res => setMessages(res.data));
  };

  const startDM = async (otherUserId) => {
    // Check if DM already exists
    let existing = directMessages.find(dm => dm.participants.some(p => p.id === otherUserId));
    if (existing) {
      setActiveDM(existing);
      setActiveChannel(null);
    } else {
      const res = await api.post('/direct-messages/', { other_user: otherUserId });
      setActiveDM(res.data);
      setActiveChannel(null);
      fetchDirectMessages();
    }
    setSelectedUserForDM(null);
  };

  const insertEmoji = (emoji) => setNewMessage(prev => prev + emoji);

  return (
    <div className="flex h-96">
      {/* Sidebar */}
      <div className="w-1/3 border-r p-2 overflow-auto">
        <div className="mb-4">
          <h3 className="font-bold">Channels</h3>
          <input type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="New channel name" className="border w-full p-1 my-2 text-sm" />
          <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} /> Private</label>
          <button onClick={createChannel} className="bg-green-600 text-white px-2 py-1 rounded text-sm w-full">Create Channel</button>
        </div>
        <ul className="space-y-1">
          {channels.map(ch => (
            <li key={ch.id} className="flex justify-between items-center">
              <button onClick={() => { setActiveChannel(ch); setActiveDM(null); }} className={`flex-1 text-left p-1 rounded ${activeChannel?.id === ch.id ? 'bg-purple-200' : ''}`}>
                {ch.name} {ch.is_private && '🔒'}
              </button>
              {!ch.is_member && <button onClick={() => joinChannel(ch.id)} className="text-blue-500 text-xs">Join</button>}
              <button onClick={() => { setActiveChannel(ch); setShowMembers(!showMembers); }} className="text-gray-500"><FaUsers /></button>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <h3 className="font-bold">Direct Messages</h3>
          <button onClick={() => setSelectedUserForDM(prompt('Enter user ID or email'))} className="text-purple-600 text-sm">New DM</button>
          {directMessages.map(dm => (
            <button key={dm.id} onClick={() => { setActiveDM(dm); setActiveChannel(null); }} className={`block w-full text-left p-1 ${activeDM?.id === dm.id ? 'bg-purple-200' : ''}`}>
              {dm.participants?.find(p => p.id !== user?.id)?.username}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="w-2/3 flex flex-col">
        {activeChannel && (
          <>
            <div className="border-b p-2 flex justify-between items-center">
              <span className="font-bold">{activeChannel.name}</span>
              <button onClick={() => setShowMembers(!showMembers)} className="text-gray-500"><FaUsers /></button>
            </div>
            {showMembers && (
              <div className="border-b p-2 max-h-40 overflow-auto">
                <h4>Members</h4>
                {members.map(m => <div key={m.user.id} className="flex justify-between items-center"><span>{m.user.username}</span>{m.is_pending && <span className="text-yellow-500">Pending</span>}</div>)}
              </div>
            )}
          </>
        )}
        {activeDM && <div className="border-b p-2 font-bold">DM with {activeDM.participants?.find(p => p.id !== user?.id)?.username}</div>}
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {messages.map((msg, idx) => (
            <div key={idx}><b>{msg.user?.username}:</b> {msg.content}</div>
          ))}
        </div>
        <div className="border-t p-2 flex gap-1 items-center">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 border p-1 rounded" placeholder="Type message... 😊🇷🇼" />
          <EmojiCountryPicker onSelect={insertEmoji} />
          <button onClick={sendMessage} className="bg-purple-600 text-white px-3 py-1 rounded">Send</button>
        </div>
      </div>
    </div>
  );
};
export default Chat;
