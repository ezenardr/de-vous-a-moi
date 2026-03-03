"use client";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
import { formaDate } from "@/lib/formatDate";
import Slugify from "@/lib/Slugify";
import TruncateUrl from "@/lib/TruncateUrl";
import { Read, ReadDraft } from "@/types/types";
import {
  CalendarDays,
  Clock4,
  Coffee,
  Landmark,
  Mic,
  RadioTower,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import pic from "@/assets/images/test-image.jpg";
import { AddReadToFavorite, RemoveReadFromFavorite } from "./Bookmark";
import { useSession } from "next-auth/react";

export function SimpleArtworkCard({ read }: { read: Read }) {
  const { data: session } = useSession();
  const isFavorite =
    read.favorites &&
    !!read.favorites.filter((f) => f.userId === session?.user.userId).length;
  return (
    <Link
      href={`/reads/${Slugify(read.title)}`}
      className="flex flex-col gap-4"
    >
      <div className="rounded-[5px] overflow-hidden relative">
        {isFavorite ? (
          <RemoveReadFromFavorite read={read} />
        ) : (
          <AddReadToFavorite read={read} />
        )}
        <Image
          className="h-[250px] object-cover w-full object-top"
          src={read.imageUrl}
          alt={read.title}
          width={360}
          height={250}
        />
        <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
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
              <div className="bg-white h-[25px] w-[25px] border border-secondary-base flex flex-col items-center justify-center rounded-full">
                <User size={20} color="#9FE870" />
              </div>
            )}
            <span className="text-[1.4rem] text-white">
              {read.user.firstName} {read.user.lastName}
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
              {formaDate(read.createdAt).toUpperCase()}
            </div>
            <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
              <Clock4 size={12} color="#334155" />
              {calculateReadingTime(read.content)} mins
            </div>
            {read.category === "Style de vie" && (
              <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                <Coffee size={12} color="#fff" />
                <span className="hidden lg:inline">
                  {TruncateUrl(read.category, 7)}
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
                  {TruncateUrl(read.category, 7)}
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
                  {TruncateUrl(read.category, 7)}
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
                  {TruncateUrl(read.category, 7)}
                </span>
                <span className=" lg:hidden">
                  {TruncateUrl(read.category, 5)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="font-secondary font-medium text-[1.6rem] text-[#333333]">
        {read.title}
      </span>
    </Link>
  );
}

export function DraftArticleCard({ draft }: { draft: ReadDraft }) {
  return (
    <Link
      href={`/author/reads/draft/${draft.readDraftId}`}
      className="flex flex-col gap-4"
    >
      <div className="rounded-[5px] overflow-hidden relative">
        <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase absolute top-4 right-4 bg-secondary-100 items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-secondary-900 font-secondary">
          Brouillon
        </div>

        <Image
          className="h-[250px] object-cover w-full object-top"
          src={draft.imageUrl ?? pic}
          alt={draft.title ?? "Draft"}
          width={360}
          height={250}
        />
        <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
          <div className="flex items-center gap-4">
            {draft.user.profileImageUrl ? (
              <Image
                src={draft.user.profileImageUrl}
                alt={draft.user.firstName}
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
              {draft.user.firstName} {draft.user.lastName}
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
              {formaDate(draft.createdAt).toUpperCase()}
            </div>
            <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
              <Clock4 size={12} color="#334155" />
              {calculateReadingTime(draft.content ?? "")} mins
            </div>
            {draft.category === "Style de vie" && (
              <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                <Coffee size={12} color="#fff" />
                <span className="hidden lg:inline">
                  {TruncateUrl(draft.category, 7)}
                </span>
                <span className=" lg:hidden">
                  {TruncateUrl(draft.category, 16)}
                </span>
              </div>
            )}
            {draft.category === "Actualités" && (
              <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                <Landmark size={12} color="#fff" />
                <span className="hidden lg:inline">
                  {TruncateUrl(draft.category, 7)}
                </span>
                <span className=" lg:hidden">
                  {TruncateUrl(draft.category, 16)}
                </span>
              </div>
            )}
            {draft.category === "Le Spotlight" && (
              <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                <Mic size={12} color="#fff" />
                <span className="hidden lg:inline">
                  {TruncateUrl(draft.category, 7)}
                </span>
                <span className=" lg:hidden">
                  {TruncateUrl(draft.category, 16)}
                </span>
              </div>
            )}
            {draft.category === "Technologies" && (
              <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                <RadioTower size={12} color="#fff" />
                <span className="hidden lg:inline">
                  {TruncateUrl(draft.category, 7)}
                </span>
                <span className=" lg:hidden">
                  {TruncateUrl(draft.category, 16)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="font-secondary font-medium text-[1.6rem] text-[#333333]">
        {draft.title}
      </span>
    </Link>
  );
}
