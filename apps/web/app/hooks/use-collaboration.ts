import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ConnectionStatus } from '@/lib/collaboration.types';

interface UseCollaborationOptions {
  docId: string;
  userId?: string; // Used for awareness
  initialContent?: string;
}

interface UseCollaborationReturn {
  status: ConnectionStatus;
  ydoc: Y.Doc;
  provider: WebsocketProvider | null;
}

export function useCollaboration({
  docId,
  userId,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING);
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    if (!docId) return;

    // Get WS URL
    const getUrl = () => {
      if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
      }
      return 'ws://localhost:3001';
    };

    const wsUrl = `${getUrl()}/collaboration`;
    console.log('Connecting to Yjs WS:', wsUrl, 'Room:', docId);

    // Initialize provider
    const newProvider = new WebsocketProvider(wsUrl, docId, ydoc, {
      connect: true,
      params: {}, // can pass auth params here
      WebSocketPolyfill: WebSocket, // Force standard WebSocket
      maxBackoffTime: 10000,
    });

    // Handle connection status
    newProvider.on('status', (event: { status: 'connecting' | 'connected' | 'disconnected' }) => {
      console.log('Yjs status:', event.status);
      setStatus(
        event.status === 'connected'
          ? ConnectionStatus.CONNECTED
          : event.status === 'connecting'
          ? ConnectionStatus.CONNECTING
          : ConnectionStatus.DISCONNECTED,
      );
    });

    // Handle connection error (y-websocket doesn't expose a clean error event,
    // but disconnections are handled above)
    // We can also monitor sync
    newProvider.on('sync', (isSynced: boolean) => {
      console.log('Yjs synced:', isSynced);
    });

    // Set awareness user info if provided
    if (userId) {
      newProvider.awareness.setLocalStateField('user', {
        id: userId,
        name: 'Anonymous', // TODO: Fetch real user name
        color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
      });
    }

    setProvider(newProvider);

    return () => {
      console.log('Disconnecting Yjs provider');
      newProvider.destroy();
    };
  }, [docId, ydoc, userId]);

  return {
    status,
    ydoc,
    provider,
  };
}
