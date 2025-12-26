import { useEffect, useRef, useState, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/collaboration.types';
import type {
  IncomingMessage,
  SnapshotMessage,
  ChangesMessage,
  AckMessage,
} from '@/lib/collaboration.types';

interface UseCollaborationOptions {
  docId: string;
  userId?: string;
  onSnapshot?: (snapshot: SnapshotMessage) => void;
  onChanges?: (changes: ChangesMessage) => void;
  onAck?: (ack: AckMessage) => void;
  onError?: (error: Error) => void;
}

interface UseCollaborationReturn {
  status: ConnectionStatus;
  sendUpdate: (content: string) => void;
  disconnect: () => void;
  reconnect: () => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useCollaboration({
  docId,
  userId,
  onSnapshot,
  onChanges,
  onAck,
  onError,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as IncomingMessage;

        switch (message.type) {
          case 'snapshot':
            onSnapshot?.(message);
            break;
          case 'changes':
            onChanges?.(message);
            break;
          case 'ack':
            onAck?.(message);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to parse message'));
      }
    },
    [onSnapshot, onChanges, onAck, onError],
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus(ConnectionStatus.CONNECTING);

    try {
      const ws = new WebSocket(`${WS_URL}/collaboration/${docId}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus(ConnectionStatus.CONNECTED);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = handleMessage;

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setStatus(ConnectionStatus.ERROR);
        const error = new Error('WebSocket connection error');
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setStatus(ConnectionStatus.DISCONNECTED);
        wsRef.current = null;

        // Auto-reconnect logic
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else {
          console.error('Max reconnection attempts reached');
          setStatus(ConnectionStatus.ERROR);
          onError?.(new Error('Failed to reconnect after maximum attempts'));
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus(ConnectionStatus.ERROR);
      onError?.(error instanceof Error ? error : new Error('Failed to create WebSocket'));
    }
  }, [docId, handleMessage, onError]);

  const sendUpdate = useCallback(
    (content: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);

        const message = {
          type: 'update',
          docId,
          data: Array.from(data), // Convert Uint8Array to regular array for JSON
          userId,
        };

        wsRef.current.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket is not open, cannot send update');
      }
    },
    [docId, userId],
  );

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    sendUpdate,
    disconnect,
    reconnect,
  };
}
