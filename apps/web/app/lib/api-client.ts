import type { Document, CreateDocumentRequest, UpdateDocumentRequest } from './types';

// TODO: Update this with your actual API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    return this.fetch<Document[]>('/api/documents');
  }

  async getDocument(id: string): Promise<Document> {
    return this.fetch<Document>(`/api/documents/${id}`);
  }

  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    return this.fetch<Document>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    return this.fetch<Document>(`/api/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string): Promise<void> {
    return this.fetch<void>(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
