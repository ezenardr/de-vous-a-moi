"use client";
import AppLayout from "@/components/layouts/AppLayout";
import React from "react";
import { ButtonPrimary } from "@/components/shared/Buttons";
import Image from "next/image";
import Share from "@/assets/icons/ShareForwardFill.svg";
import LinkFill from "@/assets/icons/LinkFill.svg";
import CommentFill from "@/assets/icons/CommentFill.svg";
import Send from "@/assets/icons/SendFill.svg";
import Play from "@/assets/icons/PlayFill.svg";
import UserAdd from "@/assets/icons/UserAdd.svg";
import ShareArticleFill from "@/assets/icons/ShareArticleFill.svg";
import UserFill from "@/assets/icons/UserFill.svg";
import Link from "next/link";
import BookMarkBlack from "@/assets/icons/BookmarkLineBlack.svg";
import ExternalLinkFill from "@/assets/icons/ExternalLinkFill.svg";
import LikeFill from "@/assets/icons/LikeFill.svg";
import ChartBarFill from "@/assets/icons/ChartBarFill.svg";
import CommentFillLighter from "@/assets/icons/CommentFill2.svg";
import {
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  User,
} from "lucide-react";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import pic from "@/assets/images/test-image.jpg";
import ChartFill from "@/assets/icons/ChartFill.svg";
import Time from "@/assets/icons/TimeFill.svg";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function WatchesOpenPage() {
  const formattedDate = "3 dec 2060";
  const { register, watch } = useForm();
  const comment = watch("comment");
  return (
    <AppLayout>
      <div className="flex  border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <Link
          href={"/watches"}
          className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] tracking-[-0.6px] text-[#333333]"
        >
          Videos
          <div>
            <ChevronRight width={20} />
          </div>
          The Quiet Power of Slowing Down
        </Link>
        <Link href={'/watches'} className="p-4 rounded-xl bg-[#F8F8F8] flex lg:hidden items-center">
          <ChevronLeft width={20} />
        </Link>
        <div className="flex gap-4 items-center">
          <div className="p-4 rounded-xl bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
            <Image src={BookMarkBlack} alt="Board Fill" width={20} height={20} />
            <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">Save video</span>
          </div>
          <div className="p-4 rounded-xl bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
            <Image src={Share} width={20} alt="Share" />
            <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
              Share video
            </span>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col gap-10 lg:gap-14 overflow-y-auto "
      >
        <section className="snap-start w-full flex flex-col gap-6">
          <div className="h-140 rounded-xl w-full lg:h-160 relative">
            <span className="flex z-50 gap-2 p-2 font-bold font-secondary text-[1.4rem] text-white leading-[145%] tracking-[-0.42px] backdrop-blur-xs  rounded-full absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] items-center">
              <Image src={Play} alt="Play" width={20} height={20} />
              Play video
            </span>
            <Image
              className="h-140 lg:h-160 object-cover object-top rounded-xl"
              src={pic}
              alt={"Draft"}
              fill
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-0 justify-between">
              <h1 className="font-secondary text-[1.8rem] lg:text-8 font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                The Quiet Power of Slowing Down
              </h1>
              <div className="flex gap-2">
                <div className="p-2 lg:px-4 lg:py-2 rounded-[3rem] w-fit bg-[#F8FAFC] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <CalendarDays
                    stroke="#fff"
                    fill="#334155"
                    size={12}
                    color="#334155"
                  />
                  {formattedDate.toUpperCase()}
                </div>
                <div className="p-2 lg:px-4 lg:py-2 rounded-[3rem] w-fit uppercase bg-[#F8FAFC] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Image src={Time} alt="time" width={15} height={15} />
                  8:11
                </div>
                <div className="flex p-2 lg:px-4 lg:py-2 rounded-[3rem] w-fit uppercase bg-[#F8FAFC] lg:flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                  <Image
                    src={ChartFill}
                    alt="Chart Bar"
                    width={15}
                    height={15}
                  />
                  3,309
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white h-10 w-10 border border-secondary-base flex flex-col items-center justify-center rounded-full">
                <User size={20} color="#9FE870" />
              </div>
              <span className="text-[1.6rem] text-[#333] font-medium leading-[145%] tracking-[-0.48px]">
                Edshy JB
              </span>
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
              Recommended watches
            </span>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
            <ul className="list-3">
              {Array.from({ length: 3 }).map((_, key) => {
                return (
                  <li key={key} className="flex flex-col gap-4">
                    <Link href={`/watches/1`} className="flex flex-col gap-4">
                      <div className="rounded-xl overflow-hidden relative">
                        <div className="px-4 py-4 backdrop-blur-xs  rounded-full absolute top-4 right-4 items-center gap-[5px]">
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
                              <Image
                                src={Time}
                                alt="time"
                                width={15}
                                height={15}
                              />
                              8:11
                            </div>
                            <div className="flex px-4 py-2 rounded-[3rem] w-fit uppercase bg-white lg:flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                              <Image
                                src={ChartFill}
                                alt="Chart Bar"
                                width={15}
                                height={15}
                              />
                              3,309
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
