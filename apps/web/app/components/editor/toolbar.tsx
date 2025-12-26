import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  shortcut?: string;
  onClick?: () => void;
  active?: boolean;
}

function ToolbarButton({ icon, tooltip, shortcut, onClick, active }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn(
            "h-8 w-8 transition-colors",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{tooltip}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded font-mono">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <Separator orientation="vertical" className="h-5 mx-1" />;
}

export function EditorToolbar() {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const toggleFormat = (format: string) => {
    const newFormats = new Set(activeFormats);
    if (newFormats.has(format)) {
      newFormats.delete(format);
    } else {
      newFormats.add(format);
    }
    setActiveFormats(newFormats);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-14 z-40">
        <div className="flex items-center gap-0.5 px-4 py-1.5 overflow-x-auto">
          {/* History */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<Undo className="h-4 w-4" />}
              tooltip="Undo"
              shortcut="⌘Z"
            />
            <ToolbarButton
              icon={<Redo className="h-4 w-4" />}
              tooltip="Redo"
              shortcut="⌘⇧Z"
            />
          </div>

          <ToolbarDivider />

          {/* Text formatting */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<Bold className="h-4 w-4" />}
              tooltip="Bold"
              shortcut="⌘B"
              onClick={() => toggleFormat("bold")}
              active={activeFormats.has("bold")}
            />
            <ToolbarButton
              icon={<Italic className="h-4 w-4" />}
              tooltip="Italic"
              shortcut="⌘I"
              onClick={() => toggleFormat("italic")}
              active={activeFormats.has("italic")}
            />
            <ToolbarButton
              icon={<Underline className="h-4 w-4" />}
              tooltip="Underline"
              shortcut="⌘U"
              onClick={() => toggleFormat("underline")}
              active={activeFormats.has("underline")}
            />
          </div>

          <ToolbarDivider />

          {/* Headings */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<Heading1 className="h-4 w-4" />}
              tooltip="Heading 1"
            />
            <ToolbarButton
              icon={<Heading2 className="h-4 w-4" />}
              tooltip="Heading 2"
            />
            <ToolbarButton
              icon={<Heading3 className="h-4 w-4" />}
              tooltip="Heading 3"
            />
          </div>

          <ToolbarDivider />

          {/* Lists & Quote */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<List className="h-4 w-4" />}
              tooltip="Bullet List"
              onClick={() => toggleFormat("list")}
              active={activeFormats.has("list")}
            />
            <ToolbarButton
              icon={<ListOrdered className="h-4 w-4" />}
              tooltip="Numbered List"
              onClick={() => toggleFormat("orderedList")}
              active={activeFormats.has("orderedList")}
            />
            <ToolbarButton
              icon={<Quote className="h-4 w-4" />}
              tooltip="Quote"
            />
          </div>

          <ToolbarDivider />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<AlignLeft className="h-4 w-4" />}
              tooltip="Align Left"
            />
            <ToolbarButton
              icon={<AlignCenter className="h-4 w-4" />}
              tooltip="Align Center"
            />
            <ToolbarButton
              icon={<AlignRight className="h-4 w-4" />}
              tooltip="Align Right"
            />
          </div>

          <ToolbarDivider />

          {/* Link */}
          <ToolbarButton
            icon={<Link className="h-4 w-4" />}
            tooltip="Insert Link"
            shortcut="⌘K"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
