import { hc } from 'hono/client';
import type { AppType } from '@api/app';
import type { Document, CreateDocument } from '@collab/types';

// API Base URL - defaults to localhost:3000 where the Hono API runs
// API Base URL - empty to use relative path (proxied)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create typed Hono RPC client
const client = hc<AppType>(API_BASE_URL);

// Export the RPC client for direct usage
export const rpcClient = client;

// Document API methods with proper type safety
export const documentsApi = {
  /**
   * Get all documents
   * @returns Array of documents
   */
  async getAll(): Promise<Document[]> {
    const response = await client.api.documents.$get();
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Get a document by ID
   * @param id - Document ID
   * @returns Document object
   */
  async getById(id: string): Promise<Document> {
    const response = await client.api.documents[':id'].$get({
      param: { id },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Create a new document
   * @param data - Document creation data (title, ownerId)
   * @returns Created document
   */
  async create(data: CreateDocument): Promise<Document> {
    const response = await client.api.documents.$post({
      json: data,
    });
    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`);
    }
    return await response.json();
  },
};
