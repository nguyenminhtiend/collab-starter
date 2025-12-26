import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateDocumentButtonProps {
  onCreate: () => void;
}

export function CreateDocumentButton({ onCreate }: CreateDocumentButtonProps) {
  return (
    <Button
      onClick={onCreate}
      size="lg"
      className="gap-2 btn-accent glow-primary"
    >
      <Plus className="h-5 w-5" />
      <span className="hidden sm:inline">New Document</span>
      <span className="sm:hidden">New</span>
    </Button>
  );
}
