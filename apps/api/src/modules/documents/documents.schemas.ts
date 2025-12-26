import { z } from 'zod';
import {
  DocumentSchema,
  CreateDocumentSchema,
  DocumentIdParamSchema,
  type Document,
  type CreateDocument,
  type DocumentIdParam,
} from '@collab/types';

// Re-export for convenience
export { DocumentSchema, CreateDocumentSchema, DocumentIdParamSchema };
export type { Document, CreateDocument, DocumentIdParam };

// Response schemas
export const DocumentResponseSchema = DocumentSchema;

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});
