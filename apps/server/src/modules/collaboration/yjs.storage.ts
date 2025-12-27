import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as Y from 'yjs';
import { documentUpdates, snapshots } from '../../db/schema/documents';
import { eq, desc } from 'drizzle-orm';
import type * as schema from '../../db/schema';

export class YjsStorage {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  /**
   * Persist a document update to the database.
   * This is called whenever a client sends an update.
   */
  async persistUpdate(docId: string, update: Uint8Array): Promise<void> {
    await this.db.insert(documentUpdates).values({
      docId,
      update: Buffer.from(update),
    });
  }

  /**
   * Load a Y.Doc from the database.
   * Reconstructs the document state by applying the latest snapshot (if any)
   * and all subsequent updates.
   */
  async loadDocument(docId: string): Promise<Y.Doc> {
    const ydoc = new Y.Doc();

    // 1. Get the latest snapshot
    const latestSnapshot = await this.db.query.snapshots.findFirst({
      where: eq(snapshots.docId, docId),
      orderBy: [desc(snapshots.createdAt)],
    });

    if (latestSnapshot) {
      Y.applyUpdate(ydoc, new Uint8Array(latestSnapshot.state));
    }

    // 2. Get all updates since the snapshot (or all updates if no snapshot)
    const updates = await this.db.query.documentUpdates.findMany({
      where: (u: any, { eq, and, gt }) => {
        if (latestSnapshot) {
          return and(eq(u.docId, docId), gt(u.createdAt, latestSnapshot.createdAt));
        }
        return eq(u.docId, docId);
      },
      orderBy: (u: any, { asc }) => [asc(u.createdAt)],
    });

    // Applying updates outside of transaction loop for simplicity as Yjs is synchronous
    if (updates.length > 0) {
      Y.transact(ydoc, () => {
        for (const updateRecord of updates) {
          Y.applyUpdate(ydoc, new Uint8Array(updateRecord.update));
        }
      });
    }

    return ydoc;
  }

  /**
   * Create a snapshot of the current document state.
   * This compresses the history into a single state vector.
   */
  async snapshot(docId: string, ydoc: Y.Doc): Promise<void> {
    const state = Y.encodeStateAsUpdate(ydoc);
    await this.db.insert(snapshots).values({
      docId,
      state: Buffer.from(state),
    });
  }
}
