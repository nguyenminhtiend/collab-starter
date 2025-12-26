import type { WSContext, WSMessageReceive } from 'hono/ws';

// WebSocket event types
export type { WSContext };
export type WSMessageEvent = MessageEvent<WSMessageReceive>;

export interface WebSocketMessage {
  type: 'snapshot' | 'changes' | 'update' | 'ack';
}

export interface SnapshotMessage extends WebSocketMessage {
  type: 'snapshot';
  docId: string;
  state: number[]; // JSON-serializable array (converted from Uint8Array)
  timestamp: string;
}

export interface ChangesMessage extends WebSocketMessage {
  type: 'changes';
  docId: string;
  changes: Array<{
    id: string;
    data: number[]; // JSON-serializable array (converted from Uint8Array)
    userId: string | null;
    createdAt: string;
  }>;
}

export interface UpdateMessage extends WebSocketMessage {
  type: 'update';
  docId: string;
  data: Uint8Array;
  userId?: string;
}

export interface AckMessage extends WebSocketMessage {
  type: 'ack';
  docId: string;
  changeId: string;
}

export type IncomingMessage = UpdateMessage;
export type OutgoingMessage = SnapshotMessage | ChangesMessage | AckMessage;
