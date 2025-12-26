/**
 * WebSocket collaboration message types for the frontend
 * These mirror the backend types for type-safe communication
 */

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export interface WebSocketMessage {
  type: 'snapshot' | 'changes' | 'update' | 'ack';
}

export interface SnapshotMessage extends WebSocketMessage {
  type: 'snapshot';
  docId: string;
  state: Uint8Array;
  timestamp: string;
}

export interface Change {
  id: string;
  data: Uint8Array;
  userId: string | null;
  createdAt: string;
}

export interface ChangesMessage extends WebSocketMessage {
  type: 'changes';
  docId: string;
  changes: Change[];
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

export type IncomingMessage = SnapshotMessage | ChangesMessage | AckMessage;
export type OutgoingMessage = UpdateMessage;

/**
 * Configuration for WebSocket connection
 */
export interface CollaborationConfig {
  wsUrl: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}
