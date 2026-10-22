"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { CreateDraft } from "@/action/reads";
import { Button } from "@/components/ds/Button";
import { QuillPenLineIcon } from "@/components/icons/mingcute";

// Creates an empty draft and opens it in the editor.
export default function NewReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      icon={QuillPenLineIcon}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await CreateDraft();
          if (!result.success) return void toast.error(result.error);
          router.push(`/author/reads/draft/${result.read.readDraftId}`);
        })
      }
    >
      {pending ? "Création…" : "Nouvel article"}
    </Button>
  );
}
