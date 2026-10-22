"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RescheduleRead, UnscheduleRead } from "@/action/reads";
import { RescheduleWatch } from "@/action/watch";
import { Button } from "@/components/ds/Button";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { SendFillIcon, TimeFillIcon } from "@/components/icons/mingcute";
import { ScheduleDialog } from "./ScheduleDialog";

// For a scheduled read or video: publish now, move the date, or (reads) back to the drafts.
export function ScheduledActions({ kind, id, publishAt }: { kind: "read" | "watch"; id: string; publishAt: string }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"date" | "draft" | null>(null);
  const [pending, startTransition] = useTransition();

  const reschedule = (when: string | undefined) =>
    startTransition(async () => {
      const result = kind === "read" ? await RescheduleRead({ readId: id, publishAt: when }) : await RescheduleWatch({ watchId: id, publishAt: when });
      if (!result.success) return void toast.error(result.error);
      toast.success(when ? "Nouvelle date enregistrée" : "Publié");
      setDialog(null);
      router.refresh();
    });

  const backToDraft = () =>
    startTransition(async () => {
      const result = await UnscheduleRead({ readId: id });
      if (!result.success) return void toast.error(result.error);
      toast.success("Remis en brouillon");
      router.push(`/author/reads/draft/${result.readDraftId}`);
    });

  return (
    <div className="flex flex-wrap gap-4">
      <Button icon={SendFillIcon} disabled={pending} onClick={() => reschedule(undefined)}>
        Publier maintenant
      </Button>
      <Button variant="secondary" icon={TimeFillIcon} disabled={pending} onClick={() => setDialog("date")}>
        Changer la date
      </Button>
      {kind === "read" && (
        <Button variant="secondary" disabled={pending} onClick={() => setDialog("draft")}>
          Remettre en brouillon
        </Button>
      )}
      <ScheduleDialog
        open={dialog === "date"}
        onOpenChange={(open) => setDialog(open ? "date" : null)}
        title="Changer la date"
        initial={publishAt}
        allowNow={false}
        pending={pending}
        onConfirm={reschedule}
      />
      <Modal
        open={dialog === "draft"}
        onOpenChange={(open) => setDialog(open ? "draft" : null)}
        title="Remettre en brouillon ?"
        description="L'article ne sera plus programmé. Vous le retrouverez dans vos brouillons, prêt à être modifié."
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" disabled={pending} onClick={backToDraft}>
              Remettre en brouillon
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </div>
  );
}
