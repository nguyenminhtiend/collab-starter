import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { DocumentCard } from "@/components/documents/document-card";
import { CreateDocumentButton } from "@/components/documents/create-document-button";
import { FileText, Search, ArrowUpDown, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Mock data for UI demonstration
const MOCK_DOCUMENTS = [
  {
    id: "1",
    ownerId: "user-1",
    title: "Product Roadmap 2025",
    lastSnapshotAt: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    ownerId: "user-1",
    title: "Team Meeting Notes",
    lastSnapshotAt: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    ownerId: "user-1",
    title: "Design System Documentation",
    lastSnapshotAt: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    ownerId: "user-1",
    title: "API Documentation",
    lastSnapshotAt: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

type SortOption = "updated" | "title" | "created";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");

  const handleCreateDocument = () => {
    const newDoc = {
      id: String(documents.length + 1),
      ownerId: "user-1",
      title: "Untitled Document",
      lastSnapshotAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments([newDoc, ...documents]);
    navigate(`/documents/${newDoc.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col gap-8 mb-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                <h1 className="text-5xl font-bold gradient-text">
                  My Documents
                </h1>
              </div>
              <p className="text-muted-foreground text-lg mt-2">
                Create and manage your collaborative documents
              </p>
            </div>
            <CreateDocumentButton onCreate={handleCreateDocument} />
          </div>

          {/* Search and Filter Bar with Glassmorphism */}
          {documents.length > 0 && (
            <div className="glass-card rounded-2xl p-4 shadow-xl">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 h-12 px-6 bg-background/50 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      Sort: {getSortLabel()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass">
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
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full gradient-primary p-8 mb-6 shadow-glow">
              <FileText className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl font-semibold mb-3">No documents yet</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Get started by creating your first document and unleash your creativity
            </p>
            <CreateDocumentButton onCreate={handleCreateDocument} />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-muted p-8 mb-6">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-semibold mb-3">No documents found</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Try adjusting your search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((doc, index) => (
              <div
                key={doc.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
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
      </div>
    </div>
  );
}
