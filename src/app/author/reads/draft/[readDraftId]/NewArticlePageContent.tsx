/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DeleteDraft, SaveDraft } from "@/action/reads";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";
import BundledEditor from "@/components/shared/BundledEditor";
import {
  ButtonBlack,
  ButtonPrimary,
  ButtonRed,
} from "@/components/shared/Buttons";
import { Input } from "@/components/shared/Inputs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import getCroppedImg from "@/lib/GetCroppedImage";
import { ReadDraft, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const NewArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z
    .file({
      error: (issue) =>
        issue.input === undefined
          ? "Veuillez insérez une image"
          : "Veuillez insérez une image",
    })
    .max(504800, "L'image ne peux pas depasser 5mb")
    .mime(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  content: z.string(),
  category: z.string(),
});
type TNewArticleSchema = z.infer<typeof NewArticleSchema>;
export default function NewArticlePageContent({ read }: { read: ReadDraft }) {
  const { data: session } = useSession();
  const { register, getValues, setValue } = useForm<TNewArticleSchema>({
    resolver: zodResolver(NewArticleSchema),
    defaultValues: {
      content: read.content ?? "",
      description: read.description ?? "",
      title: read.title ?? "",
      category: read.category ?? "",
    },
  });
  const editorRef = useRef<any>(null);
  const [titleCount, setTitleCount] = useState(read.title?.length ?? 0);
  const [descriptionCount, setDescriptionCount] = useState(
    read.description?.length ?? 0,
  );
  const [isLoading, setIsloading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    read.imageUrl ?? null,
  );
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const router = useRouter();
  const { onChange: onTitleChange, ...titleRegisterProps } = register("title");
  const { onChange: onDescriptionChange, ...descriptionRegisterProps } =
    register("description");

  const onCropComplete = useCallback(
    (_: unknown, croppedPixels: any) => setCroppedAreaPixels(croppedPixels),
    [],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerRef.current?.click();
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImageSrc(reader.result as string);
  };

  async function cropImage() {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const file = new File([croppedBlob], "profile.jpg", {
      type: croppedBlob.type,
    });
    setValue("image", file, { shouldValidate: true });
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  }
  async function extractAndUploadInlineImages(
    content: string,
  ): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const images = doc.querySelectorAll("img[src^='data:']");

    await Promise.all(
      Array.from(images).map(async (img) => {
        const base64 = img.getAttribute("src")!;
        const blob = await fetch(base64).then((r) => r.blob());
        const file = new File([blob], "inline-image.jpg", {
          type: blob.type,
        });

        const formData = new FormData();
        formData.append("file", file);

        // Call your own upload endpoint
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reads/draft/inline-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
            body: formData,
          },
        );
        if (!res.ok) throw new Error("Failed to upload inline image");
        const { url } = await res.json();

        img.setAttribute("src", url);
      }),
    );

    return doc.body.innerHTML;
  }

  async function saveDraft() {
    if (!editorRef.current) return;
    setIsloading(true);
    try {
      const formData = new FormData();
      formData.append("title", getValues("title"));
      formData.append("description", getValues("description"));
      formData.append("category", getValues("category"));
      const rawContent = editorRef.current.getContent();
      const cleanContent = await extractAndUploadInlineImages(rawContent);
      formData.append("content", cleanContent);
      const image = getValues("image");
      if (image instanceof File) {
        formData.append("image", image);
      } else if (read.imageUrl) {
        const res = await fetch(read.imageUrl);
        const blob = await res.blob();
        const file = new File([blob], "existing-image.jpg", {
          type: blob.type,
        });
        formData.append("image", file);
      }
      const result = await SaveDraft({
        readDraftId: read.readDraftId,
        user: session?.user as User,
        body: formData,
      });
      if (result.success === true) {
        toast.success("Sauvegarde réussi");
        router.push("/author/reads");
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsloading(false);
    }
  }

  async function submitPreview() {
    if (!editorRef.current) return;
    setIsloading(true);
    try {
      const formData = new FormData();
      formData.append("title", getValues("title"));
      formData.append("description", getValues("description"));
      formData.append("category", getValues("category"));
      const rawContent = editorRef.current.getContent();
      const cleanContent = await extractAndUploadInlineImages(rawContent);
      formData.append("content", cleanContent);
      const image = getValues("image");
      if (image instanceof File) {
        formData.append("image", image);
      } else if (read.imageUrl) {
        const res = await fetch(read.imageUrl);
        const blob = await res.blob();
        const file = new File([blob], "existing-image.jpg", {
          type: blob.type,
        });
        formData.append("image", file);
      }

      const result = await SaveDraft({
        readDraftId: read.readDraftId,
        user: session?.user as User,
        body: formData,
      });
      if (result.success === true) {
        if (!result.draft.imageUrl || !result.draft.imageFileId) {
          toast.error("Une image est requise pour prévisualiser l'article");
        } else if (
          !result.draft.title ||
          !result.draft.description ||
          !result.draft.category ||
          !result.draft.content
        ) {
          toast.error(
            "Toutes les contenues sont obligatoires pour prévisualiser l'article",
          );
        } else {
          toast.success("Sauvegarde réussi");
          router.push(`/author/reads/draft/${read.readDraftId}/preview`);
        }
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsloading(false);
    }
  }

  async function deleteDraft() {
    setIsloading(true);
    try {
      const result = await DeleteDraft({
        readDraftId: read.readDraftId,
        user: session?.user as User,
      });
      if (result.success === true) {
        router.push("/author/reads");
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsloading(false);
    }
  }
  return (
    <form className="overflow-y-scroll overflow-x-hidden pb-28 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#EBEBEB] py-5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[1.8rem] font-semibold text-[#333333]">
            Nouvel article
          </span>
          <span className="px-[10px] py-[4px] rounded-full bg-[#F5F5F5] text-[1.2rem] font-medium text-[#888888] border border-[#E8E8E8] leading-none">
            Brouillon
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <ButtonRed type="button" onClick={deleteDraft} disabled={isLoading}>
            {isLoading ? <LoadingCircleSmall /> : "Supprimer"}
          </ButtonRed>
          <ButtonBlack type="button" onClick={saveDraft} disabled={isLoading}>
            {isLoading ? <LoadingCircleSmall /> : "Sauvegarder"}
          </ButtonBlack>
          <ButtonPrimary
            type="button"
            onClick={submitPreview}
            disabled={isLoading}
          >
            {isLoading ? <LoadingCircleSmall /> : "Prévisualisation"}
          </ButtonPrimary>
        </div>
      </div>

      {/* Cover image + metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-6 mb-8">
        {/* Cover image */}
        <div className="flex flex-col gap-2">
          <span className="text-[1.1rem] font-semibold text-neutral-400 uppercase tracking-widest">
            Image de couverture
          </span>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden group border border-dashed border-[#DEDEDE] bg-[#FBFBFB]">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Aperçu de l'image"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <ImageIcon size={16} color="#fff" />
                  </div>
                  <span className="text-white text-[1.3rem] font-medium">
                    Modifier l&apos;image
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#EFEFEF] flex items-center justify-center">
                  <ImageIcon size={18} color="#163300" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center px-4">
                  <span className="text-[1.4rem] text-neutral-500 font-medium">
                    Ajouter une image
                  </span>
                  <span className="text-[1.1rem] text-neutral-400">
                    JPEG, PNG, WEBP · Max 5MB
                  </span>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full z-50 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Metadata fields */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[1.1rem] font-semibold text-neutral-400 uppercase tracking-widest">
              Titre
            </span>
            <Input
              minLength={20}
              maxLength={100}
              {...titleRegisterProps}
              onChange={(e) => {
                onTitleChange(e);
                setTitleCount(e.target.value.length);
              }}
            >
              {titleCount === 0
                ? "EX: The Quiet Power of Slowing Down"
                : "Titre de l'article"}
            </Input>
            {titleCount > 0 && (
              <span
                className={`self-end text-[1.15rem] px-[10px] py-[3px] rounded-full font-medium ${
                  titleCount < 20
                    ? "bg-red-50 text-failure"
                    : "bg-green-50 text-success"
                }`}
              >
                {titleCount}/100
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[1.1rem] font-semibold text-neutral-400 uppercase tracking-widest">
              Description
            </span>
            <textarea
              className="resize-none bg-[#F8F8F8] w-full rounded-[5px] px-3.5 p-8 text-[1.4rem] leading-8 placeholder:text-gray-400 text-[#333333] outline-none border border-transparent transition-colors duration-200 focus:border focus:border-[#9FE870] focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:cursor-not-allowed"
              minLength={100}
              maxLength={150}
              rows={4}
              {...descriptionRegisterProps}
              onChange={(e) => {
                onDescriptionChange(e);
                setDescriptionCount(e.target.value.length);
              }}
              placeholder="How taking intentional breaks can help you think more clearly, create with purpose, and live a life that feels truly balanced."
            />
            {descriptionCount > 0 && (
              <span
                className={`self-end text-[1.15rem] px-[10px] py-[3px] rounded-full font-medium ${
                  descriptionCount < 100
                    ? "bg-red-50 text-failure"
                    : "bg-green-50 text-success"
                }`}
              >
                {descriptionCount}/150
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[1.1rem] font-semibold text-neutral-400 uppercase tracking-widest">
              Catégorie
            </span>
            <Select
              onValueChange={(e) => setValue("category", e)}
              defaultValue={read.category ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Actualités">Actualités</SelectItem>
                  <SelectItem value="Style de vie">Style de vie</SelectItem>
                  <SelectItem value="Le Spotlight">Le Spotlight</SelectItem>
                  <SelectItem value="Technologies">Technologies</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t border-[#EBEBEB] mb-8" />

      {/* Editor */}
      <div className="flex flex-col gap-2 mb-8">
        <span className="text-[1.1rem] font-semibold text-neutral-400 uppercase tracking-widest">
          Contenu de l&apos;article
        </span>
        <div className="w-full h-[80dvh] lg:h-[90dvh]">
          <BundledEditor
            onInit={(_evt: unknown, editor: unknown) =>
              (editorRef.current = editor)
            }
            initialValue={getValues("content")}
            init={{
              height: "100%",
              min_height: 400,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "preview",
                "help",
                "wordcount",
              ],
              block_formats: "Paragraph=p; Heading 2=h2",
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "image |" +
                "help",
              automatic_uploads: true,
              image_advtab: true,
              image_uploadtab: true,
              file_picker_types: "image",
              file_picker_callback: (callback) => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;

                  const compressImage = (
                    file: File,
                    quality = 0.8,
                  ): Promise<string> => {
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const img = document.createElement("img");
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          let { width, height } = img;
                          const MAX_DIMENSION = 1920;
                          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                            if (width > height) {
                              height = (height / width) * MAX_DIMENSION;
                              width = MAX_DIMENSION;
                            } else {
                              width = (width / height) * MAX_DIMENSION;
                              height = MAX_DIMENSION;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          canvas
                            .getContext("2d")!
                            .drawImage(img, 0, 0, width, height);
                          let dataUrl = canvas.toDataURL("image/jpeg", quality);
                          while (
                            dataUrl.length > 1 * 1024 * 1024 * 1.37 &&
                            quality > 0.1
                          ) {
                            quality -= 0.1;
                            dataUrl = canvas.toDataURL("image/jpeg", quality);
                          }
                          resolve(dataUrl);
                        };
                        img.src = e.target!.result as string;
                      };
                      reader.readAsDataURL(file);
                    });
                  };

                  const base64 = await compressImage(file);
                  callback(base64, { title: file.name });
                };
                input.click();
              },
              paste_data_images: true,
              images_upload_handler: (blobInfo: { blob: () => Blob }) => {
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      resolve(reader.result);
                    }
                  };
                  reader.readAsDataURL(blobInfo.blob());
                });
              },
              content_style:
                "body { font-family:var(--font-secondary),serif; font-size:16px }",
            }}
          />
        </div>
      </div>

      {/* Mobile fixed action bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#EBEBEB] px-8 py-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <ButtonBlack
            type="button"
            onClick={saveDraft}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? <LoadingCircleSmall /> : "Sauvegarder"}
          </ButtonBlack>
          <ButtonPrimary
            type="button"
            onClick={submitPreview}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? <LoadingCircleSmall /> : "Prévisualisation"}
          </ButtonPrimary>
        </div>
        <ButtonRed
          className="w-full"
          type="button"
          onClick={deleteDraft}
          disabled={isLoading}
        >
          {isLoading ? <LoadingCircleSmall /> : "Supprimer"}
        </ButtonRed>
      </div>

      {/* Image crop dialog */}
      <Dialog>
        <DialogTrigger asChild className="hidden">
          <span ref={triggerRef} className="hidden">
            open
          </span>
        </DialogTrigger>
        <DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Redimenssioner l&apos;image</DialogTitle>
            <DialogDescription className="sr-only">
              This action cannot be undone
            </DialogDescription>
            {imageSrc && (
              <div className="relative w-full h-[300px]">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild onClick={cropImage}>
              <span className="bg-primary-500 px-12 py-[15px] border-2 border-transparent rounded-[100px] text-white font-medium text-[1.5rem] h-auto leading-8 cursor-pointer flex items-center justify-center w-full">
                Redimenssioner l&apos;image
              </span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
