import AppLayout from "@/components/layouts/AppLayout";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";
import {
  CalendarDays,
  ChevronRight,
  Clock4,
  Coffee,
  Landmark,
  Mic,
  RadioTower,
  User,
} from "lucide-react";
import Link from "next/link";
import TruncateUrl from "@/lib/TruncateUrl";
import { Read } from "@/types/types";
import { formaDate } from "@/lib/formatDate";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import Slugify from "@/lib/Slugify";

export default async function ReadAllPage() {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reads`, {
    method: "GET",
  });
  const response = await request.json();
  const reads: Read[] = response.reads;
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row lg:border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
          Lectures
          <div>
            <ChevronRight width={20} />
          </div>
          Découvrir 
        </span>
        <div className="p-4 rounded-[5px] w-132 bg-[#F8F8F8] hidden lg:flex items-center gap-4 overflow-hidden">
          <Image src={Search} width={20} alt="Search" />
          <input
            type="text"
            className="outline-none text-[1.4rem] leading-[145%]"
            placeholder="Rechercher..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between font-secondary font-bold items-center">
          <span className="text-[2.4rem] leading-[120%] tracking-[-0.72px]">
            Découvrir 
          </span>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
          <ul className="list-3 pt-4">
            {[...reads]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((read) => {
                const formattedDate = formaDate(read.createdAt);
                return (
                  <li key={read.readId}>
                    <Link
                      href={`/reads/${Slugify(read.title)}`}
                      className="flex flex-col gap-4"
                    >
                      <div className="rounded-[5px] overflow-hidden relative">
                        <div className="px-4 py-4 backdrop-blur-[5px]  rounded-full absolute top-4 right-4 items-center gap-2">
                          <Image
                            src={BookMark}
                            alt="Board Fill"
                            width={20}
                            height={20}
                          />
                        </div>
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
                          <div className="flex gap-2">
                            <div className="px-4 py-2 rounded-[3rem] w-fit bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                              <CalendarDays
                                stroke="#fff"
                                fill="#334155"
                                size={12}
                                color="#334155"
                              />
                              {formattedDate.toUpperCase()}
                            </div>
                            <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                              <Clock4 size={12} color="#334155" />
                              {calculateReadingTime(read.content)} mins
                            </div>
                            {read.category === "Style de vie" && (
                              <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-2 text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                <Coffee size={12} color="#fff" />
                                <span className="hidden lg:inline">
                                  {TruncateUrl(read.category, 7)}
                                </span>
                                <span className=" lg:hidden">
                                  {TruncateUrl(read.category, 16)}
                                </span>
                              </div>
                            )}
                            {read.category === "Actualités" && (
                              <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                <Landmark size={12} color="#fff" />
                                <span className="hidden lg:inline">
                                  {TruncateUrl(read.category, 7)}
                                </span>
                                <span className=" lg:hidden">
                                  {TruncateUrl(read.category, 16)}
                                </span>
                              </div>
                            )}
                            {read.category === "Le Spotlight" && (
                              <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                <Mic size={12} color="#fff" />
                                <span className="hidden lg:inline">
                                  {TruncateUrl(read.category, 7)}
                                </span>
                                <span className=" lg:hidden">
                                  {TruncateUrl(read.category, 16)}
                                </span>
                              </div>
                            )}
                            {read.category === "Technologies" && (
                              <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                                <RadioTower size={12} color="#fff" />
                                <span className="hidden lg:inline">
                                  {TruncateUrl(read.category, 7)}
                                </span>
                                <span className=" lg:hidden">
                                  {TruncateUrl(read.category, 16)}
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
                  </li>
                );
              })}
            <div></div>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
