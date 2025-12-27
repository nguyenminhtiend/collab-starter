import type { Context } from 'hono';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import type { Container } from '../../core/container';
import type { WSContext, WSMessageEvent } from './collaboration.types';
import { RoomsManager } from './collaboration.rooms';
import { YjsStorage } from './yjs.storage';

const messageSync = 0;
const messageAwareness = 1;

export class CollaborationHandler {
  private roomsManager = new RoomsManager();
  private storage: YjsStorage;

  constructor(private container: Container) {
    this.storage = new YjsStorage(container.db);
  }

  createWebSocketHandlers(c: Context) {
    const docId = c.req.param('docId');

    return {
      onOpen: (_event: Event, ws: WSContext) => {
        this.handleOpen(docId, ws);
      },

      onMessage: (event: WSMessageEvent, ws: WSContext) => {
        this.handleMessage(docId, event, ws);
      },

      onClose: (_event: CloseEvent, ws: WSContext) => {
        this.handleClose(docId, ws);
      },

      onError: (event: Event, _ws: WSContext) => {
        this.handleError(docId, event);
      },
    };
  }

  private handleOpen(docId: string, ws: WSContext) {
    const { logger } = this.container;
    logger.info({ docId }, 'WebSocket connection opened');

    this.roomsManager.addClient(docId, ws);

    (async () => {
      // 1. Load the document from DB
      const doc = await this.storage.loadDocument(docId);

      // 2. Start Sync Protocol STEP 1: Send the state vector to client
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, doc);
      const message = encoding.toUint8Array(encoder);
      console.log('Sending message', message);
      ws.send(message);
    })();
  }

  private handleMessage(docId: string, event: WSMessageEvent, ws: WSContext) {
    const { logger } = this.container;

    // Yjs protocols operate on binary data
    // Hono/node-ws might give us a Buffer or ArrayBuffer or string
    let buffer: Uint8Array;
    if (event.data instanceof ArrayBuffer) {
      buffer = new Uint8Array(event.data);
    } else if (Buffer.isBuffer(event.data)) {
      buffer = new Uint8Array(event.data);
    } else {
      // Should handle string case check if needed, but Yjs usually sends binary
      // If it's a string, it might be legacy JSON or base64?
      // For now assuming binary protocol
      return;
    }

    try {
      const decoder = decoding.createDecoder(buffer);
      const encoder = encoding.createEncoder();
      const messageType = decoding.readVarUint(decoder);

      // Handle Sync Protocol
      if (messageType === messageSync) {
        encoding.writeVarUint(encoder, messageSync);

        // We need to load the doc to handle sync steps
        // Ideally we cache this doc in memory (e.g. in RoomsManager)
        // effectively making this stateful server for active docs
        // For this implementation, we load/reconstruct it.
        // Optimization: In a real app complexity increases here:
        // we'd want to keep the Y.Doc instance in memory for as long as users are connected.
        (async () => {
          const doc = await this.storage.loadDocument(docId);

          // Setup listener to capture *new* updates generated during this sync interaction
          // (e.g. if client sent updates, we need to save them)
          doc.on('update', async (update) => {
            await this.storage.persistUpdate(docId, update);

            // Broadcast update to other clients
            // (Optimization: exclude sender if possible, though Yjs handles echo efficiently)
            const replyEncoder = encoding.createEncoder();
            encoding.writeVarUint(replyEncoder, messageSync);
            syncProtocol.writeUpdate(replyEncoder, update);
            const reply = encoding.toUint8Array(replyEncoder);
            this.roomsManager.broadcast(docId, reply, ws); // Broadcast to OTHERS
          });

          syncProtocol.readSyncMessage(decoder, encoder, doc, null);

          // If the sync protocol generated a response (e.g. SyncStep2 or Update), send it back
          if (encoding.length(encoder) > 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
        })();
      }
      // Handle Awareness Protocol
      else if (messageType === messageAwareness) {
        // Just broadcast awareness messages to everyone else
        // We don't persist awareness state to DB usually
        const buff = encoding.toUint8Array(encoder); // this might be empty as we read from decoder
        // Re-encode or just forward raw buffer if we knew the slice?
        // Safer to broadcast raw message content if we can, but simpler here:
        this.roomsManager.broadcast(docId, buffer, ws);
      }
    } catch (error) {
      logger.error({ error, docId }, 'Error processing message');
    }
  }

  private async handleClose(docId: string, ws: WSContext) {
    const { logger } = this.container;
    logger.info({ docId }, 'WebSocket connection closed');

    this.roomsManager.removeClient(docId, ws);

    // When last client disconnects, check if we need to snapshot
    if (this.roomsManager.getRoomSize(docId) === 0) {
      const shouldSnapshot = await this.storage.shouldSnapshot(docId);

      if (shouldSnapshot) {
        logger.info({ docId }, 'Last client disconnected, pending updates found. Compacting...');
        try {
          // Compact: Merge updates into snapshot and clean up
          await this.storage.compact(docId);
          logger.info({ docId }, 'Compaction successful');
        } catch (error) {
          logger.error({ error, docId }, 'Failed to compact');
        }
      }
    }
  }

  private handleError(docId: string, event: Event) {
    const error = event instanceof ErrorEvent ? event.error : event;
    this.container.logger.error({ error, docId }, 'WebSocket error');
  }
}
