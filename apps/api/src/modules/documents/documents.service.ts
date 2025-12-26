import { eq } from 'drizzle-orm';
import { NotFoundError } from '../../core/errors';
import { documents } from '../../db/schema/documents';
import type { Database } from '../../db/types';
import type { CreateDocument } from './documents.schemas';

export const getDocumentById = async (db: Database, id: string) => {
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);

  const document = result[0];
  if (!document) {
    throw new NotFoundError('Document', id);
  }
  return document;
};

export const createDocument = async (db: Database, data: CreateDocument) => {
  const result = await db.insert(documents).values(data).returning();
  return result[0]!;
};
