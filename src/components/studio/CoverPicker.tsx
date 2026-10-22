"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { Button } from "@/components/ds/Button";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { CameraFillIcon } from "@/components/icons/mingcute";
import getCroppedImg from "@/lib/GetCroppedImage";

// Studio cover: a dashed 16:9-ish drop area (the current cover once there is one), then a crop dialog
// (16:9). onChange receives the cropped file; compression happens on save.
export function CoverPicker({ imageUrl, onChange }: { imageUrl: string | null; onChange: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const shown = preview ?? imageUrl;

  // Object URLs are freed when replaced or when the page goes away.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Choisissez une image.");
    if (file.size > 15 * 1024 * 1024) return void toast.error("L'image ne doit pas dépasser 15 Mo.");
    setZoom(1);
    setSource(URL.createObjectURL(file));
  }

  async function apply() {
    if (!source || !area) return;
    const blob = await getCroppedImg(source, area);
    const file = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
    URL.revokeObjectURL(source);
    setSource(null);
    setPreview(URL.createObjectURL(file));
    onChange(file);
  }

  return (
    <>
      <label className="group relative flex h-[22rem] cursor-pointer items-center justify-center overflow-hidden rounded-card border border-dashed border-divider bg-field lg:h-[40rem]">
        {shown ? (
          <>
            <Image src={shown} alt="" fill sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" unoptimized={shown.startsWith("blob:")} />
            <span className="glass-dark absolute right-4 bottom-4 flex items-center gap-[0.8rem] rounded-pill px-[1.5rem] py-4 type-body font-bold text-white opacity-90 transition-opacity group-hover:opacity-100">
              <CameraFillIcon />
              Changer la couverture
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-4 px-8 text-center">
            <CameraFillIcon size={40} className="text-faint" />
            <span className="type-body-lg font-bold text-ink">Ajouter une couverture</span>
            <span className="type-body text-faint">JPG, PNG ou WebP, recadrée en 16:9</span>
          </span>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} />
      </label>

      <Modal open={Boolean(source)} onOpenChange={(open) => !open && setSource(null)} title="Recadrer la couverture">
        <div className="relative h-[30rem] overflow-hidden rounded-card bg-black">
          {source && (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom"
          className="relative w-full accent-primary-base"
        />
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" onClick={apply}>
              Utiliser cette couverture
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </>
  );
}
