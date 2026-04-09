"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import Share from "@/assets/icons/ShareForwardFill.svg";
import Copy from "@/assets/icons/Copy2Fill.svg";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import CloseIcon from "@/assets/icons/CloseIcon.svg";
import Link from "next/link";
import Linkedin from "@/assets/icons/LinkedIn.svg";
import Whatsapp from "@/assets/icons/WhatsApp.svg";
import Twitter from "@/assets/icons/Twitter.svg";

export default function ShareButton({
  url,
  entity,
}: {
  url: string;
  entity: string;
}) {
  return (
    <>
      <Dialog>
        <DialogTrigger className="cursor-pointer hidden lg:flex items-center gap-4">
          <div className="p-4 rounded-xl bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
            <Image src={Share} width={20} height={20} alt="Share" />
            {entity === "read" && (
              <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
                Partager cet article
              </span>
            )}
            {entity === "blog" && (
              <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
                Partager le blog
              </span>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] lg:max-w-[520px] overflow-hidden flex flex-col gap-10">
          {entity === "read" && <DialogTitle>Partagez cet article</DialogTitle>}
          {entity === "blog" && <DialogTitle>Partagez le Blog</DialogTitle>}
          <p className="text-[#767676] text-[1.8rem]">
            {entity === "read" && (
              <span>
                Partagez cette histoire avec quelqu&apos;un qui aurait bien
                besoin d&apos;une petite pause aujourd&apos;hui.
              </span>
            )}
            {entity === "blog" && (
              <span>
                Partagez le blog avec quelqu&apos;un qui aurait bien besoin
                d&apos;une petite pause aujourd&apos;hui.
              </span>
            )}
          </p>
          <div className="px-4 py-2 w-full rounded-[7.5px] justify-between flex items-center gap-5 border border-[#F8F8F8] text-[1.6rem] text-[#333333]">
            <span className="truncate max-w-[70%]">{url}</span>
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
          <div className="w-full justify-center flex items-center gap-12">
            <Link
              href={`https://wa.me/?text=${encodeURIComponent(`Découvrez des idées inspirantes et des histoires positives sur notre blog — \n*Partagez l’expérience !* \n${url}`)} \n _Là où l’encre et votre voix s’harmonisent: On le pense, on en parle_`}
              target="_blank"
              className="flex items-center justify-center w-18 h-18 bg-[#F8F8F8] rounded-[5px]"
            >
              <Image src={Whatsapp} alt="whatsapp Icon" />
            </Link>
            <Link
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Découvrez des idées inspirantes et des histoires positives sur notre blog — \n*Partagez l’expérience !* \n${url}`,
              )} \n _Là où l’encre et votre voix s’harmonisent: On le pense, on en parle_`}
              target="_blank"
              className="flex items-center justify-center w-18 h-18 bg-[#F8F8F8] rounded-[5px]"
            >
              <Image src={Twitter} alt="Twitter Icon" />
            </Link>
            <Link
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              className="flex items-center justify-center w-18 h-18 bg-[#F8F8F8] rounded-[5px]"
            >
              <Image src={Linkedin} alt="LinkedIn Icon" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
      <Drawer direction="bottom">
        <DrawerTrigger className="flex lg:hidden items-center gap-4 cursor-pointer">
          <div className="p-4 rounded-xl bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
            <Image src={Share} width={20} height={20} alt="Share" />
            {/* {entity === "read" && (
              <span className=" font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
                Partager cet article
              </span>
            )} */}
          </div>
        </DrawerTrigger>
        <DrawerContent className="bg-[#F9F9F9] h-[430px] overflow-hidden">
          <DrawerHeader>
            <DrawerTitle className="sr-only">
              Mobile navigation menu
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Drawer for mobile navigation menu
            </DrawerDescription>
          </DrawerHeader>
          <DrawerClose className="self-end">
            <Image src={CloseIcon} alt="CloseIcon" width={40} height={40} />
          </DrawerClose>
          <div className="flex flex-col gap-[2.2rem]">
            {entity === "read" && (
              <span className="font-secondary font-bold  text-[2.4rem] leading-[145%] tracking-[-0.42px] text-black">
                Partager cet article
              </span>
            )}
            {entity === "blog" && (
              <span className="font-secondary font-bold  text-[2.4rem] leading-[145%] tracking-[-0.42px] text-black">
                Partager le blog
              </span>
            )}
            <p className="text-[#767676] text-[1.8rem]">
              {entity === "read" && (
                <span>
                  Partagez cette histoire avec quelqu&apos;un qui aurait bien
                  besoin d&apos;une petite pause aujourd&apos;hui.
                </span>
              )}
              {entity === "blog" && (
                <span>
                  Partagez le Blog avec quelqu&apos;un qui aurait bien besoin
                  d&apos;une petite pause aujourd&apos;hui.
                </span>
              )}
            </p>
            <div className="px-4 py-2 w-full rounded-[7.5px] justify-between flex items-center gap-5 border border-[#F8F8F8] text-[1.6rem] text-[#333333]">
              <span className="truncate max-w-[70%]">{url}</span>
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
            <div className="w-full justify-center flex items-center gap-12">
              <Link
                href={`https://wa.me/?text=${encodeURIComponent(`Découvrez des idées inspirantes et des histoires positives sur notre blog — \n*Partagez l’expérience !* \n${url}`)} \n _Là où l’encre et votre voix s’harmonisent: On le pense, on en parle_`}
                target="_blank"
                className="flex items-center justify-center w-18 h-18 bg-[#F8F8F8] rounded-[5px]"
              >
                <Image src={Whatsapp} alt="whatsapp Icon" />
              </Link>
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Découvrez des idées inspirantes et des histoires positives sur notre blog — \n*Partagez l’expérience !* \n${url}`,
                )} \n _Là où l’encre et votre voix s’harmonisent: On le pense, on en parle_`}
                target="_blank"
                className="flex items-center justify-center w-18 h-18 bg-[#F8F8F8] rounded-[5px]"
              >
                <Image src={Twitter} alt="Twitter Icon" />
              </Link>
              <Link
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                target="_blank"
                className="flex items-center justify-center w-18 h-18 bg-[#F8F8F8] rounded-[5px]"
              >
                <Image src={Linkedin} alt="LinkedIn Icon" />
              </Link>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
