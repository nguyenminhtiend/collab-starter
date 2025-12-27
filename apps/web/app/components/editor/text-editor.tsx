import { useEditor, EditorContent } from '@tiptap/react';
import { type AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import './editor.css';

interface TextEditorProps {
  ydoc: Y.Doc;
  provider: WebsocketProvider | null;
  className?: string;
}

export function TextEditor({ ydoc, provider, className }: TextEditorProps) {
  // Build extensions array - only include CollaborationCaret when provider is ready
  const extensions = useMemo(() => {
    const baseExtensions: AnyExtension[] = [
      StarterKit.configure({}),
      Collaboration.configure({
        document: ydoc,
      }),
    ];

    // Only add CollaborationCaret when provider is available
    if (provider) {
      baseExtensions.push(
        CollaborationCaret.configure({
          provider: provider,
          user: provider.awareness.getLocalState()?.user || {
            name: 'Anonymous',
            color: '#f783ac',
          },
        })
      );
    }

    return baseExtensions;
  }, [ydoc, provider]);

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-screen',
      },
    },
  }, [extensions]);

  if (!provider) {
    return <div className="p-8 text-muted-foreground">Connecting to collaboration server...</div>;
  }

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="min-h-full px-16 py-8" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </ScrollArea>
  );
}
