"use client";
import AppLayout from "@/components/layouts/AppLayout";
import React, { useEffect, useRef } from "react";
import { ButtonPrimary } from "@/components/shared/Buttons";
import Image from "next/image";
import Share from "@/assets/icons/ShareForwardFill.svg";
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
import {
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Clock4,
  Plane,
  User,
} from "lucide-react";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import pic from "@/assets/images/test-image.jpg";
import TruncateUrl from "@/lib/TruncateUrl";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function ReadsOpenPage() {
  const formattedDate = "3 dec 2060";
  const { register, watch } = useForm();
  const comment = watch("comment");
  const [toc, setToc] = useState<{ text: string; index: number }[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const isScrolling = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      const headings = containerRef.current?.querySelectorAll("h1[data-index]");
      if (!headings) return;
      const items = Array.from(headings).map((h) => ({
        text: h.textContent ?? "",
        index: Number(h.getAttribute("data-index")),
      }));
      setToc(items);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(Number(entry.target.getAttribute("data-index")));
          }
        });
      },
      { root: containerRef.current, threshold: 0.1 },
    );
    const headings = containerRef.current?.querySelectorAll("h1[data-index]");
    headings?.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const saved = Number(localStorage.getItem("read-progress-article-1") ?? 0);
    setProgress(saved);
  }, []);
  const [scroll, setScroll] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const Scroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const pct = Math.round(
      (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100,
    );
    setScroll(Math.min(pct, 100));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const pct = Math.round(
      (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100,
    );
    setProgress(Math.min(pct, 100));
  };

  return (
    <AppLayout>
      <div className="flex  border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
          Lectures
          <div>
            <ChevronRight width={20} />
          </div>
          The Quiet Power of Slowing Down
        </span>
        <div className="p-4 rounded-xl bg-[#F8F8F8] flex lg:hidden items-center">
          <ChevronLeft width={20} />
        </div>
        <div className="flex gap-4 items-center">
          <div className="p-4 rounded-xl bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
            <Image src={Share} width={20} alt="Share" />
            <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
              Share read
            </span>
          </div>
          <div className="flex lg:hidden gap-4">
            <p className="text-[1.4rem] font-secondary font-medium leading-[145%] tracking-[-0.42px] ">
              {progress}% {""} <span className="text-[#A3A3A3]">done</span>
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
          {scroll >= 1 && (
            <div className="hidden lg:flex gap-4">
              <p className="text-[1.4rem] font-secondary font-medium leading-[145%] tracking-[-0.42px] ">
                {progress}% {""} <span className="text-[#A3A3A3]">done</span>
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
          )}
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={Scroll}
        className="flex flex-col gap-10 lg:gap-14 overflow-y-auto snap-y snap-mandatory"
      >
        <section className="snap-start w-full flex flex-col gap-6">
          <div className="rounded-xl w-full h-160 relative">
            <div className="flex z-50 px-4 py-4 backdrop-blur-xs  rounded-full absolute top-4 right-4 items-center gap-2">
              <Image src={BookMark} alt="Board Fill" width={20} height={20} />
            </div>
            <Image
              className="h-160 object-cover object-top rounded-xl"
              src={pic}
              alt={"Draft"}
              fill
            />
            <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 lg:gap-0 lg:flex-row lg:justify-between rounded-[1.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-white h-10 w-10 border border-secondary-base flex flex-col items-center justify-center rounded-full">
                  <User size={20} color="#9FE870" />
                </div>
                <span className="text-[1.4rem] text-white">Edshy JB</span>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 rounded-[3rem] w-fit bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <CalendarDays
                    stroke="#fff"
                    fill="#334155"
                    size={12}
                    color="#334155"
                  />
                  {formattedDate.toUpperCase()}
                </div>
                <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Clock4 size={12} color="#334155" />3 mins
                </div>
                <div className="hidden px-4 py-2 rounded-[3rem] w-fit uppercase bg-white lg:flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Plane size={12} color="#334155" />
                  {TruncateUrl("Culture", 16)}
                </div>
                <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex lg:hidden items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Plane size={12} color="#334155" />
                  {TruncateUrl("Culture", 16)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <h1 className="font-secondary text-[1.8rem] lg:text-8 font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
              The Quiet Power of Slowing Down
            </h1>
            <div className="hidden lg:flex gap-4">
              <p className="text-[1.4rem] font-secondary font-medium leading-[145%] tracking-[-0.42px] ">
                {progress}% {""} <span className="text-[#A3A3A3]">done</span>
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
        <section className="snap-start grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
          <aside>
            <nav className="w-full flex flex-col gap-10 lg:gap-8">
              <h2 className="font-secondary text-[1.6rem] leading-[145%] tracking-[-0.48] font-medium lg:text-8 lg:leading-[120%] lg:tracking-[-0.6] lg:font-bold">
                Table of contents
              </h2>
              <ul className="flex flex-col gap-4 font-secondary text-[1.6rem] heading-[145%] tracking-[-0.48] ">
                {toc.map((item) => (
                  <li
                    key={item.index}
                    className={`flex items-center gap-4 font-medium px-4 py-2 rounded-[5px] cursor-pointer whitespace-nowrap
                        ${activeSection === item.index ? "bg-[#F8F8F8]" : "text-[#A3A3A3]"}`}
                    onClick={() => {
                      isScrolling.current = true;
                      const target = containerRef.current?.querySelector(
                        `h1[data-index="${item.index}"]`,
                      );
                      target?.scrollIntoView({ behavior: "smooth" });
                      setTimeout(() => {
                        isScrolling.current = false;
                        setActiveSection(item.index);
                      }, 800);
                    }}
                  >
                    {activeSection === item.index && (
                      <div className="bg-primary-500 rounded-[5px] w-[15px] h-[15px] shrink-0  whitespace-nowrap" />
                    )}

                    {TruncateUrl(item.text)}
                    {/* {item.text} */}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="col-span-2 w-full flex flex-col gap-6 h-screen overflow-y-auto"
          >
            <div className="w-full flex flex-col gap-6 ">
              <section className="flex flex-col gap-12 text-[1.6rem] font-secondary leading-[145%] tracking-[-0.48]">
                <h1 data-index={0}>🕰️ Introduction</h1>
                <p>
                  We live in a world that glorifies speed — fast work, fast
                  results, fast everything. But the truth is, constant motion
                  doesn’t always mean progress. Sometimes, the best way to move
                  forward is to pause. To slow down. To breathe.
                  <br /> This piece explores how stillness helps us think
                  better, create deeper, and live more intentionally.
                </p>
              </section>
              <section className="flex flex-col gap-12 text-[1.6rem] font-secondary leading-[145%] tracking-[-0.48]">
                <h1 data-index={1} className="font-bold">
                  🌿 1. The Myth of Constant Productivity
                </h1>
                <div>
                  <p>
                    For years, “busy” has been mistaken for “successful.” We’ve
                    been told that more hours, more meetings, and more goals
                    equal achievement.
                    <br /> But burnout tells a different story.
                  </p>
                  <div className="flex flex-col gap-2 mt-4 mb-4 p-4 bg-[#F8F8F8] rounded-xl">
                    <span className="w-full flex justify-items-end font-secondary text-[2.8rem] font-bold leading-[120%] tracking-[-0.84]">
                      “
                    </span>
                    <blockquote className="border-primary-500 border-l-2 p-4">
                      You can’t create from an empty space. Rest is part of the
                      work.
                    </blockquote>
                    <span className="w-full flex justify-end font-secondary text-[2.8rem] font-bold leading-[120%] tracking-[-0.84]">
                      ”
                    </span>
                  </div>
                  <p>
                    Slowing down doesn’t mean losing drive — it means respecting
                    your rhythm. When you give your mind room to breathe, ideas
                    flow more freely.
                  </p>
                </div>
              </section>
              <section className="flex flex-col gap-12 text-[1.6rem] font-secondary leading-[145%] tracking-[-0.48]">
                <h1 data-index={2} className="font-bold">
                  💭 2. Moments That Make Us Human
                </h1>
                <p>
                  Think of the quiet moments — a walk at sunset, sitting with a
                  cup of tea, journaling after a long day.
                  <br /> These aren’t wasted minutes; they’re where your mind
                  sorts through everything it’s been holding. Reflection gives
                  meaning to motion.
                  <br />
                  Storytelling, music, art — all thrive in stillness. Even great
                  thinkers and builders knew when to stop and listen before they
                  acted.
                </p>
              </section>
              <section className="flex flex-col gap-12 text-[1.6rem] font-secondary leading-[145%] tracking-[-0.48]">
                <h1 data-index={3} className="font-bold">
                  {" "}
                  ✍️ 3. Creativity in the Pause{" "}
                </h1>
                <p>
                  Slowing down fuels creativity. When we step away from screens
                  and schedules, our brain switches from “doing mode” to
                  “thinking mode.” That’s where innovation happens. A calm mind
                  is fertile ground for original thought — ideas connect in ways
                  they couldn’t under pressure.
                </p>
              </section>
              <section className="flex flex-col gap-12 text-[1.6rem] font-secondary leading-[145%] tracking-[-0.48]">
                <h1 data-index={4} className="font-bold">
                  🌸 4. Living Intentionally{" "}
                </h1>
                <div>
                  <p>
                    Slowing down invites you to notice — how you start your day,
                    who you spend time with, what truly matters. Intentional
                    living is not about doing less but about doing what counts.
                    It’s about presence over performance. Small rituals — like
                    morning walks, journaling, or just breathing before a
                    meeting — can turn ordinary days into mindful ones
                  </p>
                  <div className="flex flex-col gap-2 mt-4 mb-4 p-4 bg-[#F8F8F8] rounded-xl">
                    <span className="w-full flex justify-items-end font-secondary text-[2.8rem] font-bold leading-[120%] tracking-[-0.84]">
                      “
                    </span>
                    <blockquote className="border-primary-500 border-l-2 p-4">
                      Slow is smooth. Smooth is fast — Old Navy Saying
                    </blockquote>
                    <span className="w-full flex justify-end font-secondary text-[2.8rem] font-bold leading-[120%] tracking-[-0.84]">
                      ”
                    </span>
                  </div>
                </div>
              </section>
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
              <span className="text-[#A3A3A3]">Views</span>
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
              <span className="text-[#A3A3A3]">Likes</span>
              <div className="flex gap-4 items-center">
                <Image src={LikeFill} alt="like" width={20} height={20} />
                <span>0</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Comments</span>
              <div className="flex gap-4 items-center">
                <Image src={CommentFill} alt="Comment" width={20} height={20} />
                <span>0</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Shares</span>
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
                {...register("comment")}
                placeholder="How taking intentional breaks can help you think more clearly, create with purpose, and live a life that feels truly balanced."
              />
              {comment && (
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
              <div className="mt-18 hidden flex-col items-center self-center gap-6">
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
                    <div className="flex flex-col gap-4">
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
        <section className="snap-start mt-6 flex flex-col gap-8">
          <div className="flex justify-between font-secondary font-bold items-center">
            <span className="text-[2rem] lg:text-[2.4rem] leading-[120%] tracking-[-0.6px] lg:tracking-[-0.72px]">
              Recommended stories
            </span>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
            <ul className="list-3">
              {Array.from({ length: 3 }).map((_, key) => {
                return (
                  <li key={key} className="flex flex-col gap-4">
                    <Link href={`/reads/1`} className="flex flex-col gap-4">
                      <div className="rounded-xl overflow-hidden relative">
                        <div className="px-4 py-4 backdrop-blur-[5px]  rounded-full absolute top-4 right-4 items-center gap-[5px]">
                          <Image
                            src={BookMark}
                            alt="Board Fill"
                            width={20}
                            height={20}
                          />
                        </div>
                        <Image
                          className="h-100 object-cover object-top"
                          src={pic}
                          alt={"Draft"}
                        />
                        <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 rounded-[1.5rem]">
                          <div className="flex items-center gap-4">
                            <div className="bg-white h-10 w-10 border border-secondary-base flex flex-col items-center justify-center rounded-full">
                              <User size={20} color="#9FE870" />
                            </div>
                            <span className="text-[1.4rem] text-white">
                              Edshy JB
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div className="px-4 py-2 rounded-[3rem] w-fit bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                              <CalendarDays
                                stroke="#fff"
                                fill="#334155"
                                size={12}
                                color="#334155"
                              />
                              {formattedDate.toUpperCase()}
                            </div>
                            <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                              <Clock4 size={12} color="#334155" />3 mins
                            </div>
                            <div className="hidden px-4 py-2 rounded-[3rem] w-fit uppercase bg-white lg:flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                              <Plane size={12} color="#334155" />
                              {TruncateUrl("Culture", 16)}
                            </div>
                            <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex lg:hidden items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                              <Plane size={12} color="#334155" />
                              {TruncateUrl("Culture", 16)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="font-secondary font-medium text-[1.6rem] text-[#333333]">
                        The Last Time I Spoke to My Grandfather
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
