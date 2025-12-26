import { z } from 'zod';

// Base document schema - matches database structure
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  title: z.string(),
  lastSnapshotAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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

// Response schemas
export const DocumentResponseSchema = DocumentSchema;

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

// Type exports
export type Document = z.infer<typeof DocumentSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type DocumentIdParam = z.infer<typeof DocumentIdParamSchema>;
