export interface Document {
  id: string;
  ownerId: string;
  title: string;
  lastSnapshotAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title?: string;
  ownerId: string;
}

export interface UpdateDocumentRequest {
  title?: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
}
