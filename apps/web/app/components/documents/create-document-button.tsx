import { useState } from "react";
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
      className="gap-2"
    >
      <Plus className="h-5 w-5" />
      Create New Document
    </Button>
  );
}
