import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/toolbar";
import { TextEditor } from "@/components/editor/text-editor";

// Mock documents for UI demonstration
const MOCK_DOCUMENTS: Record<string, { id: string; title: string; content: string }> = {
  "1": {
    id: "1",
    title: "Product Roadmap 2025",
    content: "# Product Roadmap 2025\n\nOur vision for the upcoming year...\n\n## Q1 Goals\n- Launch new feature set\n- Improve performance\n- Expand to new markets",
  },
  "2": {
    id: "2",
    title: "Team Meeting Notes",
    content: "# Team Meeting - December 26, 2025\n\n## Attendees\n- John, Sarah, Mike, Lisa\n\n## Discussion Points\n- Project status update\n- Timeline adjustments\n- Resource allocation",
  },
  "3": {
    id: "3",
    title: "Design System Documentation",
    content: "# Design System\n\n## Colors\nOur color palette consists of...\n\n## Typography\nWe use Inter for headings and body text...",
  },
  "4": {
    id: "4",
    title: "API Documentation",
    content: "# API Documentation\n\n## Authentication\nAll API requests require authentication...\n\n## Endpoints\n- GET /api/documents\n- POST /api/documents",
  },
};

export default function DocumentEditorPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();

  const mockDoc = docId ? MOCK_DOCUMENTS[docId] : null;
  const [title, setTitle] = useState(mockDoc?.title || "Untitled Document");
  const [content, setContent] = useState(
    mockDoc?.content || "Start writing your collaborative document...\n\nThis is a real-time collaborative editor. Try typing something!"
  );
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setLastSaved(new Date());
  };

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);

      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for auto-save simulation
      const timeout = setTimeout(() => {
        setLastSaved(new Date());
        console.log("Auto-saved:", newContent.substring(0, 50));
      }, 2000);

      setSaveTimeout(timeout);
    },
    [saveTimeout]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  if (!docId) {
    navigate("/documents");
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorHeader
        documentId={docId}
        title={title}
        onTitleChange={handleTitleChange}
        lastSaved={lastSaved}
      />
      <EditorToolbar />
      <TextEditor content={content} onChange={handleContentChange} />
    </div>
  );
}
