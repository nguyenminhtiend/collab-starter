import { z } from 'zod';

// Base document schema - matches database structure
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  title: z.string(),
  lastSnapshotAt: z.string().datetime().nullable().or(z.date().nullable()),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

// Schema for creating a new document
export const CreateDocumentSchema = z.object({
  ownerId: z.string().uuid('Invalid owner ID format'),
  title: z.string().min(1).max(255).optional().default('Untitled'),
});

// Schema for document ID parameter
export const DocumentIdParamSchema = z.object({
  id: z.string().uuid('Invalid document ID format'),
});

// Type exports
export type Document = {
  id: string;
  ownerId: string;
  title: string;
  lastSnapshotAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type DocumentIdParam = z.infer<typeof DocumentIdParamSchema>;
