/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PublishWatch } from "@/action/watch";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";
import { ButtonPrimary } from "@/components/shared/Buttons";
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
import getCroppedImg from "@/lib/GetCroppedImage";
import { User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const NewWatchSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z
    .file({
      error: (issue) =>
        issue.input === undefined
          ? "Veuillez insérez une image"
          : "Veuillez insérez une image",
    })
    .mime(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  videoUrl: z
    .string()
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}([?&].*)?$/,
      "Veuillez insérer un lien YouTube valide",
    ),
});
type TNewWatchSchema = z.infer<typeof NewWatchSchema>;

export default function NewWatchPageContent() {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TNewWatchSchema>({
    resolver: zodResolver(NewWatchSchema),
  });
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const router = useRouter();

  const onCropComplete = useCallback(
    (_: unknown, croppedPixels: any) => setCroppedAreaPixels(croppedPixels),
    [],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("La taille de l'image ne doit pas dépasser 1 MB");
      e.target.value = "";
      return;
    }

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
    setImagePreview(URL.createObjectURL(file));
  }

  async function publishWatch(data: TNewWatchSchema) {
    setIsloading(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("image", data.image);
    formData.append("videoUrl", data.videoUrl);
    const result = await PublishWatch({
      user: session?.user as User,
      body: formData,
    });
    if (result.success === true) {
      router.push(`/author/watches/${result.watch.watchId}`);
    } else {
      toast.error(result.error);
      setIsloading(false);
    }
  }

  return (
    <form className="overflow-y-scroll overflow-x-hidden">
      <div className="flex flex-col py-4 lg:flex-row lg:items-center justify-between pb-8 shrink-0">
        <div className="text-[2rem] font-medium leading-[120%] text-[#333333] flex items-center gap-4">
          Nouvel article <ChevronRight size={20} color="#484848" /> Brouillon
        </div>
      </div>
      <div className="flex flex-col h-full gap-8 ">
        <div className="flex flex-col  gap-8">
          <div className="flex flex-col items-center gap-3">
            {imagePreview ? (
              <div className="relative w-full h-[400px]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={400}
                  className="h-full w-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute top-0 left-0 w-full h-[400px] z-50 opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div className="h-[200px] lg:h-[400px] w-full px-8 rounded-lg border border-[#e5e5e5] border-dashed bg-[#FBFBFB] flex items-center justify-center relative">
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
            {errors.image && (
              <span className="text-[1.2rem] px-8 py-2 text-failure">
                {errors.image.message}
              </span>
            )}
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
                className={`peer transition-all h-[90px] resize-none duration-300 delay-200 bg-[#F8F8F8] w-full rounded-[5px] px-3.5 p-8 text-[1.4rem] leading-8 placeholder:text-gray-400 text-[#333333] outline-none border border-transparent focus:border focus:border-[#9FE870] focus:outline-none focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:border-none disabled:cursor-not-allowed`}
                minLength={100}
                maxLength={254}
                {...register("description")}
                onChange={(e) => setDescriptionCount(e.target.value.length)}
                placeholder="How taking intentional breaks can help you think more clearly, create with purpose, and live a life that feels truly balanced."
              />
              {descriptionCount > 0 && (
                <span
                  className={`text-right ${descriptionCount < 100 ? "text-failure" : "text-success"}`}
                >
                  {descriptionCount}/254
                </span>
              )}
            </div>
            <div className="w-full flex flex-col gap-2">
              <Input {...register("videoUrl")}>Lien de la vidéo youtube</Input>
              {errors.videoUrl && (
                <span className="text-right text-failure">
                  {errors.videoUrl.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className=" flex flex-col w-full items-center gap-8">
          <ButtonPrimary
            type="button"
            disabled={isLoading}
            onClick={handleSubmit(publishWatch, (errs) =>
              console.log("Validation errors:", errs),
            )}
            className="w-full"
          >
            {isLoading ? <LoadingCircleSmall /> : "Publier"}
          </ButtonPrimary>
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
    </form>
  );
}
