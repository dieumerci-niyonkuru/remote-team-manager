import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import api from '../../api';

const NotificationBell = ({ count, notifications, onMarkRead }) => {
  const [open, setOpen] = useState(false);
  const markRead = async (id) => {
    await api.post(`/notifications/${id}/mark_read/`);
    onMarkRead();
  };
  const markAllRead = async () => {
    await api.post('/notifications/mark_all_read/');
    onMarkRead();
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <FaBell />
        {count > 0 && <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-600 text-white text-xs rounded-full px-1">{count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-10 p-2">
          <div className="flex justify-between border-b pb-1"><span className="font-bold">Notifications</span><button onClick={markAllRead} className="text-xs text-blue-600">Mark all read</button></div>
          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 && <p className="p-2 text-gray-500">No notifications</p>}
            {notifications.map(n => (
              <div key={n.id} className={`p-2 border-b ${n.unread ? 'bg-blue-50' : ''}`}>
                <div>{n.actor_name} {n.verb}</div>
                <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</div>
                {n.unread && <button onClick={() => markRead(n.id)} className="text-xs text-blue-600">Mark read</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationBell;
