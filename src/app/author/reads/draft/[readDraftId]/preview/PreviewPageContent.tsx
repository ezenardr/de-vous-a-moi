"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Clock4,
  User as UserIcon,
  Coffee,
  Landmark,
  Mic,
  RadioTower,
} from "lucide-react";
import TruncateUrl from "@/lib/TruncateUrl";
import { useState } from "react";
import { ReadDraft, User } from "@/types/types";
import { formaDate } from "@/lib/formatDate";
import parse from "html-react-parser";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
import { useRouter } from "next/navigation";
import { PublishRead } from "@/action/reads";
import { useSession } from "next-auth/react";
import ToggleIcon from "@/components/shared/ToggleIcon";
import { toast } from "sonner";
import LoadingDots from "@/components/loaders/LoadingDots";

export default function PreviewPageContent({
  draft,
  author,
}: {
  draft: ReadDraft;
  author: {
    fullName: string;
    email: string;
    profileImageUrl: string;
  };
}) {
  const content = parse(`${draft.content}`);
  const [progress, setProgress] = useState(0);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const router = useRouter();
  const { data: session } = useSession();
  const [featured, setFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = Number(localStorage.getItem("read-progress-article-1") ?? 0);
    setProgress(saved);
  }, []);

  useEffect(() => {
    const h2Elements = Array.from(
      document.querySelectorAll(".tinymce-content h2"),
    );
    const items = h2Elements.map((el, i) => {
      const id = `heading-${i}`;
      el.id = id;
      return { id, text: el.textContent ?? "" };
    });
    setHeadings(items);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (headings.length === 0) return;
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const threshold = container.clientHeight * 0.3;

      const offsets = headings.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { id, top: Infinity };
        return { id, top: el.getBoundingClientRect().top - containerTop };
      });

      const passed = offsets.filter((h) => h.top <= threshold);

      if (passed.length > 0) {
        const active = passed.reduce((a, b) =>
          Math.abs(a.top - threshold) < Math.abs(b.top - threshold) ? a : b,
        );
        setActiveId(active.id);
      } else {
        setActiveId(headings[0].id);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    const container = scrollRef.current;
    if (el && container) {
      setActiveId(id);
      const elTop = el.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      container.scrollBy({
        top: elTop - containerTop - 20,
        behavior: "smooth",
      });
    }
  };
  async function publish() {
    setIsLoading(true);
    const result = await PublishRead({
      readDraftId: draft.readDraftId,
      featured,
      user: session?.user as User,
    });
    if (result.success === true) {
      router.push("/");
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.back()}
            className="p-4 rounded-xl bg-[#F8F8F8] flex items-center cursor-pointer"
          >
            <ChevronLeft width={20} />
          </button>
          <span className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
            Lectures
            <div>
              <ChevronRight width={20} />
            </div>
            {draft.title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={"flex items-center gap-4"}>
            <p
              className={
                "text-[1.6rem] leading-[2.2rem] text-deep-100 max-w-md lg:max-w-152"
              }
            >
              En vedette
            </p>
            <label
              className={`relative inline-block h-12 w-20 rounded-full bg-[#E8E8E8] transition [-webkit-tap-highlight-color:transparent] has-checked:bg-primary-base cursor-pointer`}
            >
              <input
                className="peer sr-only"
                onChange={(e) => setFeatured(e.target.checked)}
                defaultChecked={featured}
                type="checkbox"
                disabled={isLoading}
              />
              <ToggleIcon />
            </label>
          </div>
          <ButtonPrimary onClick={publish} disabled={isLoading}>
            {isLoading ? <LoadingDots /> : "Publier"}
          </ButtonPrimary>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col gap-10 lg:gap-14 overflow-y-scroll"
      >
        <section className="snap-start w-full flex flex-col gap-6">
          <div className="rounded-xl w-full h-160 relative">
            <Image
              className="h-160 object-cover object-top rounded-xl"
              src={draft.imageUrl ?? ""}
              alt={draft.title ?? ""}
              fill
            />
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
                <span className="text-[1.4rem] text-white">
                  {author.fullName}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 rounded-[3rem] w-fit bg-white uppercase flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <CalendarDays
                    stroke="#fff"
                    fill="#334155"
                    size={12}
                    color="#334155"
                  />
                  {formaDate(draft.updatedAt)}
                </div>
                <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Clock4 size={12} color="#334155" />
                  {calculateReadingTime(draft.content ?? "")} mins
                </div>
                {draft.category === "Style de vie" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <Coffee size={12} color="#fff" />
                    {TruncateUrl(draft.category!, 16)}
                  </div>
                )}
                {draft.category === "Actualités" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <Landmark size={12} color="#fff" />
                    {TruncateUrl(draft.category!, 16)}
                  </div>
                )}
                {draft.category === "Le Spotlight" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <Mic size={12} color="#fff" />
                    {TruncateUrl(draft.category!, 16)}
                  </div>
                )}
                {draft.category === "Technologies" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <RadioTower size={12} color="#fff" />
                    {TruncateUrl(draft.category!, 16)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <h1 className="font-secondary text-[1.8rem] lg:text-8 font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
              The Quiet Power of Slowing Down
            </h1>
            <div className="hidden lg:flex gap-4">
              <p className="text-[1.4rem] font-secondary font-medium leading-[145%] tracking-[-0.42px]">
                {progress}% <span className="text-[#A3A3A3]">done</span>
              </p>
              <div className="w-8 h-8">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 32 32"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    fill="white"
                    stroke="#E8E8E8"
                    strokeWidth="3"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    fill="none"
                    stroke="#163300"
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 13}
                    strokeDashoffset={2 * Math.PI * 13 * (1 - progress / 100)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="font-bold text-[2rem] pb-8 text-[#333333]">
              Table des matières
            </p>
            <ul className="flex flex-col gap-4">
              {headings.map(({ id, text }, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToHeading(id)}
                    className={`text-left w-full text-[1.6rem] flex items-center gap-4 leading-[145%] px-4 py-[5px] rounded-[5px] transition-all duration-200 cursor-pointer
                      ${
                        activeId === id
                          ? "text-[#000000] font-medium bg-[#F8F8F8]"
                          : "text-[#A3A3A3] hover:text-[#333333] hover:bg-[#F8F8F8]"
                      }`}
                  >
                    {activeId === id && (
                      <div className="h-6 w-6 rounded-[5px] bg-primary-500"></div>
                    )}{" "}
                    {TruncateUrl(text, 35)}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="col-span-2 tinymce-content w-full flex flex-col">
            {content}
          </div>
        </section>
      </div>
    </>
  );
}
