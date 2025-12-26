import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/toolbar";
import { TextEditor } from "@/components/editor/text-editor";
import { ConnectionStatusBadge } from "@/components/editor/connection-status";
import { useCollaboration } from "@/hooks/use-collaboration";
import { documentsApi } from "@/lib/api-client";
import type { Document } from "@collab/types";
import type { SnapshotMessage, ChangesMessage, AckMessage } from "@/lib/collaboration.types";

export default function DocumentEditorPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSavedRef = useRef<Date>(new Date());

  // Handle snapshot from WebSocket
  const handleSnapshot = useCallback((snapshot: SnapshotMessage) => {
    console.log("Received snapshot:", snapshot);
    const decoder = new TextDecoder();
    const decodedContent = decoder.decode(snapshot.state);
    setContent(decodedContent);
  }, []);

  // Handle changes from WebSocket
  const handleChanges = useCallback((changes: ChangesMessage) => {
    console.log("Received changes:", changes);
    // For now, just log changes. In a real implementation,
    // you'd apply operational transforms or CRDT updates
    changes.changes.forEach((change) => {
      const decoder = new TextDecoder();
      const decodedChange = decoder.decode(change.data);
      console.log("Change:", decodedChange);
      // In production, apply the change to the document
      // For now, we'll refetch or use simple replacement
    });
  }, []);

  // Handle acknowledgment from WebSocket
  const handleAck = useCallback((ack: AckMessage) => {
    console.log("Received ack:", ack);
    lastSavedRef.current = new Date();
  }, []);

  // Handle WebSocket errors
  const handleError = useCallback((err: Error) => {
    console.error("WebSocket error:", err);
    setError(err.message);
  }, []);

  // Initialize WebSocket collaboration
  const { status, sendUpdate, reconnect } = useCollaboration({
    docId: docId || "",
    userId: "00000000-0000-0000-0000-000000000001", // TODO: Get from auth context
    onSnapshot: handleSnapshot,
    onChanges: handleChanges,
    onAck: handleAck,
    onError: handleError,
  });

  // Fetch document details on mount
  useEffect(() => {
    if (!docId) {
      navigate("/documents");
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const doc = await documentsApi.getById(docId);
        setDocument(doc as Document);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load document";
        setError(message);
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [docId, navigate]);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      if (!document) return;
      // TODO: Implement title update when backend PUT endpoint is ready
      // For now, just update local state
      setDocument({ ...document, title: newTitle });
    },
    [document]
  );

  // Debounce content changes before sending via WebSocket
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce WebSocket updates
      debounceTimeoutRef.current = setTimeout(() => {
        sendUpdate(newContent);
      }, 500);
    },
    [sendUpdate]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (!docId) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mb-6 glow-primary animate-pulse mx-auto">
            <span className="text-white text-2xl">📄</span>
          </div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 mx-auto">
            <span className="text-destructive text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-display mb-2">Error loading document</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate("/documents")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorHeader
        documentId={docId}
        title={document?.title || "Untitled Document"}
        onTitleChange={handleTitleChange}
        lastSaved={lastSavedRef.current}
      >
        <ConnectionStatusBadge status={status} onReconnect={reconnect} />
      </EditorHeader>
      <EditorToolbar />
      <TextEditor content={content} onChange={handleContentChange} />
    </div>
  );
}
