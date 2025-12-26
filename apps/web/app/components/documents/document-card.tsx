import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MoreVertical, Edit, Copy, Trash2, ExternalLink } from "lucide-react";
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
    return d.toLocaleDateString();
  };

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Action: ${action} for document ${id}`);
  };

  return (
    <Card className="glass-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 group relative overflow-hidden border-primary/10">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <Link to={`/documents/${id}`} className="block relative z-10">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl gradient-primary p-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-semibold group-hover:gradient-text transition-all duration-300 line-clamp-2">
                  {title || "Untitled Document"}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 h-8 w-8 hover:bg-primary/10"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass">
                    <DropdownMenuItem onClick={(e) => handleAction(e, "open")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction(e, "rename")}>
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction(e, "duplicate")}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => handleAction(e, "delete")}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="mt-2 flex items-center gap-2">
                <span className="text-sm">Edited {formatDate(updatedAt)}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              Draft
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground truncate">
              {ownerId}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
