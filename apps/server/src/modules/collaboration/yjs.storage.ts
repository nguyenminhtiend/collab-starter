import type { DbClient } from '@collab/db';
import * as Y from 'yjs';
import { documentUpdates, snapshots } from '@collab/db';
import { eq, desc, and, gt, inArray, ne } from 'drizzle-orm';

export class YjsStorage {
  constructor(private db: DbClient) {}

  /**
   * Persist a document update to the database.
   */
  async persistUpdate(docId: string, update: Uint8Array): Promise<void> {
    const buffer = Buffer.from(update);
    console.log(`[BE-DB] Persisting update to DB. DocId: ${docId}, Buffer Size: ${buffer.length}`);
    await this.db.insert(documentUpdates).values({
      docId,
      update: buffer,
    });
  }

  /**
   * Load a Y.Doc from the database.
   */
  async loadDocument(docId: string): Promise<Y.Doc> {
    const ydoc = new Y.Doc();
    const latestSnapshot = await this.db.query.snapshots.findFirst({
      where: eq(snapshots.docId, docId),
      orderBy: [desc(snapshots.createdAt)],
    });

    if (latestSnapshot) {
      Y.applyUpdate(ydoc, new Uint8Array(latestSnapshot.state));
    }

    const updates = await this.db.query.documentUpdates.findMany({
      where: (u, { eq, and, gt }) => {
        if (latestSnapshot) {
          return and(eq(u.docId, docId), gt(u.createdAt, latestSnapshot.createdAt));
        }
        return eq(u.docId, docId);
      },
      orderBy: (u, { asc }) => [asc(u.createdAt)],
    });

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
   * Check if a new snapshot is needed.
   * Returns true if there are updates more recent than the latest snapshot.
   */
  async shouldSnapshot(docId: string): Promise<boolean> {
    const latestSnapshot = await this.db.query.snapshots.findFirst({
      where: eq(snapshots.docId, docId),
      orderBy: [desc(snapshots.createdAt)],
    });

    if (!latestSnapshot) {
      const update = await this.db.query.documentUpdates.findFirst({
        where: eq(documentUpdates.docId, docId),
      });
      return !!update;
    }

    const newerUpdate = await this.db.query.documentUpdates.findFirst({
      where: and(
        eq(documentUpdates.docId, docId),
        gt(documentUpdates.createdAt, latestSnapshot.createdAt),
      ),
    });

    return !!newerUpdate;
  }

  /**
   * Compaction: Load updates, merge into new snapshot, and delete old data.
   * This handles the race condition by only deleting the updates that were actually merged.
   */
  async compact(docId: string): Promise<void> {
    const ydoc = new Y.Doc();

    await this.db.transaction(async (tx) => {
      // 1. Load Snapshot
      const latestSnapshot = await tx.query.snapshots.findFirst({
        where: eq(snapshots.docId, docId),
        orderBy: [desc(snapshots.createdAt)],
      });

      if (latestSnapshot) {
        Y.applyUpdate(ydoc, new Uint8Array(latestSnapshot.state));
      }

      // 2. Load Updates & Capture IDs
      const updates = await tx.query.documentUpdates.findMany({
        where: (u, { eq, and, gt }) => {
          if (latestSnapshot) {
            return and(eq(u.docId, docId), gt(u.createdAt, latestSnapshot.createdAt));
          }
          return eq(u.docId, docId);
        },
        orderBy: (u, { asc }) => [asc(u.createdAt)],
      });

      if (updates.length === 0) return;

      // 3. Apply
      Y.transact(ydoc, () => {
        for (const u of updates) {
          Y.applyUpdate(ydoc, new Uint8Array(u.update));
        }
      });

      // 4. Save New Snapshot
      const newState = Y.encodeStateAsUpdate(ydoc);
      const [insertedSnapshot] = await tx
        .insert(snapshots)
        .values({
          docId,
          state: Buffer.from(newState),
        })
        .returning();

      // 5. Delete Old Snapshots (keep only the new one)
      await tx
        .delete(snapshots)
        .where(and(eq(snapshots.docId, docId), ne(snapshots.id, insertedSnapshot.id)));

      // 6. Delete Merged Updates
      // By filtering by ID, we ensure we don't delete any update that arrived
      // after step 2 (concurrent insert).
      const updateIds = updates.map((u) => u.id);
      if (updateIds.length > 0) {
        await tx.delete(documentUpdates).where(inArray(documentUpdates.id, updateIds));
      }
    });
  }
}
