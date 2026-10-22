"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PublishWatch, SaveWatch } from "@/action/watch";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { TextField } from "@/components/auth/TextField";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { Button, ButtonLink } from "@/components/ds/Button";
import { SendFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { CoverPicker } from "@/components/studio/CoverPicker";
import { ScheduleDialog } from "@/components/studio/ScheduleDialog";
import { compressImage } from "@/lib/compressImage";
import { cn } from "@/lib/utils";
import { youtubeId } from "@/lib/youtube";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 255;

export type EditableWatch = { id: string; title: string; description: string; videoUrl: string; imageUrl: string };

// A video's form: cover, title, description, YouTube link (previewed as soon as it's valid).
// New video: "Publier" opens the schedule dialog (now or later). Existing video (`watch`): cancel / save,
// only a newly chosen cover is sent. The duration is fetched from YouTube on the server.
export function WatchForm({ watch }: { watch?: EditableWatch }) {
  const router = useRouter();
  const [cover, setCover] = useState<File | null>(null);
  const [title, setTitle] = useState(watch?.title ?? "");
  const [description, setDescription] = useState(watch?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(watch?.videoUrl ?? "");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const videoId = youtubeId(videoUrl.trim());
  const ready = Boolean((cover || watch) && title.trim() && description.trim() && videoId);
  const dirty =
    !watch || Boolean(cover) || title !== watch.title || description !== watch.description || videoUrl.trim() !== watch.videoUrl;
  const cancelHref = watch ? `/author/watches/${watch.id}` : "/author/watches";

  async function formBody() {
    const body = new FormData();
    body.append("title", title.trim());
    body.append("description", description.trim());
    body.append("videoUrl", videoUrl.trim());
    if (cover) body.append("image", await compressImage(cover));
    return body;
  }

  function publish(publishAt: string | undefined) {
    if (!cover) return;
    startTransition(async () => {
      const body = await formBody();
      if (publishAt) body.append("publishAt", publishAt);
      const result = await PublishWatch({ body });
      if (!result.success) return void toast.error(result.error);
      toast.success(publishAt ? "Vidéo programmée" : "Vidéo publiée");
      router.push(`/author/watches/${result.watch.watchId}`);
    });
  }

  function save() {
    if (!watch) return;
    startTransition(async () => {
      const result = await SaveWatch({ watchId: watch.id, body: await formBody() });
      if (!result.success) return void toast.error(result.error);
      toast.success("Enregistré");
      router.push(`/author/watches/${watch.id}`);
    });
  }

  const submit = watch ? (
    <Button disabled={!ready || !dirty || pending} onClick={save}>
      Enregistrer
    </Button>
  ) : (
    <Button icon={SendFillIcon} disabled={!ready || pending} onClick={() => setOpen(true)}>
      Publier
    </Button>
  );

  return (
    <>
      <ArticleHeader
        backHref={cancelHref}
        breadcrumb={
          <Breadcrumb
            parent={{ label: "Mes vidéos", href: "/author/watches" }}
            current={watch ? title.trim() || "Modifier la vidéo" : "Nouvelle vidéo"}
          />
        }
        share={
          <span className="flex items-center gap-4">
            <ButtonLink href={cancelHref} variant="secondary">
              Annuler
            </ButtonLink>
            {submit}
          </span>
        }
      />
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-[2.5rem] pb-16 lg:px-8 lg:pt-[2.5rem]">
        <CoverPicker imageUrl={watch?.imageUrl ?? null} onChange={setCover} />
        <div className="flex flex-col gap-4">
          <textarea
            value={title}
            maxLength={TITLE_MAX}
            rows={1}
            onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
            placeholder="Titre de la vidéo"
            aria-label="Titre"
            className="field-sizing-content min-h-[3.6rem] w-full resize-none bg-transparent text-[2.4rem] leading-[1.2] font-bold tracking-[-0.072rem] text-ink outline-none placeholder:text-placeholder lg:text-[3.2rem] lg:tracking-[-0.096rem]"
          />
          <Counter value={title.length} max={TITLE_MAX} />
        </div>
        <div className="flex flex-col gap-4">
          <textarea
            value={description}
            maxLength={DESCRIPTION_MAX}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Quelques mots sur la vidéo, affichés sous le lecteur"
            aria-label="Description"
            className="field-sizing-content min-h-[5rem] w-full resize-none rounded-card bg-field p-[1.4rem] type-body-lg text-ink outline-none placeholder:text-placeholder focus:ring-2 focus:ring-focus-ring"
          />
          <Counter value={description.length} max={DESCRIPTION_MAX} />
        </div>
        <TextField
          label="Lien YouTube (youtube.com ou youtu.be)"
          type="url"
          inputMode="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          error={videoUrl.trim() && !videoId ? "Ce n'est pas un lien YouTube valide." : undefined}
        />
        <AnimatePresence initial={false}>
          {videoId && (
            <motion.div
              key={videoId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden rounded-card bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                  title="Aperçu de la vidéo"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 size-full border-0"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="sticky bottom-0 z-20 -mx-4 mt-auto flex border-t border-divider bg-white p-4 lg:hidden [&>*]:flex-1">
        {submit}
      </div>
      {!watch && <ScheduleDialog open={open} onOpenChange={setOpen} title="Publier la vidéo" pending={pending} onConfirm={publish} />}
    </>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return <span className={cn("self-end text-[1.2rem] tabular-nums", value >= max ? "text-danger" : "text-faint")}>{value}/{max}</span>;
}
