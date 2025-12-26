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
    <ScrollArea className={cn("flex-1", className)}>
      <div className="min-h-full px-16 py-8">
        <textarea
          value={localContent}
          onChange={handleChange}
          className="w-full min-h-screen resize-none focus:outline-none bg-transparent text-foreground font-serif text-base leading-relaxed border-none"
          placeholder="Start writing your collaborative document..."
          style={{
            fontSize: "16px",
            lineHeight: "1.75",
          }}
        />
      </div>
    </ScrollArea>
  );
}

