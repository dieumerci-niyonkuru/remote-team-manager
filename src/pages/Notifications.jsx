import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Bell, 
  CheckCircle2, 
  PlusCircle, 
  MessageSquare, 
  AlertCircle, 
  UserPlus, 
  Clock, 
  Trash2,
  Check
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    const token = localStorage.getItem('rtm_access');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsHost = host.includes('localhost:5173') ? 'localhost:8000' : host;
    const wsUrl = `${protocol}://${wsHost}/ws/notifications/?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'send_notification') {
        setNotifications(prev => [data.notification, ...prev]);
        toast.success(`New: ${data.notification.verb}`);
      }
    };
    return () => socket.close();
  }, []);

  const connectWS = () => {
    const token = localStorage.getItem('rtm_access');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsHost = host.includes('localhost:5173') ? 'localhost:8000' : host;
    const wsUrl = `${protocol}://${wsHost}/ws/notifications/?token=${token}`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'send_notification') {
        setNotifications(prev => [data.notification, ...prev]);
        toast.success(`New: ${data.notification.verb}`);
      }
    };
    
    return socket;
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  const getIcon = (verb) => {
    if (verb.includes('task')) return <PlusCircle size={18} />;
    if (verb.includes('comment') || verb.includes('message')) return <MessageSquare size={18} />;
    if (verb.includes('invite')) return <UserPlus size={18} />;
    return <Bell size={18} />;
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Bell className="text-blue-500" size={32} />
            Notifications
          </h1>
          <p className="text-gray-400 mt-1 font-medium">Stay updated with your team's latest movements.</p>
        </div>
        {notifications.some(n => n.unread) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-2"
          >
            <Check size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 bg-gray-800/40 p-1 rounded-xl w-fit mb-8 border border-gray-800">
        <button 
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'unread' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          Unread
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-3xl p-20 text-center">
           <Bell className="text-gray-700 mx-auto mb-4" size={48} />
           <p className="text-gray-500 font-bold">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div 
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${n.unread ? 'bg-blue-600/5 border-blue-500/20' : 'bg-gray-800/20 border-gray-800 hover:border-gray-700'}`}
            >
              <div className="flex items-center gap-3 shrink-0">
                <Avatar user={{ username: n.actor_name, avatar_url: n.actor_avatar_url }} size={36} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 -ml-6 mt-6 border-2 border-[#0b1429] ${n.unread ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                  {getIcon(n.verb)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${n.unread ? 'text-white font-bold' : 'text-gray-400'}`}>
                  <span className="text-blue-400 font-black">{n.actor_name}</span> {n.verb}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600/10 hover:text-red-500 text-gray-600 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
