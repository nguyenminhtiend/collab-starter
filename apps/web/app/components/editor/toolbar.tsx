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
} from "lucide-react";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  active?: boolean;
}

function ToolbarButton({ icon, tooltip, onClick, active }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={`
            hover:bg-primary/10 hover:text-primary transition-all duration-200
            ${active ? 'bg-primary/10 text-primary shadow-inner' : ''}
          `}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
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
      <div className="border border-border/50 bg-background/80 backdrop-blur-xl rounded-lg shadow-sm my-4">
        <div className="flex items-center justify-center gap-1 p-2 px-4">
          {/* History */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<Undo className="h-4 w-4" />}
              tooltip="Undo (⌘Z)"
            />
            <ToolbarButton
              icon={<Redo className="h-4 w-4" />}
              tooltip="Redo (⌘⇧Z)"
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-2 bg-border/50" />

          {/* Text formatting */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<Bold className="h-4 w-4" />}
              tooltip="Bold (⌘B)"
              onClick={() => toggleFormat('bold')}
              active={activeFormats.has('bold')}
            />
            <ToolbarButton
              icon={<Italic className="h-4 w-4" />}
              tooltip="Italic (⌘I)"
              onClick={() => toggleFormat('italic')}
              active={activeFormats.has('italic')}
            />
            <ToolbarButton
              icon={<Underline className="h-4 w-4" />}
              tooltip="Underline (⌘U)"
              onClick={() => toggleFormat('underline')}
              active={activeFormats.has('underline')}
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-2 bg-border/50" />

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

          <Separator orientation="vertical" className="h-6 mx-2 bg-border/50" />

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={<List className="h-4 w-4" />}
              tooltip="Bullet List"
              onClick={() => toggleFormat('list')}
              active={activeFormats.has('list')}
            />
            <ToolbarButton
              icon={<ListOrdered className="h-4 w-4" />}
              tooltip="Numbered List"
              onClick={() => toggleFormat('orderedList')}
              active={activeFormats.has('orderedList')}
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-2 bg-border/50" />

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
        </div>
      </div>
    </TooltipProvider>
  );
}
