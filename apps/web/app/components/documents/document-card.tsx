import { FileText, MoreHorizontal, Edit3, Copy, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  id: string;
  title: string;
  updatedAt: string;
  ownerId: string;
}

export function DocumentCard({ id, title, updatedAt, ownerId }: DocumentCardProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Action: ${action} for document ${id}`);
  };

  return (
    <Link
      to={`/documents/${id}`}
      className="group block rounded-xl card-elevated hover-lift focus-ring transition-all duration-200"
    >
      <div className="p-5">
        {/* Top row: Icon and menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg gradient-warm flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-white" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => handleAction(e, "open")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, "rename")}>
                <Edit3 className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, "duplicate")}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => handleAction(e, "delete")}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-medium text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {title || "Untitled Document"}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatDate(updatedAt)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="truncate">{ownerId}</span>
        </div>
      </div>

      {/* Bottom accent line on hover */}
      <div className="h-0.5 w-0 group-hover:w-full bg-primary/60 transition-all duration-300 rounded-b-xl" />
    </Link>
  );
}
