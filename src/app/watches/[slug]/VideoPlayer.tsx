"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { PlayPill } from "@/components/ds/VideoCard";
import { EASE_OUT } from "@/components/motion/easing";
import { youtubeEmbedUrl } from "@/lib/youtube";

// Figma 153:14799: 400px cover (350 mobile), black 20% overlay, centred "Play video" pill.
// Pressing play swaps the cover for the privacy-enhanced YouTube player in the same box.
export function VideoPlayer({ videoUrl, imageUrl, title }: { videoUrl: string; imageUrl: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = youtubeEmbedUrl(videoUrl);

  return (
    <div className="relative h-[35rem] overflow-hidden rounded-card bg-black lg:h-[40rem]">
      <AnimatePresence initial={false}>
        {playing && embed ? (
          <motion.iframe
            key="player"
            src={embed}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          />
        ) : (
          <motion.button
            key="cover"
            type="button"
            onClick={() => (embed ? setPlaying(true) : window.open(videoUrl, "_blank", "noopener,noreferrer"))}
            aria-label={`Lire la vidéo « ${title} »`}
            className="group absolute inset-0 cursor-pointer"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <Image src={imageUrl} alt="" fill priority fetchPriority="high" sizes="(min-width: 1024px) 1130px, 100vw" className="object-cover" />
            <span aria-hidden className="absolute inset-0 bg-black/20" />
            <PlayPill className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-105 group-active:scale-95" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
