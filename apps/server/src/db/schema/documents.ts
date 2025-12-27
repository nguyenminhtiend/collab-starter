import { pgTable, uuid, varchar, timestamp, customType, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});

export const documents = pgTable('documents', {
  id: uuid('id')
    .default(sql`uuidv7()`)
    .primaryKey(),
  ownerId: uuid('owner_id').notNull(),
  title: varchar('title', { length: 255 }).default('Untitled').notNull(),
  lastSnapshotAt: timestamp('last_snapshot_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const documentUpdates = pgTable(
  'document_updates',
  {
    id: uuid('id')
      .default(sql`uuidv7()`)
      .primaryKey(),
    docId: uuid('doc_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    update: bytea('update').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_updates_fetch').on(table.docId)],
);

export const snapshots = pgTable(
  'snapshots',
  {
    id: uuid('id')
      .default(sql`uuidv7()`)
      .primaryKey(),
    docId: uuid('doc_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    state: bytea('state').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_snapshots_latest').on(table.docId, table.createdAt)],
);
