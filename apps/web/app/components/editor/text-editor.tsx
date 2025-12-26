import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export function TextEditor({ content, onChange, className }: TextEditorProps) {
  const [localContent, setLocalContent] = useState(content);

  // Sync local content with prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onChange(newContent);
  };

  return (
    <ScrollArea className={cn("flex-1 bg-background", className)}>
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-10">
        <textarea
          value={localContent}
          onChange={handleChange}
          className={cn(
            "w-full min-h-[calc(100vh-180px)] resize-none",
            "bg-transparent text-foreground",
            "text-base leading-7 tracking-[-0.01em]",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none border-none",
            "selection:bg-primary/20"
          )}
          placeholder="Start writing..."
        />
      </div>
    </ScrollArea>
  );
}
