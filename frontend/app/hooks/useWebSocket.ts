'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: 'text' | 'error' | 'audio-chunk';
  data?: string;
  error?: string;
  audio?: string;
  paragraph?: string;
  chunkIndex?: number;
  totalChunks?: number;
  isLastChunk?: boolean;
}

export interface UseWebSocketReturn {
  sendMessage: (text: string) => void;
  sendStop: () => void;
  isConnected: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
  reconnect: () => void;
}

export function useWebSocket(
  url: string,
  onMessageCallback?: (message: WebSocketMessage) => void
): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoReconnectRef = useRef(true);
  const onMessageRef = useRef(onMessageCallback);
  const connectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessageCallback;
  }, [onMessageCallback]);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (onMessageRef.current) {
            onMessageRef.current(message);
          }

          setLastMessage(message);
        } catch {
          setError('Failed to parse server message');
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (shouldAutoReconnectRef.current && connectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, 3000);
        }
      };
    } catch {
      setError('Failed to create WebSocket connection');
      setIsConnected(false);
    }
  }, [url]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    // Defer connection to avoid setState in effect warning
    setTimeout(() => {
      connect();
    }, 0);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
      setLastMessage(null);
    } else {
      setError('WebSocket is not connected');
    }
  }, []);

  const sendStop = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    shouldAutoReconnectRef.current = false;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setLastMessage(null);
    setError(null);

    shouldAutoReconnectRef.current = true;
    setTimeout(() => {
      connectRef.current?.();
    }, 100);
  }, []);

  return { sendMessage, sendStop, isConnected, error, lastMessage, reconnect };
}
