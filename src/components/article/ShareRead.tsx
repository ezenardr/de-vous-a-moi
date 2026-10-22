"use client";
import Image, { type StaticImageData } from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { recordReadShare, recordWatchShare } from "@/action/engagement";
import instagram from "@/assets/social/instagram.svg";
import linkedin from "@/assets/social/linkedin.svg";
import tiktok from "@/assets/social/tiktok.svg";
import twitter from "@/assets/social/twitter.svg";
import whatsapp from "@/assets/social/whatsapp.svg";
import { Modal } from "@/components/ds/Modal";
import { CheckFillIcon, Copy2FillIcon, ShareForwardFillIcon } from "@/components/icons/mingcute";

type Network = { name: string; icon: StaticImageData; href?: (url: string, title: string) => string };

// Instagram and TikTok have no web share URL: they use the system share sheet, or copy the link.
const NETWORKS: Network[] = [
  { name: "X (Twitter)", icon: twitter, href: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { name: "LinkedIn", icon: linkedin, href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { name: "Instagram", icon: instagram },
  { name: "TikTok", icon: tiktok },
  { name: "WhatsApp", icon: whatsapp, href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
];

// Figma "Share read" button (153:12737): #f8f8f8, 10px padding, 5px radius, 20px icon, Medium 14 #333.
// Opens the "Share read" modal (153:11887).
// kind "site": the About page shares the blog itself (nothing to count).
const COPY = {
  read: { title: "Partager la lecture", text: "Partagez cette histoire avec quelqu'un qui aurait besoin d'une petite pause aujourd'hui." },
  watch: { title: "Partager la vidéo", text: "Partagez cette vidéo avec quelqu'un qui aurait besoin d'une petite pause aujourd'hui." },
  site: { title: "Partager De vous à moi", text: "Faites découvrir le blog à quelqu'un qui aime les belles histoires." },
};

export function ShareRead({ kind = "read", id, url, title }: { kind?: "read" | "watch" | "site"; id?: string; url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const recordShare = () => {
    if (!id || kind === "site") return;
    void (kind === "watch" ? recordWatchShare(id) : recordReadShare(id));
  };
  const [copied, setCopied] = useState(false);

  async function copy(silent = false) {
    await navigator.clipboard.writeText(url);
    recordShare();
    if (!silent) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function shareTo(network: Network) {
    if (network.href) {
      recordShare();
      window.open(network.href(url, title), "_blank", "noopener,noreferrer");
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        recordShare();
      } catch {
        // The visitor closed the share sheet.
      }
      return;
    }
    await copy(true);
    toast.success(`Lien copié : collez-le dans ${network.name}.`);
  }

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="flex shrink-0 cursor-pointer items-center gap-[0.9rem] rounded-card bg-field p-4 type-body font-medium text-ink transition-colors hover:bg-[#f1f1f1]"
      >
        <ShareForwardFillIcon className="shrink-0" />
        Partager
      </motion.button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={COPY[kind].title}
        description={COPY[kind].text}
      >
        <div className="flex w-full items-center gap-4 rounded-[0.75rem] border border-field py-[0.5rem] pr-[0.5rem] pl-4">
          <p className="min-w-0 flex-1 truncate text-center type-body-lg text-ink">{url}</p>
          <button
            type="button"
            onClick={() => copy()}
            className="flex shrink-0 cursor-pointer items-center gap-[0.9rem] rounded-card bg-field p-4 type-body font-medium text-primary-base"
          >
            {copied ? <CheckFillIcon className="shrink-0" /> : <Copy2FillIcon className="shrink-0" />}
            {copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-[3rem]">
          {NETWORKS.map((network) => (
            <motion.button
              key={network.name}
              type="button"
              aria-label={`Partager sur ${network.name}`}
              title={network.name}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => shareTo(network)}
              className="flex cursor-pointer items-center rounded-card bg-field p-[0.75rem]"
            >
              <Image src={network.icon} alt="" width={30} height={30} />
            </motion.button>
          ))}
        </div>
      </Modal>
    </>
  );
}
