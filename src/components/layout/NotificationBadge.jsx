import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import * as tokens from '../../styles/tokens';
import api from '../../services/api';
import { useStore } from '../../store';

export default function NotificationBadge() {
  const { user } = useStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/');
      const unread = (res.data?.data || res.data || []).filter(n => n.unread).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const token = localStorage.getItem('rtm_access');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsHost = host.includes('localhost:5173') ? 'localhost:8000' : host;
    const wsUrl = `${protocol}://${wsHost}/ws/notifications/${user.id}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'notification_message') {
        setUnreadCount(prev => prev + 1);
      }
    };
    return () => ws.close();
  }, [user]);

  return (
    <div 
      className="relative cursor-pointer hover:scale-110 transition-transform p-2 bg-gray-800/40 border border-gray-800"
      style={{ borderRadius: tokens.radius.md }}
    >
      <Bell size={20} className="text-gray-400" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0a0f1d] shadow-lg shadow-rose-600/20">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}
