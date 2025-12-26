import type { Context } from 'hono';
import type { WSContext } from 'hono/ws';
import type { Container } from '../../core/container';
import * as collaborationService from './collaboration.service';
import type { IncomingMessage, OutgoingMessage } from './collaboration.types';

export class CollaborationHandler {
  private documentRooms = new Map<string, Set<any>>();

  constructor(private container: Container) {}

  createWebSocketHandlers(c: Context) {
    const { db, logger } = this.container;
    const docId = c.req.param('docId');

    return {
      onOpen: (_event: any, ws: any) => {
        this.handleOpen(docId, ws);
      },

      onMessage: (event: any, ws: any) => {
        this.handleMessage(docId, event, ws);
      },

      onClose: (_event: any, ws: any) => {
        this.handleClose(docId, ws);
      },

      onError: (event: any, _ws: any) => {
        this.handleError(docId, event);
      },
    };
  }

  private handleOpen(docId: string, ws: any) {
    const { db, logger } = this.container;
    logger.info({ docId }, 'WebSocket connection opened');

    // Add client to document room
    if (!this.documentRooms.has(docId)) {
      this.documentRooms.set(docId, new Set());
    }
    this.documentRooms.get(docId)!.add(ws);

    // Send initial snapshot and changes
    (async () => {
      try {
        const snapshot = await collaborationService.getLatestSnapshot(db, docId);

        if (snapshot) {
          const snapshotMessage: OutgoingMessage = {
            type: 'snapshot',
            docId,
            state: new Uint8Array(snapshot.state),
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
                data: new Uint8Array(change.data),
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

  private handleMessage(docId: string, event: any, ws: any) {
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
            const clients = this.documentRooms.get(docId);
            if (clients) {
              const changesMessage: OutgoingMessage = {
                type: 'changes',
                docId,
                changes: [
                  {
                    id: savedChange.id,
                    data: new Uint8Array(savedChange.data),
                    userId: savedChange.userId,
                    createdAt: savedChange.createdAt.toISOString(),
                  },
                ],
              };

              const messageStr = JSON.stringify(changesMessage);
              clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) {
                  // 1 = OPEN
                  client.send(messageStr);
                }
              });
            }

            // Send ack back to sender
            const ackMessage: OutgoingMessage = {
              type: 'ack',
              docId,
              changeId: savedChange.id,
            };
            ws.send(JSON.stringify(ackMessage));
          } catch (error) {
            logger.error({ error, docId }, 'Error processing update');
          }
        })();
      }
    } catch (error) {
      logger.error({ error, docId }, 'Error parsing message');
    }
  }

  private handleClose(docId: string, ws: any) {
    const { logger } = this.container;
    logger.info({ docId }, 'WebSocket connection closed');

    // Remove client from document room
    const clients = this.documentRooms.get(docId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.documentRooms.delete(docId);
      }
    }
  }

  private handleError(docId: string, event: any) {
    const { logger } = this.container;
    logger.error({ error: event.error, docId }, 'WebSocket error');
  }
}
