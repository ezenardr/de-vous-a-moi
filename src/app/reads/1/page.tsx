'use client'
import AppLayout from "@/components/layouts/AppLayout";
import React from "react";
import { ButtonPrimary } from "@/components/shared/Buttons";
import ReadProgress from "@/assets/icons/ReadProgress.svg";
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
  Import,
  Plane,
  User,
} from "lucide-react";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import pic from "@/assets/images/test-image.jpg";
import TruncateUrl from "@/lib/TruncateUrl";
import { register } from "module";
import { useForm } from "react-hook-form";

export default function ReadsOpenPage() {
  const formattedDate = "3 dec 2060";
  const { register, watch } = useForm();
  const comment = watch("comment");
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
        <div className="p-4 rounded-[5px] bg-[#F8F8F8] flex lg:hidden items-center">
          <ChevronLeft width={20} />
        </div>
        <div className="p-4 rounded-[5px] bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
          <Image src={Share} width={20} alt="Share" />
          <span className="font-secondary text-[14px] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
            Share read
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-10 lg:gap-[35px] overflow-y-auto">
        <div className="w-full flex flex-col gap-6">
          <div className="rounded-[5px] w-full h-[400px] relative">
            <div className="flex z-50 px-[10px] py-[10px] backdrop-blur-xs  rounded-full absolute top-[10px] right-[10px] items-center gap-[5px]">
              <Image src={BookMark} alt="Board Fill" width={20} height={20} />
            </div>
            <Image
              className="h-[400px] object-cover object-top rounded-[5px]"
              src={pic}
              alt={"Draft"}
              fill
            />
            <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 lg:gap-0 lg:flex-row lg:justify-between rounded-[1.5rem]">
              <div className="flex items-center gap-4">
                <div className="bg-white h-[25px] w-[25px] border border-secondary-base flex flex-col items-center justify-center rounded-full">
                  <User size={20} color="#9FE870" />
                </div>
                <span className="text-[1.4rem] text-white">Edshy JB</span>
              </div>
              <div className="flex gap-[5px]">
                <div className="px-4 py-[5px] rounded-[3rem] w-fit bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                  <CalendarDays
                    stroke="#fff"
                    fill="#334155"
                    size={12}
                    color="#334155"
                  />
                  {formattedDate.toUpperCase()}
                </div>
                <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                  <Clock4 size={12} color="#334155" />3 mins
                </div>
                <div className="hidden px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white lg:flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                  <Plane size={12} color="#334155" />
                  {TruncateUrl("Culture", 16)}
                </div>
                <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex lg:hidden items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                  <Plane size={12} color="#334155" />
                  {TruncateUrl("Culture", 16)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="font-secondary text-[18px] lg:text-[20px] font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
              The Quiet Power of Slowing Down
            </span>
            <div className="hidden lg:flex gap-4">
              <p className="text-[14px] font-secondary font-medium leading-[145%] tracking-[-0.42px] ">
                10% {""} <span className="text-[#A3A3A3]">done</span>
              </p>
              <div>
                <Image
                  src={ReadProgress}
                  alt="read progress"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
          <div className="w-full flex flex-col gap-10 lg:gap-8">
            <span className="font-secondary text-[16px] leading-[145%] tracking-[-0.48] font-medium lg:text-[20px] lg:leading-[120%] lg:tracking-[-0.6] lg:font-bold">
              Table of contents
            </span>
            <ol className="flex flex-col gap-4 font-secondary text-[16px] heading-[145%] tracking-[-0.48] ">
              <li className="flex items-center gap-4 font-medium px-4 py-2 bg-[#F8F8F8] rounded-[5px]">
                <div className="bg-primary-500 rounded-[5px] w-[15px] h-[15px]"></div>
                🕰️ Introduction
              </li>
              <li className=" px-4 py-2 text-[#A3A3A3]">
                🌿 1. The Myth of Constant Productivity
              </li>
              <li className=" px-4 py-2 text-[#A3A3A3]">
                💭 2. Moments That Make Us Human
              </li>
              <li className=" px-4 py-2 text-[#A3A3A3]">
                ✍️ 3. Creativity in the Pause
              </li>
              <li className=" px-4 py-2 text-[#A3A3A3]">
                🌸 4. Living Intentionally
              </li>
            </ol>
          </div>
          <div className="col-span-2 w-full flex flex-col gap-6 h-auto">
            <div className="w-full flex flex-col gap-6 ">
              <section className="flex flex-col gap-[30px] text-[16px] font-secondary leading-[145%] tracking-[-0.48]">
                <h2>🕰️ Introduction</h2>
                <p>
                  We live in a world that glorifies speed — fast work, fast
                  results, fast everything. But the truth is, constant motion
                  doesn’t always mean progress. Sometimes, the best way to move
                  forward is to pause. To slow down. To breathe.
                  <br /> This piece explores how stillness helps us think
                  better, create deeper, and live more intentionally.
                </p>
              </section>
              <section className="flex flex-col gap-[30px] text-[16px] font-secondary leading-[145%] tracking-[-0.48]">
                <h2 className="font-bold">
                  🌿 1. The Myth of Constant Productivity
                </h2>
                <div>
                  <p>
                    For years, “busy” has been mistaken for “successful.” We’ve
                    been told that more hours, more meetings, and more goals
                    equal achievement.
                    <br /> But burnout tells a different story.
                  </p>
                  <div className="flex flex-col gap-[5px] mt-4 mb-4 p-4 bg-[#F8F8F8] rounded-[5px]">
                    <span className="w-full flex justify-items-end font-secondary text-[28px] font-bold leading-[120%] tracking-[-0.84]">
                      “
                    </span>
                    <blockquote className="border-primary-500 border-l-2 p-4">
                      You can’t create from an empty space. Rest is part of the
                      work.
                    </blockquote>
                    <span className="w-full flex justify-end font-secondary text-[28px] font-bold leading-[120%] tracking-[-0.84]">
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
              <section className="flex flex-col gap-[30px] text-[16px] font-secondary leading-[145%] tracking-[-0.48]">
                <h2 className="font-bold">💭 2. Moments That Make Us Human</h2>
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
              <section className="flex flex-col gap-[30px] text-[16px] font-secondary leading-[145%] tracking-[-0.48]">
                <h2 className="font-bold"> ✍️ 3. Creativity in the Pause </h2>
                <p>
                  Slowing down fuels creativity. When we step away from screens
                  and schedules, our brain switches from “doing mode” to
                  “thinking mode.” That’s where innovation happens. A calm mind
                  is fertile ground for original thought — ideas connect in ways
                  they couldn’t under pressure.
                </p>
              </section>
              <section className="flex flex-col gap-[30px] text-[16px] font-secondary leading-[145%] tracking-[-0.48]">
                <h2 className="font-bold">🌸 4. Living Intentionally </h2>
                <div>
                  <p>
                    Slowing down invites you to notice — how you start your day,
                    who you spend time with, what truly matters. Intentional
                    living is not about doing less but about doing what counts.
                    It’s about presence over performance. Small rituals — like
                    morning walks, journaling, or just breathing before a
                    meeting — can turn ordinary days into mindful ones
                  </p>
                  <div className="flex flex-col gap-[5px] mt-4 mb-4 p-4 bg-[#F8F8F8] rounded-[5px]">
                    <span className="w-full flex justify-items-end font-secondary text-[28px] font-bold leading-[120%] tracking-[-0.84]">
                      “
                    </span>
                    <blockquote className="border-primary-500 border-l-2 p-4">
                      Slow is smooth. Smooth is fast — Old Navy Saying
                    </blockquote>
                    <span className="w-full flex justify-end font-secondary text-[28px] font-bold leading-[120%] tracking-[-0.84]">
                      ”
                    </span>
                  </div>
                </div>
              </section>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-[16px] font-secondary leading-[145%] tracking-[-0.48] font-bold">
                Related Reads
              </h2>
              <div className="w-full flex justify-between p-4 bg-[#F8F8F8] rounded-full">
                <Link href={"/reads/1"} className="flex items-center gap-4">
                  <div className="bg-primary-700 rounded-full p-[5px] w-[20px] h-[20px]">
                    <Image src={LinkFill}alt="link fill" width={10} height={10} />
                  </div>
                  <p className="font-secondary text-[16px] leading-[145%] tracking-[-0.48] decoration-solid underline decoration-auto underline-offset-auto">
                    5 Habits That Made My Mornings Better
                  </p>
                </Link>
                <Link href={"/reads/1"}>
                  <Image src={ExternalLinkFill} alt="external link" width={20} height={20} />
                </Link>
              </div>
              <div className="w-full flex justify-between p-4 bg-[#F8F8F8] rounded-full">
                <Link href={"/reads/1"} className="flex items-center gap-4">
                  <div className="bg-primary-700 rounded-full p-[5px] w-[20px] h-[20px]">
                    <Image src={LinkFill} alt="link" width={10} height={10} />
                  </div>
                  <p className="font-secondary text-[16px] leading-[145%] tracking-[-0.48] decoration-solid underline decoration-auto underline-offset-auto">
                    Why Rest Is a Radical Act
                  </p>
                </Link>
                <Link href={"/reads/1"}>
                  <Image src={ExternalLinkFill} alt="external link" width={20} height={20} />
                </Link>
              </div>
              <div className="w-full flex justify-between p-4 bg-[#F8F8F8] rounded-full">
                <Link href={"/reads/1"} className="flex items-center gap-4">
                  <div className="bg-primary-700 rounded-full p-[5px] w-[20px] h-[20px]">
                    <Image src={LinkFill}  alt="link" width={10} height={10} />
                  </div>
                  <p className="font-secondary text-[16px] leading-[145%] tracking-[-0.48] decoration-solid underline decoration-auto underline-offset-auto">
                    Finding Meaning in the Everyday
                  </p>
                </Link>
                <Link href={"/reads/1"}>
                  <Image src={ExternalLinkFill} alt="external link" width={20} height={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-[#E8E8E8] border-t pt-[35px]">
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42]">
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
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42]">
              <span className="text-[#A3A3A3]">Likes</span>
              <div className="flex gap-4 items-center">
                <Image src={LikeFill} alt="like" width={20} height={20} />
                <span>0</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42]">
              <span className="text-[#A3A3A3]">Comments</span>
              <div className="flex gap-4 items-center">
                <Image src={CommentFill} alt="Comment" width={20} height={20} />
                <span>0</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42]">
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
                // minLength={100}
                // maxLength={150}
                {...register("comment")}
                // onChange={(e) => setDescriptionCount(e.target.value.length)}
                placeholder="How taking intentional breaks can help you think more clearly, create with purpose, and live a life that feels truly balanced."
              />
              {comment && (
                <ButtonPrimary
                  className="px-6 py-4 flex gap-[8px] self-end"
                  type="submit"
                >
                  <Image src={Send} alt="Send comment" />
                  {"Comment"}
                </ButtonPrimary>
              )}
            </div>
            <div className=" flex flex-col w-full">
              <span className="font-secondary text-[20px] leading-[120%] tracking-[-0.6] text-[#333] font-bold">
                Comments
              </span>
              {/* condition si il n'y a pas de comments (c hidden pour l'intant)*/}
              <div className="mt-[45px] hidden flex-col items-center self-center gap-6">
                <Image
                  src={CommentFillLighter}
                  alt="Comment"
                  width={45}
                  height={45}
                />
                <span className="font-secondary text-[14px] leading-[145%] tracking-[-0.42] text-[#A3A3A3] font-medium">
                  No comments on this yet
                </span>
                <ButtonPrimary className="w-full flex gap-[8px]" type="submit">
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
                        <span className="font-secondary text-[14px] leading-[145%] tracking-[-0.42] font-medium">
                          Edshy JB
                        </span>
                      </div>
                      <blockquote className="ml-6 bg-[#F9F9F9] rounded-[5px] p-4 items-center font-secondary text-[14px] leading-[145%] tracking-[-0.42]">
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
        </div>
        <div className="mt-6 flex flex-col gap-[20px]">
          <div className="flex justify-between font-secondary font-bold items-center">
            <span className="text-[20px] lg:text-[24px] leading-[120%] tracking-[-0.6px] lg:tracking-[-0.72px]">
              Recommended stories
            </span>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
            <ul className="list-3">
              {Array.from({ length: 3 }).map((_, key) => {
                return (
                  <li key={key} className="flex flex-col gap-4">
                    <Link href={`/reads/1`} className="flex flex-col gap-4">
                      <div className="rounded-[5px] overflow-hidden relative">
                        <div className="px-[10px] py-[10px] backdrop-blur-[5px]  rounded-full absolute top-[10px] right-[10px] items-center gap-[5px]">
                          <Image
                            src={BookMark}
                            alt="Board Fill"
                            width={20}
                            height={20}
                          />
                        </div>
                        <Image
                          className="h-[250px] object-cover object-top"
                          src={pic}
                          alt={"Draft"}
                        />
                        <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
                          <div className="flex items-center gap-4">
                            <div className="bg-white h-[25px] w-[25px] border border-secondary-base flex flex-col items-center justify-center rounded-full">
                              <User size={20} color="#9FE870" />
                            </div>
                            <span className="text-[1.4rem] text-white">
                              Edshy JB
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
                              {formattedDate.toUpperCase()}
                            </div>
                            <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                              <Clock4 size={12} color="#334155" />3 mins
                            </div>
                            <div className="hidden px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white lg:flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                              <Plane size={12} color="#334155" />
                              {TruncateUrl("Culture", 16)}
                            </div>
                            <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex lg:hidden items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
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
        </div>
      </div>
    </AppLayout>
  );
}
