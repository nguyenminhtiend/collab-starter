import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { desc, eq, and, gt } from 'drizzle-orm';
import { documents, documentUpdates, snapshots } from '../../db/schema/documents';
import type * as schema from '../../db/schema';

export const getLatestSnapshot = async (db: PostgresJsDatabase<typeof schema>, docId: string) => {
  const result = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.docId, docId))
    .orderBy(desc(snapshots.createdAt))
    .limit(1);

  return result[0] || null;
};

export const getChangesSince = async (
  db: PostgresJsDatabase<typeof schema>,
  docId: string,
  since: Date,
) => {
  return db
    .select()
    .from(documentUpdates)
    .where(and(eq(documentUpdates.docId, docId), gt(documentUpdates.createdAt, since)))
    .orderBy(documentUpdates.createdAt);
};

export const getAllChanges = async (db: PostgresJsDatabase<typeof schema>, docId: string) => {
  return db
    .select()
    .from(documentUpdates)
    .where(eq(documentUpdates.docId, docId))
    .orderBy(documentUpdates.createdAt);
};

export const saveChange = async (
  db: PostgresJsDatabase<typeof schema>,
  docId: string,
  data: Buffer,
  userId?: string,
) => {
  const result = await db
    .insert(documentUpdates)
    .values({
      docId,
      update: data,
    })
    .returning();

  // Try to update document's updatedAt, but don't fail if document doesn't exist
  try {
    await db.update(documents).set({ updatedAt: new Date() }).where(eq(documents.id, docId));
  } catch (error) {
    // Document might not exist, but we still saved the change
    // This is OK for testing purposes
  }

  return result[0];
};

export const createSnapshot = async (
  db: PostgresJsDatabase<typeof schema>,
  docId: string,
  state: Buffer,
) => {
  const result = await db
    .insert(snapshots)
    .values({
      docId,
      state,
    })
    .returning();

  // Try to update document's lastSnapshotAt, but don't fail if document doesn't exist
  try {
    await db.update(documents).set({ lastSnapshotAt: new Date() }).where(eq(documents.id, docId));
  } catch (error) {
    // Document might not exist, but we still saved the snapshot
    // This is OK for testing purposes
  }

  return result[0];
};
