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
  User,
} from "lucide-react";
import TruncateUrl from "@/lib/TruncateUrl";
import { useState } from "react";
import { Read } from "@/types/types";
import ShareButton from "@/components/shared/ShareButton";
import Slugify from "@/lib/Slugify";
import parse from "html-react-parser";
import { useRouter } from "next/navigation";
import { formaDate } from "@/lib/formatDate";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
import LinkFill from "@/assets/icons/LinkFill.svg";
import CommentFill from "@/assets/icons/CommentFill.svg";
import Send from "@/assets/icons/SendFill.svg";
import UserAdd from "@/assets/icons/UserAdd.svg";
import ShareArticleFill from "@/assets/icons/ShareArticleFill.svg";
import UserFill from "@/assets/icons/UserFill.svg";
import Link from "next/link";
import ExternalLinkFill from "@/assets/icons/ExternalLinkFill.svg";
import LikeFill from "@/assets/icons/LikeFill.svg";
import ChartBarFill from "@/assets/icons/ChartBarFill.svg";
import CommentFillLighter from "@/assets/icons/CommentFill2.svg";
import { ButtonPrimary } from "@/components/shared/Buttons";

export default function ArticlePageContent({
  read,
  relateds,
}: {
  read: Read;
  relateds: Read[];
}) {
  const content = parse(`${read.content}`);
  const [progress, setProgress] = useState(0);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const router = useRouter();

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
            {read.title}
          </span>
        </div>
        <ShareButton
          entity="read"
          url={`${process.env.NEXT_PUBLIC_APP_URL}/reads/${Slugify(read.title)}`}
        />
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col gap-10 lg:gap-14 overflow-y-scroll"
      >
        <section className="snap-start w-full flex flex-col gap-6">
          <div className="rounded-xl w-full h-160 relative">
            <Image
              className="h-160 object-cover object-top rounded-xl"
              src={read.imageUrl ?? ""}
              alt={read.title ?? ""}
              fill
            />
            <div className="backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 lg:gap-0 lg:flex-row lg:justify-between rounded-[1.5rem]">
              <div className="flex items-center gap-4">
                {read.user.profileImageUrl ? (
                  <Image
                    src={read.user.profileImageUrl}
                    alt={read.user.firstName}
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
                  {read.user.firstName} {read.user.lastName}
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
                  {formaDate(read.updatedAt)}
                </div>
                <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Clock4 size={12} color="#334155" />
                  {calculateReadingTime(read.content)} mins
                </div>
                {read.category === "Style de vie" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <Coffee size={12} color="#fff" />
                    {TruncateUrl(read.category!, 16)}
                  </div>
                )}
                {read.category === "Actualités" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <Landmark size={12} color="#fff" />
                    {TruncateUrl(read.category!, 16)}
                  </div>
                )}
                {read.category === "Le Spotlight" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <Mic size={12} color="#fff" />
                    {TruncateUrl(read.category!, 16)}
                  </div>
                )}
                {read.category === "Technologies" && (
                  <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                    <RadioTower size={12} color="#fff" />
                    {TruncateUrl(read.category!, 16)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <h1 className="font-secondary text-[1.8rem] lg:text-8 font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
              {read.title}
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

          <div className=" col-span-2 w-full flex flex-col gap-8">
            <div className="  tinymce-content w-full flex flex-col">
              {content}
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-[1.6rem] font-secondary leading-[145%] tracking-[-0.48] font-bold">
                Related Reads
              </h1>
              <div className="w-full flex justify-between p-4 bg-[#F8F8F8] rounded-full">
                <Link href={"/reads/1"} className="flex items-center gap-4">
                  <div className="bg-primary-700 rounded-full p-2 w-8 h-8">
                    <Image
                      src={LinkFill}
                      alt="link fill"
                      width={10}
                      height={10}
                    />
                  </div>
                  <p className="font-secondary text-[1.6rem] leading-[145%] tracking-[-0.48] decoration-solid underline decoration-auto underline-offset-auto">
                    5 Habits That Made My Mornings Better
                  </p>
                </Link>
                <Link href={"/reads/1"}>
                  <Image
                    src={ExternalLinkFill}
                    alt="external link"
                    width={20}
                    height={20}
                  />
                </Link>
              </div>
              <div className="w-full flex justify-between p-4 bg-[#F8F8F8] rounded-full">
                <Link href={"/reads/1"} className="flex items-center gap-4">
                  <div className="bg-primary-700 rounded-full p-2 w-8 h-8">
                    <Image src={LinkFill} alt="link" width={10} height={10} />
                  </div>
                  <p className="font-secondary text-[1.6rem] leading-[145%] tracking-[-0.48] decoration-solid underline decoration-auto underline-offset-auto">
                    Why Rest Is a Radical Act
                  </p>
                </Link>
                <Link href={"/reads/1"}>
                  <Image
                    src={ExternalLinkFill}
                    alt="external link"
                    width={20}
                    height={20}
                  />
                </Link>
              </div>
              <div className="w-full flex justify-between p-4 bg-[#F8F8F8] rounded-full">
                <Link href={"/reads/1"} className="flex items-center gap-4">
                  <div className="bg-primary-700 rounded-full p-2 w-8 h-8">
                    <Image src={LinkFill} alt="link" width={10} height={10} />
                  </div>
                  <p className="font-secondary text-[1.6rem] leading-[145%] tracking-[-0.48] decoration-solid underline decoration-auto underline-offset-auto">
                    Finding Meaning in the Everyday
                  </p>
                </Link>
                <Link href={"/reads/1"}>
                  <Image
                    src={ExternalLinkFill}
                    alt="external link"
                    width={20}
                    height={20}
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="snap-start grid grid-cols-1 lg:grid-cols-3 gap-12 border-[#E8E8E8] border-t pt-14">
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[1.4rem] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Vues</span>
              <div className="flex gap-4 items-center">
                <Image
                  src={ChartBarFill}
                  alt="Chart Bar"
                  width={20}
                  height={20}
                />
                <span>1</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[1.4rem] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Favoris</span>
              <div className="flex gap-4 items-center">
                <Image src={LikeFill} alt="like" width={20} height={20} />
                <span>0</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Commentaires</span>
              <div className="flex gap-4 items-center">
                <Image src={CommentFill} alt="Comment" width={20} height={20} />
                <span>0</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Partages</span>
              <div className="flex gap-4 items-center">
                <Image
                  src={ShareArticleFill}
                  alt="Share Article"
                  width={20}
                  height={20}
                />
                <span>0</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <textarea
                className={`peer transition-all resize-none duration-300 delay-200 bg-[#F8F8F8] w-[calc(100%-3px)] h-[200px] rounded-[5px] px-3.5 p-[18px] text-[1.4rem] leading-8 placeholder:text-gray-400 text-[#333333] outline-none border border-transparent focus:border focus:border-[#9FE870] focus:outline-none focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:border-none disabled:cursor-not-allowed`}
                // {...register("comment")}
                placeholder="How taking intentional breaks can help you think more clearly, create with purpose, and live a life that feels truly balanced."
              />
              {true && (
                <ButtonPrimary
                  className="px-6 py-4 flex gap-[0.8rem] self-end"
                  type="submit"
                >
                  <Image src={Send} alt="Send comment" />
                  {"Comment"}
                </ButtonPrimary>
              )}
            </div>
            <div className=" flex flex-col w-full">
              <span className="font-secondary text-[2rem] leading-[120%] tracking-[-0.6] text-[#333] font-bold">
                Comments
              </span>
              {/* condition si il n'y a pas de comments (c hidden pour l'intant)*/}
              <div className="mt-18 flex-col items-center self-center gap-6">
                <Image
                  src={CommentFillLighter}
                  alt="Comment"
                  width={45}
                  height={45}
                />
                <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] text-[#A3A3A3] font-medium">
                  No comments on this yet
                </span>
                <ButtonPrimary
                  className="w-full flex gap-[0.8rem]"
                  type="submit"
                >
                  <Image src={UserAdd} alt="User add" />
                  {"Sign in to like and comment"}
                </ButtonPrimary>
              </div>
              {/* condition si il y en a*/}
              <div className="flex flex-col gap-6 mt-8">
                {Array.from({ length: 6 }).map((_, key) => {
                  return (
                    <div key={key} className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <Image src={UserFill} alt="user icon" width={20} />
                        <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium">
                          Edshy JB
                        </span>
                      </div>
                      <blockquote className="ml-6 bg-[#F9F9F9] rounded-xl p-4 items-center font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px]">
                        This came at the right time. I’ve been feeling guilty
                        about taking breaks lately, but reading this reminded me
                        that rest isn’t laziness — it’s necessary. Thank you for
                        this perspective.
                      </blockquote>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        {relateds.length > 0 && (
          <section className="snap-start mt-6 flex flex-col gap-8">
            <div className="flex justify-between font-secondary font-bold items-center">
              <span className="text-[2rem] lg:text-[2.4rem] leading-[120%] tracking-[-0.6px] lg:tracking-[-0.72px]">
                Récits choisis pour vous 
              </span>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
              <ul className="list-3 pt-4">
                {[...relateds]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((related) => {
                    return (
                      <li key={related.readId}>
                        <Link
                          href={`/author/reads/${related.readId}`}
                          className="flex flex-col gap-4"
                        >
                          <div className="rounded-[5px] overflow-hidden relative">
                            <Image
                              className="h-[250px] object-cover object-top"
                              src={related.imageUrl}
                              alt={related.title}
                              width={360}
                              height={250}
                            />
                            <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
                              <div className="flex items-center gap-4">
                                {related.user.profileImageUrl ? (
                                  <Image
                                    src={related.user.profileImageUrl}
                                    alt={related.user.firstName}
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="bg-white h-[25px] w-[25px] border border-secondary-base flex flex-col items-center justify-center rounded-full">
                                    <User size={20} color="#9FE870" />
                                  </div>
                                )}
                                <span className="text-[1.4rem] text-white">
                                  {related.user.firstName}{" "}
                                  {related.user.lastName}
                                </span>
                              </div>
                              <div className="flex gap-[5px]">
                                <div className="px-4 py-[5px] rounded-[3rem] w-fit bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                                  <CalendarDays
                                    stroke="#fff"
                                    fill="#334155"
                                    size={12}
                                    color="#334155"
                                  />
                                  {formaDate(related.createdAt).toUpperCase()}
                                </div>
                                <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                                  <Clock4 size={12} color="#334155" />
                                  {calculateReadingTime(related.content)} mins
                                </div>
                                {related.category === "Style de vie" && (
                                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                    <Coffee size={12} color="#fff" />
                                    <span className="hidden lg:inline">
                                      {TruncateUrl(related.category, 7)}
                                    </span>
                                    <span className=" lg:hidden">
                                      {TruncateUrl(related.category, 16)}
                                    </span>
                                  </div>
                                )}
                                {related.category === "Actualités" && (
                                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                    <Landmark size={12} color="#fff" />
                                    <span className="hidden lg:inline">
                                      {TruncateUrl(related.category, 7)}
                                    </span>
                                    <span className=" lg:hidden">
                                      {TruncateUrl(related.category, 16)}
                                    </span>
                                  </div>
                                )}
                                {related.category === "Le Spotlight" && (
                                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                    <Mic size={12} color="#fff" />
                                    <span className="hidden lg:inline">
                                      {TruncateUrl(related.category, 7)}
                                    </span>
                                    <span className=" lg:hidden">
                                      {TruncateUrl(related.category, 16)}
                                    </span>
                                  </div>
                                )}
                                {related.category === "Technologies" && (
                                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                    <RadioTower size={12} color="#fff" />
                                    <span className="hidden lg:inline">
                                      {TruncateUrl(related.category, 7)}
                                    </span>
                                    <span className=" lg:hidden">
                                      {TruncateUrl(related.category, 16)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="font-secondary font-medium text-[1.6rem] text-[#333333]">
                            {related.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                <div></div>
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
