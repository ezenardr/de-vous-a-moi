"use client";
import { SaveDraft } from "@/action/reads";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";
import BundledEditor from "@/components/shared/BundledEditor";
import { ButtonBlack, ButtonPrimary } from "@/components/shared/Buttons";
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
import { ChevronRight, ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
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
      // image: read.imageUrl
    },
  });
  const editorRef = useRef<any>(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  const [titleCount, setTitleCount] = useState(read.title?.length ?? 0);
  const [descriptionCount, setDescriptionCount] = useState(
    read.description?.length ?? 0,
  );
  const [isLoading, setIsloading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback(
    (_: any, croppedPixels: any) => setCroppedAreaPixels(croppedPixels),
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
    // setValue("performerImage", file, { shouldValidate: true });
    setImagePreview(URL.createObjectURL(file));
  }

  async function saveDraft() {
    setIsloading(true);
    const result = await SaveDraft({
      readDraftId: read.readDraftId,
      user: session?.user as User,
      body: {
        title: getValues("title"),
        description: getValues("description"),
        category: getValues("category"),
        content: editorRef.current?.getContent() ?? "",
      },
    });
    if (result.success === true) {
      toast.success("Sauvegarde réussi");
    } else {
      toast.error(result.error);
    }
    setIsloading(false);
  }
  return (
    <div className="overflow-y-scroll overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-8 shrink-0">
        <div className="text-[2rem] font-medium leading-[120%] text-[#333333] flex items-center gap-4">
          Nouvel article <ChevronRight size={20} color="#484848" /> Brouillon
        </div>
        <div className="flex items-center gap-8">
          <ButtonBlack onClick={saveDraft}>
            {isLoading ? <LoadingCircleSmall /> : "Sauvegarder"}
          </ButtonBlack>
          <ButtonPrimary onClick={log}>
            {isLoading ? <LoadingCircleSmall /> : "Publier"}
          </ButtonPrimary>
        </div>
      </div>
      <div className="flex flex-col h-full gap-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-3">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute top-0 left-0 w-full h-full z-50 opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div className="h-[200px] lg:h-full w-full px-8 rounded-lg border border-[#e5e5e5] border-dashed bg-[#FBFBFB] flex items-center justify-center relative">
                <div className="flex flex-col items-center gap-4 ">
                  <ImageIcon size="16" color="#163300" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute top-0 left-0 w-full h-full z-50 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
            {/* <span className="text-[1.2rem] px-8 py-2 text-failure">
            {errors.performerImage?.message}
          </span> */}
          </div>
          <div className=" lg:col-start-2 lg:col-end-4 flex flex-col gap-8 ">
            <div className="w-full flex flex-col gap-2">
              <Input
                minLength={20}
                maxLength={100}
                {...register("title")}
                onChange={(e) => setTitleCount(e.target.value.length)}
              >
                {titleCount === 0
                  ? "EX: The Quiet Power of Slowing Down"
                  : "Titre de l'article"}
              </Input>
              {titleCount > 0 && (
                <span
                  className={`text-right ${titleCount < 20 ? "text-failure" : "text-success"}`}
                >
                  {titleCount}/100
                </span>
              )}
            </div>
            <div className="w-full flex flex-col gap-2">
              <textarea
                className={`peer transition-all resize-none duration-300 delay-200 bg-[#F8F8F8] w-full rounded-[5px] px-3.5 p-8 text-[1.4rem] leading-8 placeholder:text-gray-400 text-[#333333] outline-none border border-transparent focus:border focus:border-[#9FE870] focus:outline-none focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:border-none disabled:cursor-not-allowed`}
                minLength={100}
                maxLength={150}
                {...register("description")}
                onChange={(e) => setDescriptionCount(e.target.value.length)}
                placeholder="How taking intentional breaks can help you think more clearly, create with purpose, and live a life that feels truly balanced."
              />
              {descriptionCount > 0 && (
                <span
                  className={`text-right ${descriptionCount < 100 ? "text-failure" : "text-success"}`}
                >
                  {descriptionCount}/150
                </span>
              )}
            </div>
            <Select
              onValueChange={(e) => setValue("category", e)}
              defaultValue={read.category ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Actualités">Actualités</SelectItem>
                  <SelectItem value="Style de vie">Style de vie</SelectItem>
                  <SelectItem value="Le Spotlight">Le Spotlight</SelectItem>
                  <SelectItem value="Technologie">Technologie</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full min-h-[80dvh] lg:min-h-[90dvh]">
          <BundledEditor
            onInit={(_evt, editor) => (editorRef.current = editor)}
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
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | image | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              automatic_uploads: true,
              paste_data_images: true,
              images_upload_handler: (blobInfo) => {
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.readAsDataURL(blobInfo.blob());
                });
              },
              content_style:
                "body { font-family:var(--font-secondary),serif; font-size:16px }",
            }}
          />
        </div>
      </div>
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
    </div>
  );
}
