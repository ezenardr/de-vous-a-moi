"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PublishRead } from "@/action/reads";
import { Button } from "@/components/ds/Button";
import { SendFillIcon } from "@/components/icons/mingcute";
import { ScheduleDialog } from "@/components/studio/ScheduleDialog";

// "Publier" on the preview: now, or scheduled. Then the article's studio page.
export function PublishButton({ readDraftId }: { readDraftId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const publish = (publishAt: string | undefined) =>
    startTransition(async () => {
      const result = await PublishRead({ readDraftId, publishAt });
      if (!result.success) return void toast.error(result.error);
      toast.success(result.scheduled ? "Article programmé" : "Article publié");
      router.push(`/author/reads/${result.readId}`);
    });

  return (
    <>
      <Button icon={SendFillIcon} onClick={() => setOpen(true)}>
        Publier
      </Button>
      <ScheduleDialog open={open} onOpenChange={setOpen} pending={pending} onConfirm={publish} />
    </>
  );
}
