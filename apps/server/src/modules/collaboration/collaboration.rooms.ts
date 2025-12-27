import type { WSContext } from './collaboration.types';

/**
 * Manages WebSocket connections grouped by document ID
 */
export class RoomsManager {
  private rooms = new Map<string, Set<WSContext>>();

  /**
   * Add a WebSocket connection to a document room
   */
  addClient(docId: string, ws: WSContext): void {
    if (!this.rooms.has(docId)) {
      this.rooms.set(docId, new Set());
    }
    this.rooms.get(docId)!.add(ws);
  }

  /**
   * Remove a WebSocket connection from a document room
   */
  removeClient(docId: string, ws: WSContext): void {
    const clients = this.rooms.get(docId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.rooms.delete(docId);
      }
    }
  }

  /**
   * Get all clients in a document room
   */
  getClients(docId: string): Set<WSContext> | undefined {
    return this.rooms.get(docId);
  }

  /**
   * Broadcast a message to all clients in a room except the sender
   */
  broadcast(docId: string, message: string | Uint8Array, excludeWs?: WSContext): void {
    const clients = this.rooms.get(docId);
    if (clients) {
      clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === 1) {
          // 1 = OPEN
          client.send(message as any);
        }
      });
    }
  }

  /**
   * Get the number of clients in a room
   */
  getRoomSize(docId: string): number {
    return this.rooms.get(docId)?.size ?? 0;
  }
}
