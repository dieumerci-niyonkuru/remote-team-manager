import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWebSocket - A robust hook for managing WebSocket connections with exponential backoff.
 * 
 * @param {string} url - The WebSocket URL (can be relative to base WS host)
 * @param {object} options - Configuration options
 * @param {boolean} options.enabled - Whether to connect immediately (default: true)
 * @param {function} options.onMessage - Callback for new messages
 * @param {function} options.onOpen - Callback when connection opens
 * @param {function} options.onClose - Callback when connection closes
 * @param {number} options.maxRetries - Max reconnection attempts (default: 10)
 * @param {number} options.initialRetryDelay - Initial delay in ms (default: 1000)
 */
export default function useWebSocket(url, options = {}) {
  const { 
    enabled = true, 
    onMessage, 
    onOpen, 
    onClose, 
    maxRetries = 10, 
    initialRetryDelay = 1000 
  } = options;

  const [status, setStatus] = useState('closed'); // 'connecting', 'open', 'closed', 'error'
  const wsRef = useRef(null);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    
    // Construct full URL if it's a relative path
    let fullUrl = url;
    if (!url.startsWith('ws')) {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = import.meta.env.PROD 
        ? 'remote-team-manager-production.up.railway.app' 
        : 'localhost:8000';
      const token = localStorage.getItem('rtm_access');
      fullUrl = `${protocol}://${host}${url}${url.includes('?') ? '&' : '?'}token=${token}`;
    }

    try {
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;

      ws.onopen = (event) => {
        console.log(`WebSocket Connected: ${url}`);
        setStatus('open');
        retryCountRef.current = 0;
        if (onOpen) onOpen(event);
      };

      ws.onmessage = (event) => {
        if (onMessage) {
          try {
            const data = JSON.parse(event.data);
            onMessage(data, event);
          } catch (err) {
            onMessage(event.data, event);
          }
        }
      };

      ws.onclose = (event) => {
        setStatus('closed');
        if (onClose) onClose(event);
        
        // Reconnect logic
        if (enabled && retryCountRef.current < maxRetries) {
          const delay = Math.min(initialRetryDelay * Math.pow(2, retryCountRef.current), 30000);
          console.log(`WebSocket closed. Reconnecting in ${delay}ms... (Attempt ${retryCountRef.current + 1}/${maxRetries})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            retryCountRef.current += 1;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setStatus('error');
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
      setStatus('error');
    }
  }, [url, enabled, onMessage, onOpen, onClose, maxRetries, initialRetryDelay]);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [enabled, connect]);

  return {
    send,
    status,
    readyState: wsRef.current ? wsRef.current.readyState : WebSocket.CLOSED
  };
}
