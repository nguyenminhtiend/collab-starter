import { hc } from 'hono/client';
import type { AppType } from '@api/app';

// API Base URL - defaults to localhost:3000 where the Hono API runs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create typed Hono RPC client
const client = hc<AppType>(API_BASE_URL);

// Export the RPC client for direct usage
export const rpcClient = client;

// Document API methods with proper type safety
export const documentsApi = {
  async getAll() {
    const response = await client.api.v1.documents.$get();
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    return await response.json();
  },

  async getById(id: string) {
    const response = await client.api.v1.documents[':id'].$get({
      param: { id },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    return await response.json();
  },

  async create(data: { title?: string; ownerId: string }) {
    const response = await client.api.v1.documents.$post({
      json: data,
    });
    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`);
    }
    return await response.json();
  },
};
