import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store';

export default function PresenceHandler({ children }) {
  const { isAuth, setOnlineUsers } = useStore();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!isAuth) {
      if (wsRef.current) wsRef.current.close();
      return;
    }

    const connectPresence = () => {
      const token = localStorage.getItem('rtm_access');
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = import.meta.env.PROD ? 'remote-team-manager-production.up.railway.app' : 'localhost:8000';
      const wsUrl = `${protocol}://${host}/ws/presence/?token=${token}`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'presence_update') {
            setOnlineUsers(data.users);
          }
        } catch (err) {
          console.error('Presence data error:', err);
        }
      };

      wsRef.current.onclose = () => {
        if (isAuth) {
          setTimeout(connectPresence, 5000);
        }
      };
    };

    connectPresence();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [isAuth, setOnlineUsers]);

  return <>{children}</>;
}
