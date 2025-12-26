import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Share2, Check, Cloud } from "lucide-react";
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

  const getSaveStatus = (date?: Date) => {
    if (!date) return { text: "Not saved", icon: Cloud };
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 10) return { text: "Saving...", icon: Cloud };
    return { text: "Saved", icon: Check };
  };

  const saveStatus = getSaveStatus(lastSaved);
  const SaveIcon = saveStatus.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 px-4 h-14">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0 hover:bg-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Back to documents</TooltipContent>
            </Tooltip>

            <div className="h-5 w-px bg-border" />

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
                  className="h-9 text-base font-display font-medium bg-transparent border-primary/30 focus:border-primary"
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-2 group text-left w-full"
                >
                  <span className="font-display text-base font-medium truncate group-hover:text-primary transition-colors">
                    {title || "Untitled Document"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Status + Collaborators + Share */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Save status */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
              <SaveIcon className="h-3.5 w-3.5" />
              <span>{saveStatus.text}</span>
            </div>

            {/* Collaborators */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex -space-x-2">
                  <Avatar className="h-7 w-7 border-2 border-card">
                    <AvatarFallback className="text-xs font-medium gradient-warm text-white">
                      YO
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-card">
                    <AvatarFallback className="text-xs font-medium bg-secondary text-secondary-foreground">
                      +2
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>3 collaborators online</TooltipContent>
            </Tooltip>

            {/* Share button */}
            <Button size="sm" className="gap-2 btn-accent h-8 px-3">
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
