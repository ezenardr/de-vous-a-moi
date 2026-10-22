"use client";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Editor as TinyEditor } from "tinymce";
import { DeleteDraft, SaveDraft, SaveRead } from "@/action/reads";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { Button, ButtonLink } from "@/components/ds/Button";
import { categoryStyle } from "@/components/ds/CategoryBadge";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { EyeFillIcon, InformationFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { CATEGORY_NAMES } from "@/lib/categories";
import { compressImage } from "@/lib/compressImage";
import { cn } from "@/lib/utils";
import { CoverPicker } from "./CoverPicker";
import { imageFileToDataUrl, uploadInlineImages } from "./inlineImages";

// TinyMCE is heavy and browser-only: loaded on the client, after the page.
const BundledEditor = dynamic(() => import("@/components/shared/BundledEditor"), {
  ssr: false,
  loading: () => <div className="h-[50rem] animate-pulse rounded-card bg-field" />,
});

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 150;

export type EditorArticle = {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl: string | null;
};

// The studio editor, for a draft (mode "draft": delete / save / preview) or a published read
// (mode "read": cancel / save). Cover (CoverPicker, cropped 16:9), category, title and description with counters,
// then the rich text. Saving keeps you here; Ctrl/Cmd+S saves; leaving with unsaved changes asks first.
export function ArticleEditor({ mode, article }: { mode: "draft" | "read"; article: EditorArticle }) {
  const router = useRouter();
  const editorRef = useRef<TinyEditor | null>(null);
  const [title, setTitle] = useState(article.title);
  const [description, setDescription] = useState(article.description);
  const [category, setCategory] = useState(article.category);
  const [cover, setCover] = useState<File | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const touch = () => setDirty(true);

  // Leaving with unsaved changes: the browser asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Saves; returns the saved fields (or null). Drafts may be incomplete; published reads may not.
  const save = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return null;
    try {
      const body = new FormData();
      body.append("title", title.trim());
      body.append("description", description.trim());
      body.append("category", category);
      body.append("content", await uploadInlineImages(editor.getContent()));
      if (cover) body.append("image", await compressImage(cover));
      const result = mode === "draft" ? await SaveDraft({ readDraftId: article.id, body }) : await SaveRead({ readId: article.id, body });
      if (!result.success) {
        toast.error(result.error);
        return null;
      }
      setDirty(false);
      setSavedAt(new Date());
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "L'enregistrement a échoué.");
      return null;
    }
  }, [title, description, category, cover, mode, article.id]);

  const saveNow = useCallback(() => {
    startTransition(async () => {
      if (await save()) toast.success("Enregistré");
    });
  }, [save]);

  // Ctrl/Cmd+S, in the page and inside the editor frame.
  const saveRef = useRef(saveNow);
  useEffect(() => {
    saveRef.current = saveNow;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function preview() {
    startTransition(async () => {
      const result = await save();
      if (!result || !("draft" in result)) return;
      const d = result.draft;
      if (!d.imageUrl || !d.title || !d.description || !d.category || !d.content) {
        return void toast.error("Ajoutez une couverture, une catégorie, un titre, une description et du contenu pour prévisualiser.");
      }
      router.push(`/author/reads/draft/${article.id}/preview`);
    });
  }

  function removeDraft() {
    startTransition(async () => {
      const result = await DeleteDraft({ readDraftId: article.id });
      if (!result.success) return void toast.error(result.error);
      setDirty(false);
      toast.success("Brouillon supprimé");
      router.push("/author/reads?tab=drafts");
    });
  }

  const status = pending
    ? "Enregistrement…"
    : dirty
      ? "Modifications non enregistrées"
      : savedAt
        ? `Enregistré à ${savedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
        : null;

  const listHref = mode === "draft" ? "/author/reads?tab=drafts" : `/author/reads/${article.id}`;

  return (
    <>
      <ArticleHeader
        backHref={listHref}
        breadcrumb={
          <Breadcrumb
            parent={{ label: "Mes articles", href: "/author/reads" }}
            current={title.trim() || (mode === "draft" ? "Nouvel article" : "Modifier l'article")}
          />
        }
        share={
          // Mobile: the actions live in the bottom bar.
          <span className="hidden items-center gap-4 lg:flex">
            <AnimatePresence mode="wait" initial={false}>
              {status && (
                <motion.span
                  key={status}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className={cn("hidden type-body xl:inline", dirty ? "text-subtle" : "text-faint")}
                  role="status"
                >
                  {status}
                </motion.span>
              )}
            </AnimatePresence>
            {mode === "draft" ? (
              <>
                <Button variant="secondary" disabled={pending} onClick={() => setConfirmDelete(true)} className="text-danger">
                  Supprimer
                </Button>
                <Button variant="secondary" disabled={pending} onClick={saveNow}>
                  Enregistrer
                </Button>
                <Button icon={EyeFillIcon} disabled={pending} onClick={preview}>
                  Aperçu
                </Button>
              </>
            ) : (
              <>
                <ButtonLink variant="secondary" href={listHref}>
                  Annuler
                </ButtonLink>
                <Button disabled={pending || !dirty} onClick={saveNow}>
                  Enregistrer
                </Button>
              </>
            )}
          </span>
        }
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-[2.5rem] pb-16 lg:px-8 lg:pt-[2.5rem]">
        <CoverPicker
          imageUrl={article.imageUrl}
          onChange={(file) => {
            setCover(file);
            touch();
          }}
        />

        {/* Category */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 type-body font-medium text-subtle">Catégorie</legend>
          <div role="radiogroup" className="flex flex-wrap gap-4">
            {CATEGORY_NAMES.map((name) => {
              const { icon: Icon, color } = categoryStyle(name);
              const selected = category === name;
              return (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setCategory(name);
                    touch();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-[0.6rem] rounded-chip border px-[1.4rem] py-[0.8rem] type-body font-medium transition-colors",
                    selected ? "border-primary-base bg-secondary-100 text-primary-base" : "border-divider bg-white text-ink hover:bg-field",
                  )}
                >
                  <Icon size={16} className={selected ? "text-primary-base" : color} />
                  {name}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Title and description */}
        <div className="flex flex-col gap-4">
          <textarea
            value={title}
            maxLength={TITLE_MAX}
            rows={1}
            onChange={(e) => {
              setTitle(e.target.value.replace(/\n/g, " "));
              touch();
            }}
            placeholder="Titre de l'article"
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
            onChange={(e) => {
              setDescription(e.target.value);
              touch();
            }}
            placeholder="Une courte description, affichée sur les cartes et dans les partages"
            aria-label="Description"
            className="field-sizing-content min-h-[5rem] w-full resize-none rounded-card bg-field p-[1.4rem] type-body-lg text-ink outline-none placeholder:text-placeholder focus:ring-2 focus:ring-focus-ring"
          />
          <Counter value={description.length} max={DESCRIPTION_MAX} />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-[0.4rem] text-[1.2rem] text-subtle">
            <InformationFillIcon size={12} />
            Les « Intertitres » forment la table des matières de l&apos;article.
          </p>
          <div className="overflow-hidden rounded-card border border-divider">
            <BundledEditor
              onInit={(_, editor) => {
                editorRef.current = editor;
                editor.addShortcut("meta+s", "Enregistrer", () => saveRef.current());
              }}
              initialValue={article.content}
              onDirty={touch}
              onEditorChange={(_, editor) => {
                if (editor.isDirty()) touch();
              }}
              init={{
                height: 640,
                min_height: 400,
                menubar: false,
                branding: false,
                promotion: false,
                // Only what the public page keeps (server/content/article.ts sanitises tables away, for instance).
                plugins: ["advlist", "autolink", "lists", "link", "image", "charmap", "searchreplace", "visualblocks", "code", "fullscreen", "wordcount"],
                block_formats: "Paragraphe=p; Intertitre=h2; Sous-intertitre=h3",
                toolbar: "undo redo | blocks | bold italic | bullist numlist blockquote | link image | removeformat | fullscreen",
                paste_data_images: true,
                automatic_uploads: false,
                file_picker_types: "image",
                file_picker_callback: (callback) => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (file) callback(await imageFileToDataUrl(file), { title: file.name });
                  };
                  input.click();
                },
                content_style:
                  "body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333; max-width: 700px; margin: 1.5rem auto; padding: 0 1rem } h2 { font-size: 22px } h3 { font-size: 18px } img { max-width: 100%; height: auto }",
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile: the actions also sit at the bottom of the screen. */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-auto flex gap-4 border-t border-divider bg-white p-4 lg:hidden">
        {mode === "draft" ? (
          <>
            <Button variant="secondary" className="text-danger" disabled={pending} onClick={() => setConfirmDelete(true)}>
              Supprimer
            </Button>
            <Button variant="secondary" className="flex-1" disabled={pending} onClick={saveNow}>
              Enregistrer
            </Button>
            <Button className="flex-1" icon={EyeFillIcon} disabled={pending} onClick={preview}>
              Aperçu
            </Button>
          </>
        ) : (
          <>
            <ButtonLink variant="secondary" href={listHref} className="flex-1">
              Annuler
            </ButtonLink>
            <Button className="flex-1" disabled={pending || !dirty} onClick={saveNow}>
              Enregistrer
            </Button>
          </>
        )}
      </div>

      <Modal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer ce brouillon ?"
        description="Le brouillon et sa couverture seront définitivement supprimés."
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full bg-danger text-white hover:brightness-110" disabled={pending} onClick={removeDraft}>
              Supprimer
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span className={cn("self-end text-[1.2rem] tabular-nums", value >= max ? "text-danger" : "text-faint")}>
      {value}/{max}
    </span>
  );
}
