import AppLayout from "@/components/layouts/AppLayout";
import React from "react";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";
import ChartFill from "@/assets/icons/ChartFill.svg";
import Time from "@/assets/icons/TimeFill.svg";
import { CalendarDays, ChevronRight, User } from "lucide-react";
import pic from "@/assets/images/test-image.jpg";
import Link from "next/link";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import TruncateUrl from "@/lib/TruncateUrl";

export default function ReadAllPage() {
  const formattedDate = "3 dec 2060";
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row lg:border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <Link href={'/watches'} className="flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
          Videos
          <div>
            <ChevronRight width={20} />
          </div>
          All videos
        </Link>
        <div className="p-4 rounded-[5px] w-[330px] bg-[#F8F8F8] hidden lg:flex items-center gap-4 overflow-hidden">
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
          <span className="text-[24px] leading-[120%] tracking-[-0.72px]">
            All videos
          </span>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
          <ul className="list-3">
            {Array.from({ length: 11 }).map((_, key) => {
              return (
                <li key={key} className="flex flex-col gap-4">
                  <Link href={`/reads/1`} className="flex flex-col gap-4">
                    <div className="rounded-[5px] overflow-hidden relative">
                      <div className="px-4 py-4 backdrop-blur-sm  rounded-full absolute top-4 right-4 items-center gap-2">
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
                            4:32
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
      </div>
    </AppLayout>
  );
}
