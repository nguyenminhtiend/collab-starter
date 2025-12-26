import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Container } from '../../core/container';
import * as documentsService from './documents.service';
import { CreateDocumentSchema, DocumentIdParamSchema } from './documents.schemas';

export const createDocumentsRoutes = (container: Container) => {
  const { db } = container;

  return new Hono()
    .get('/:id', zValidator('param', DocumentIdParamSchema), async (c) => {
      const { id } = c.req.valid('param');
      const document = await documentsService.getDocumentById(db, id);
      return c.json(document);
    })

    .post('/', zValidator('json', CreateDocumentSchema), async (c) => {
      const data = c.req.valid('json');
      const document = await documentsService.createDocument(db, data);
      return c.json(document, 201);
    });
};

export type DocumentsRoutes = ReturnType<typeof createDocumentsRoutes>;
