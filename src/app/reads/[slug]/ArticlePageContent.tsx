"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  User as UserIcon,
  Coffee,
  Landmark,
  Mic,
  RadioTower,
} from "lucide-react";
import TruncateUrl from "@/lib/TruncateUrl";
import { useState } from "react";
import { Read, User } from "@/types/types";
import ShareButton from "@/components/shared/ShareButton";
import Time from "@/assets/icons/TimeFill.svg";
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
import { SimpleArtworkCard } from "@/components/shared/cards";
import { useSession } from "next-auth/react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingDots from "@/components/loaders/LoadingDots";
import { AddReadComment } from "@/action/reads";
import { toast } from "sonner";
import { timeAgo } from "@/lib/timeAgo";
import NoAuthDialog from "@/components/shared/NoAuthDialog";
import {
  AddReadToFavorite,
  RemoveReadFromFavorite,
} from "@/components/shared/Bookmark";

const CommentSchema = z.object({
  comment: z.string().min(3, { error: "Insérez au moins 3 caractères" }),
});
type TCommentSchema = z.infer<typeof CommentSchema>;

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
  const { data: session } = useSession();

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

  const {
    register,
    handleSubmit,
    resetField,
    formState: { isSubmitting },
  } = useForm<TCommentSchema>({ resolver: zodResolver(CommentSchema) });
  const [wordCount, setWordCount] = useState(0);
  async function submitHandler(data: TCommentSchema) {
    const result = await AddReadComment({
      body: { readId: read.readId, comment: data.comment },
      read: read,
      user: session?.user as User,
    });
    if (result.success === true) {
      toast.success("Votre commentaire a été publié.");
      resetField("comment");
    } else {
      toast.error(result.error);
    }
  }
  const relatedLinks = relateds.slice(0, 3);
  const relatedCards = relateds.slice(3);
  const isFavorite =
    read.favorites &&
    !!read.favorites.filter((f) => f.userId === session?.user.userId).length;
  return (
    <>
      <div className="flex border-b border-[#F9F9F9]  gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.back()}
            className="p-4 rounded-xl bg-[#F8F8F8] flex items-center cursor-pointer"
          >
            <ChevronLeft width={20} height={20} />
          </button>
          <span className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
            Lectures
            <div>
              <ChevronRight width={20} />
            </div>
            {read.title}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <ShareButton
            entity="read"
            url={`${process.env.NEXT_PUBLIC_APP_URL}/reads/${Slugify(read.title)}`}
          />
          <div className="flex lg:hidden gap-4">
            <p className="text-[1.4rem] font-secondary font-medium leading-[145%] tracking-[-0.42px]">
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
          {passedSections > 0 && (
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
        onScroll={handleProgressScroll}
        className="flex flex-col gap-10 lg:gap-14 overflow-y-scroll"
      >
        <section
          data-section={0}
          className="snap-start w-full flex flex-col gap-6"
        >
          <div className="rounded-xl w-full h-160 relative">
            {isFavorite ? (
              <RemoveReadFromFavorite read={read} />
            ) : (
              <AddReadToFavorite read={read} />
            )}
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
                <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit bg-white uppercase flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <CalendarDays
                    stroke="#fff"
                    fill="#334155"
                    size={15}
                    color="#334155"
                  />
                  {formaDate(read.updatedAt)}
                </div>
                <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Image src={Time} alt="time" width={15} height={15} />
                  {calculateReadingTime(read.content)} mins
                </div>
                {read.category === "Style de vie" && (
                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                    <Coffee size={12} color="#fff" />
                    <span className="hidden lg:inline">
                      {TruncateUrl(read.category, 16)}
                    </span>
                    <span className=" lg:hidden">
                      {TruncateUrl(read.category, 5)}
                    </span>
                  </div>
                )}
                {read.category === "Actualités" && (
                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                    <Landmark size={12} color="#fff" />
                    <span className="hidden lg:inline">
                      {TruncateUrl(read.category, 16)}
                    </span>
                    <span className=" lg:hidden">
                      {TruncateUrl(read.category, 5)}
                    </span>
                  </div>
                )}
                {read.category === "Le Spotlight" && (
                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                    <Mic size={12} color="#fff" />
                    <span className="hidden lg:inline">
                      {TruncateUrl(read.category, 16)}
                    </span>
                    <span className=" lg:hidden">
                      {TruncateUrl(read.category, 5)}
                    </span>
                  </div>
                )}
                {read.category === "Technologies" && (
                  <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                    <RadioTower size={12} color="#fff" />
                    <span className="hidden lg:inline">
                      {TruncateUrl(read.category, 16)}
                    </span>
                    <span className=" lg:hidden">
                      {TruncateUrl(read.category, 5)}
                    </span>
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

        <section
          data-section={1}
          className="grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-12 w-full"
        >
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="font-bold text-[2rem] pb-8 text-[#333333]">
              Table des matières
            </p>
            <ul className="flex flex-col gap-4">
              {headings.map(({ id, text }, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToHeading(id)}
                    className={`text-left w-full text-[1.6rem] flex items-center gap-4 leading-[145%] px-4 py-2 rounded-[5px] transition-all duration-200 cursor-pointer
                      ${
                        activeId === id
                          ? "text-[#000000] font-medium bg-[#F8F8F8]"
                          : "text-[#A3A3A3] hover:text-[#333333] hover:bg-[#F8F8F8]"
                      }`}
                  >
                    {activeId === id && (
                      <div className="w-6 h-6 rounded-[5px] bg-primary-500 shrink-0"></div>
                    )}{" "}
                    <span className="truncate">{TruncateUrl(text, 35)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className=" col-span-2 w-full flex flex-col gap-8">
            <div
              ref={articleRef}
              className="  tinymce-content w-full flex flex-col"
            >
              {content}
            </div>
            <ul className="flex flex-col gap-4">
              <li className="text-[1.6rem] font-secondary leading-[145%] tracking-[-0.48] font-bold">
                À lire aussi
              </li>
              {relatedLinks.map((related) => {
                return (
                  <li
                    key={related.readId}
                    className="w-full flex justify-between p-4 bg-[#F8F8F8] rounded-full"
                  >
                    <Link
                      href={`/reads/${Slugify(related.title)}`}
                      className="flex items-center gap-4"
                    >
                      <div className="bg-primary-700 rounded-full p-2 w-8 h-8">
                        <Image
                          src={LinkFill}
                          alt="link fill"
                          width={10}
                          height={10}
                        />
                      </div>
                      <p className="font-secondary text-[1.6rem] leading-[145%] tracking-[-0.48] decoration-solid underline decoration-auto underline-offset-auto">
                        {related.title}
                      </p>
                    </Link>
                    <Link href={`/reads/${Slugify(related.title)}`}>
                      <Image
                        src={ExternalLinkFill}
                        alt="external link"
                        width={20}
                        height={20}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        {/* Stats and comments */}
        <section className="snap-start grid grid-cols-1 lg:grid-cols-3 gap-12 border-[#E8E8E8] border-t pt-14">
          {/* Stats */}
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
                <span>{read.readComments.length}</span>
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
          {/* comments */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {session?.user ? (
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="flex flex-col gap-6"
              >
                <textarea
                  className={`peer transition-all resize-none duration-300 delay-200 bg-[#F8F8F8] w-[calc(100%-3px)] h-[200px] rounded-[5px] px-3.5 p-[18px] text-[1.4rem] leading-8 placeholder:text-gray-400 text-[#333333] outline-none border border-transparent focus:border focus:border-[#9FE870] focus:outline-none focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:border-none disabled:cursor-not-allowed`}
                  {...register("comment")}
                  onChange={(e) => setWordCount(e.target.value.length)}
                  placeholder="Partagez librement vos impressions, vos suggestions ou vos observations dans cet espace ; votre voix compte et contribue à rendre la conversation plus riche et inclusive…"
                />{" "}
                {wordCount > 0 && (
                  <span
                    className={`text-right ${wordCount < 3 ? "text-failure" : "text-success"}`}
                  >
                    {wordCount}/500
                  </span>
                )}
                <ButtonPrimary
                  className="px-6 py-4 flex gap-[0.8rem] self-end"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingDots />
                  ) : (
                    <span className="flex gap-[0.8rem]">
                      {" "}
                      <Image src={Send} alt="Send comment" />
                      {"Comment"}
                    </span>
                  )}
                </ButtonPrimary>
              </form>
            ) : (
              <div className="self-center">
                <NoAuthDialog>
                  <div className="mt-18 w-fit flex flex-col items-center self-center gap-6">
                    <Image
                      src={CommentFillLighter}
                      alt="Comment"
                      width={45}
                      height={45}
                    />
                    <span className="w-full flex gap-[0.8rem] border-2 border-transparent text-center  h-auto transition-all duration-400 items-center justify-center cursor-pointer rounded-[5px] bg-[#9FE870] font-secondary text-[16px] font-bold tracking-[-0.48px] text-primary-base leading-[145%] px-[25px] py-[1.2rem] disabled:bg-[#E8E8E8] disabled:text-white  disabled:cursor-not-allowed">
                      <Image src={UserAdd} alt="User add" />
                      Connectez-vous pour laisser un commentaire.
                    </span>
                  </div>
                </NoAuthDialog>
              </div>
            )}
            <div className=" flex flex-col w-full">
              <span className="font-secondary text-[2rem] leading-[120%] tracking-[-0.6] text-[#333] font-bold">
                Commentaires
              </span>
              {read.readComments.length === 0 && (
                <div className="mt-18 w-fit flex flex-col items-center self-center gap-6">
                  <Image
                    src={CommentFillLighter}
                    alt="Comment"
                    width={45}
                    height={45}
                  />
                  <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] text-[#A3A3A3] font-medium">
                    Pas de commentaire pour l’instant.
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-6 mt-8">
                {read.readComments.map((comment, key) => {
                  return (
                    <div key={key} className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        {comment.user.profileImageUrl ? (
                          <Image
                            src={comment.user.profileImageUrl}
                            alt={comment.user.firstName}
                            width={25}
                            height={25}
                            className="rounded-full"
                          />
                        ) : (
                          <Image src={UserFill} alt="user icon" width={20} />
                        )}
                        <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium">
                          {comment.user.firstName} {comment.user.lastName}{" "}
                          <span className="text-[#A3A3A3]">
                            &bull; {timeAgo(comment.createdAt)}
                          </span>
                        </span>
                      </div>
                      <blockquote className="ml-6 bg-[#F9F9F9] rounded-xl p-4 items-center font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px]">
                        {comment.comment}
                      </blockquote>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        {/* Related Cards */}
        {relateds.length > 0 && (
          <section
            data-section={2}
            className="snap-start mt-6 flex flex-col gap-8"
          >
            <div className="flex justify-between font-secondary font-bold items-center">
              <span className="text-[2rem] lg:text-[2.4rem] leading-[120%] tracking-[-0.6px] lg:tracking-[-0.72px]">
                Récits choisis pour vous 
              </span>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
              <ul className="list-3 pt-4">
                {[...relatedCards]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((related) => {
                    return (
                      <li key={related.readId}>
                        <SimpleArtworkCard read={related} />
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
