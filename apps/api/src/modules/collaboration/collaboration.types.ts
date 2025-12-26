export interface WebSocketMessage {
  type: 'snapshot' | 'changes' | 'update' | 'ack';
}

export interface SnapshotMessage extends WebSocketMessage {
  type: 'snapshot';
  docId: string;
  state: Uint8Array;
  timestamp: string;
}

export interface ChangesMessage extends WebSocketMessage {
  type: 'changes';
  docId: string;
  changes: Array<{
    id: string;
    data: Uint8Array;
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
