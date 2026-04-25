"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Play, CalendarDays, Mic, UserIcon } from "lucide-react";
import { formaDate } from "@/lib/formatDate";

function getYoutubeEmbedUrl(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return url;
}

type Props = {
  videoUrl: string;
  imageUrl: string;
  title: string;
  updatedAt: string;
  author: {
    fullName: string;
    profileImageUrl?: string;
  };
};

export default function YoutubeVideoPlayer({
  videoUrl,
  imageUrl,
  title,
  updatedAt,
  author,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className="rounded-xl w-full h-160 relative cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <Image
          className="h-160 object-cover object-top rounded-xl"
          src={imageUrl}
          alt={title}
          fill
        />
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 group-hover:bg-black/40 transition-all rounded-xl">
          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Play size={32} fill="#333333" color="#333333" className="ml-1" />
          </div>
        </div>
        <div className="backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 lg:gap-0 lg:flex-row lg:justify-between rounded-[1.5rem]">
          <div className="flex items-center gap-4">
            {author.profileImageUrl ? (
              <Image
                src={author.profileImageUrl}
                alt={author.fullName}
                width={30}
                height={30}
                className="rounded-full"
              />
            ) : (
              <div className="bg-white h-10 w-10 border border-secondary-base flex flex-col items-center justify-center rounded-full">
                <UserIcon size={20} color="#9FE870" />
              </div>
            )}
            <span className="text-[1.4rem] text-white">{author.fullName}</span>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 rounded-[3rem] w-fit bg-white uppercase flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
              <CalendarDays
                stroke="#fff"
                fill="#334155"
                size={12}
                color="#334155"
              />
              {formaDate(updatedAt)}
            </div>
            {/* <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
              <Clock4 size={12} color="#334155" />
              test
            </div> */}
            <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
              <Mic size={12} color="#fff" />
              Le Spotlight
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/80 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              <X size={32} />
            </button>
            <iframe
              src={getYoutubeEmbedUrl(videoUrl)}
              title={title}
              className="w-full h-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
