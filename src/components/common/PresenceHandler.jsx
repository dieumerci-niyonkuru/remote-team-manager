import React from 'react';
import { useStore } from '../../store';
import useWebSocket from '../../hooks/useWebSocket';

export default function PresenceHandler({ children }) {
  const { isAuth, setOnlineUsers, setStatus } = useStore();

  const { status } = useWebSocket('/ws/presence/', {
    enabled: isAuth,
    onMessage: (data) => {
      if (data.type === 'presence_update') {
        setOnlineUsers(data.users);
      }
    }
  });

  // Sync hook status to global store
  React.useEffect(() => {
    setStatus(status);
  }, [status, setStatus]);

  return <>{children}</>;
}
