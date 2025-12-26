import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { DocumentCard } from "@/components/documents/document-card";
import { CreateDocumentButton } from "@/components/documents/create-document-button";
import { FileText, Search, ArrowUpDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { documentsApi } from "@/lib/api-client";

type Document = {
  id: string;
  ownerId: string;
  title: string;
  lastSnapshotAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SortOption = "updated" | "title" | "created";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await documentsApi.getAll();
        setDocuments(data as Document[]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load documents';
        setError(message);
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    try {
      // TODO: Get actual user ID from auth context
      const newDoc = await documentsApi.create({
        title: "Untitled Document",
        ownerId: "00000000-0000-0000-0000-000000000001", // Placeholder user ID
      });
      setDocuments([newDoc as Document, ...documents]);
      navigate(`/documents/${newDoc.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create document';
      console.error('Error creating document:', err);
      alert(message);
    }
  };

  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [documents, searchQuery, sortBy]);

  const getSortLabel = () => {
    switch (sortBy) {
      case "title":
        return "Title";
      case "created":
        return "Created";
      case "updated":
      default:
        return "Last edited";
    }
  };

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Subtle grid background */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />

      <div className="relative">
        {/* Top accent bar */}
        <div className="h-1 w-full gradient-warm" />

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <header className="mb-12 animate-fade-up">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-3">
                  Documents
                </h1>
                <p className="text-muted-foreground text-lg">
                  Create, edit, and collaborate in real-time
                </p>
              </div>
              <CreateDocumentButton onCreate={handleCreateDocument} />
            </div>
          </header>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-up">
              <p className="font-medium">Error loading documents</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
              <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mb-6 glow-primary animate-pulse">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              {documents.length > 0 && (
                <div className="mb-8 animate-fade-up stagger-1">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="gap-2 h-11 px-4 bg-card border-border hover:bg-secondary"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="hidden sm:inline">Sort:</span> {getSortLabel()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setSortBy("updated")}>
                          Last edited
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("created")}>
                          Created date
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("title")}>
                          Title
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}

              {/* Content */}
              {documents.length === 0 ? (
                <EmptyState onCreateDocument={handleCreateDocument} />
              ) : filteredDocuments.length === 0 ? (
                <NoResultsState />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc, index) => (
                    <div
                      key={doc.id}
                      className={`animate-fade-up stagger-${Math.min(index + 1, 5)}`}
                    >
                      <DocumentCard
                        id={doc.id}
                        title={doc.title}
                        updatedAt={doc.updatedAt}
                        ownerId={doc.ownerId}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreateDocument }: { onCreateDocument: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mb-6 glow-primary">
        <FileText className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-display mb-2">No documents yet</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Start your first document and bring your ideas to life
      </p>
      <Button onClick={onCreateDocument} size="lg" className="gap-2 btn-accent">
        <Plus className="h-5 w-5" />
        Create Document
      </Button>
    </div>
  );
}

function NoResultsState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-display mb-2">No matches found</h2>
      <p className="text-muted-foreground max-w-sm">
        Try adjusting your search terms
      </p>
    </div>
  );
}
