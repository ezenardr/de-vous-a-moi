"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import TruncateUrl from "@/lib/TruncateUrl";
import { toast } from "sonner";
import Share from "@/assets/icons/ShareForwardFill.svg";
import Copy from "@/assets/icons/Copy2Fill.svg";

export default function ShareButton({
  url,
  entity,
}: {
  url: string;
  entity: string;
}) {
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer flex items-center gap-4">
        <div className="p-4 rounded-xl bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
          <Image src={Share} width={20} alt="Share" />
          {entity === "read" && (
            <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
              Partager cet article
            </span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] lg:max-w-[520px] overflow-hidden flex flex-col gap-10">
        <DialogTitle>Partagez cet article</DialogTitle>
        <p className="text-[#767676] text-[1.8rem]">
          {entity === "read" && (
            <span>
              Partagez cette histoire avec quelqu&apos;un qui aurait bien besoin
              d&apos;une petite pause aujourd&apos;hui.
            </span>
          )}
        </p>
        <div className="px-4 py-[5px] rounded-[7.5px] flex items-center gap-5 border border-[#F8F8F8] text-[1.6rem] text-[#333333]">
          {TruncateUrl(url, 42)}
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                toast.success("Lien copié dans le presse-papier");
              } catch {
                toast.error("Une erreur est survenue");
              }
            }}
            className="flex items-center gap-4 bg-[#F8F8F8] rounded-[5px] p-4 cursor-pointer"
          >
            <Image src={Copy} alt="Copy" />
            <span className="font-medium text-primary-base">Copier</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
