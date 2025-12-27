import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/toolbar";
import { TextEditor } from "@/components/editor/text-editor";
import { ConnectionStatusBadge } from "@/components/editor/connection-status";
import { useCollaboration } from "@/hooks/use-collaboration";
import { documentsApi } from "@/lib/api-client";
import type { Document } from "@collab/types";

export default function DocumentEditorPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track last saved time (for UI display only - Yjs saves automatically)
  const lastSavedRef = useRef<Date>(new Date());

  // Initialize WebSocket collaboration via Yjs
  const { status, ydoc, provider } = useCollaboration({
    docId: docId || "",
    userId: "019b589a-0000-7000-8000-000000000001", // TODO: Get from auth context
  });

  // Reconnect logic (handled by provider mostly, but exposed for manual trigger)
  const handleReconnect = useCallback(() => {
    if (provider) {
        provider.connect();
    }
  }, [provider]);

  // Fetch document details on mount (metadata only)
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
    <div className="h-screen flex flex-col bg-muted/30">
      <EditorHeader
        documentId={docId}
        title={document?.title || "Untitled Document"}
        onTitleChange={handleTitleChange}
        lastSaved={lastSavedRef.current}
      >
        <ConnectionStatusBadge status={status} onReconnect={handleReconnect} />
      </EditorHeader>

      {/* Centered toolbar */}
      <div className="max-w-4xl mx-auto w-full">
        <EditorToolbar />
      </div>

      {/* Editor area with paper-like styling */}
      <div className="flex-1 overflow-hidden py-6">
        <div className="h-full max-w-4xl mx-auto bg-background border border-border/50 rounded-lg shadow-sm">
          <TextEditor ydoc={ydoc} provider={provider} />
        </div>
      </div>
    </div>
  );
}
