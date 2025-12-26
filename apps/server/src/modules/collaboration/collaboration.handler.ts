import type { Context } from 'hono';
import type { Container } from '../../core/container';
import * as collaborationService from './collaboration.service';
import type {
  IncomingMessage,
  OutgoingMessage,
  WSContext,
  WSMessageEvent,
} from './collaboration.types';
import { RoomsManager } from './collaboration.rooms';

export class CollaborationHandler {
  private roomsManager = new RoomsManager();

  constructor(private container: Container) {}

  createWebSocketHandlers(c: Context) {
    const { db, logger } = this.container;
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
    const { db, logger } = this.container;
    logger.info({ docId }, 'WebSocket connection opened');

    // Add client to document room
    this.roomsManager.addClient(docId, ws);

    // Send initial snapshot and changes
    (async () => {
      try {
        const snapshot = await collaborationService.getLatestSnapshot(db, docId);
        logger.info({ docId, hasSnapshot: !!snapshot }, 'Checked for existing snapshot');

        if (snapshot) {
          // Send existing snapshot
          const snapshotMessage: OutgoingMessage = {
            type: 'snapshot',
            docId,
            state: Array.from(new Uint8Array(snapshot.state)),
            timestamp: snapshot.createdAt.toISOString(),
          };
          ws.send(JSON.stringify(snapshotMessage));

          // Send changes since snapshot
          const changes = await collaborationService.getChangesSince(db, docId, snapshot.createdAt);

          if (changes.length > 0) {
            const changesMessage: OutgoingMessage = {
              type: 'changes',
              docId,
              changes: changes.map((change) => ({
                id: change.id,
                data: Array.from(new Uint8Array(change.data)),
                userId: change.userId,
                createdAt: change.createdAt.toISOString(),
              })),
            };
            ws.send(JSON.stringify(changesMessage));
          }
        } else {
          // No snapshot - send empty snapshot first, then all changes
          const emptySnapshotMessage: OutgoingMessage = {
            type: 'snapshot',
            docId,
            state: [],
            timestamp: new Date().toISOString(),
          };
          ws.send(JSON.stringify(emptySnapshotMessage));

          // Fetch and send all changes for this document
          const changes = await collaborationService.getAllChanges(db, docId);
          logger.info({ docId, changesCount: changes.length }, 'Fetched all changes (no snapshot)');

          if (changes.length > 0) {
            const changesMessage: OutgoingMessage = {
              type: 'changes',
              docId,
              changes: changes.map((change) => ({
                id: change.id,
                data: Array.from(new Uint8Array(change.data)),
                userId: change.userId,
                createdAt: change.createdAt.toISOString(),
              })),
            };
            ws.send(JSON.stringify(changesMessage));
          }
        }
      } catch (error) {
        logger.error({ error, docId }, 'Error sending initial data');
      }
    })();
  }

  private handleMessage(docId: string, event: WSMessageEvent, ws: WSContext) {
    const { db, logger } = this.container;

    try {
      const message = JSON.parse(event.data.toString()) as IncomingMessage;

      if (message.type === 'update') {
        // Save the change to the database
        (async () => {
          try {
            const buffer = Buffer.from(message.data);
            const savedChange = await collaborationService.saveChange(
              db,
              docId,
              buffer,
              message.userId,
            );

            // Broadcast to all clients in the room except sender
            const changesMessage: OutgoingMessage = {
              type: 'changes',
              docId,
              changes: [
                {
                  id: savedChange.id,
                  data: Array.from(new Uint8Array(savedChange.data)),
                  userId: savedChange.userId,
                  createdAt: savedChange.createdAt.toISOString(),
                },
              ],
            };

            const messageStr = JSON.stringify(changesMessage);
            this.roomsManager.broadcast(docId, messageStr, ws);

            // Send ack back to sender
            const ackMessage: OutgoingMessage = {
              type: 'ack',
              docId,
              changeId: savedChange.id,
            };
            ws.send(JSON.stringify(ackMessage));
          } catch (error) {
            logger.error({ error });
            logger.error({ error, docId }, 'Error processing update');
          }
        })();
      }
    } catch (error) {
      logger.error({ error, docId }, 'Error parsing message');
    }
  }

  private handleClose(docId: string, ws: WSContext) {
    const { logger } = this.container;
    logger.info({ docId }, 'WebSocket connection closed');

    // Remove client from document room
    this.roomsManager.removeClient(docId, ws);
  }

  private handleError(docId: string, event: Event) {
    const { logger } = this.container;
    const error = event instanceof ErrorEvent ? event.error : event;
    logger.error({ error, docId }, 'WebSocket error');
  }
}
