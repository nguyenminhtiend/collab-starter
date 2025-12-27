import { eq, desc } from 'drizzle-orm';
import { NotFoundError } from '../../core/errors';
import { documents } from '@collab/db';
import type { DbClient } from '@collab/db';
import type { CreateDocument } from './documents.schemas';

export const getDocumentById = async (db: DbClient, id: string) => {
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);

  const document = result[0];
  if (!document) {
    throw new NotFoundError('Document', id);
  }
  return document;
};

export const createDocument = async (db: DbClient, data: CreateDocument) => {
  const result = await db.insert(documents).values(data).returning();
  return result[0]!;
};

export const getAllDocuments = async (db: DbClient) => {
  return await db.select().from(documents).orderBy(desc(documents.updatedAt));
};
