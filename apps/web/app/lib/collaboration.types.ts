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
  state: number[]; // JSON-serialized array (convert to Uint8Array for decoding)
  timestamp: string;
}

export interface Change {
  id: string;
  data: number[]; // JSON-serialized array (convert to Uint8Array for decoding)
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
  data: number[]; // JSON-serialized array for sending to server
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
