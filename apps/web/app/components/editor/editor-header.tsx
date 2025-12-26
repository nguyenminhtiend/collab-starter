import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Share2, Sparkles } from "lucide-react";
import { Link } from "react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorHeaderProps {
  documentId: string;
  title: string;
  onTitleChange: (title: string) => void;
  lastSaved?: Date;
}

export function EditorHeader({
  documentId,
  title,
  onTitleChange,
  lastSaved,
}: EditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleTitleSubmit = () => {
    onTitleChange(localTitle);
    setIsEditingTitle(false);
  };

  const formatLastSaved = (date?: Date) => {
    if (!date) return "Not saved";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 10) return "Saving...";
    if (diffSecs < 60) return "Saved just now";
    return `Saved ${Math.floor(diffSecs / 60)}m ago`;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border-b glass-card backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to documents</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSubmit();
                    if (e.key === "Escape") {
                      setLocalTitle(title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="text-lg font-semibold h-10 px-3 bg-background/50 border-primary/20 focus:border-primary"
                />
              ) : (
                <div>
                  <h1
                    className="text-xl font-bold cursor-pointer hover:gradient-text transition-all duration-300 truncate"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {title || "Untitled Document"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      {formatLastSaved(lastSaved)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xs font-semibold">
                        YO
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-semibold">
                        +2
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>3 collaborators online</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="gap-2 gradient-primary hover:opacity-90 transition-opacity shadow-lg">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline font-semibold">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share document</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
