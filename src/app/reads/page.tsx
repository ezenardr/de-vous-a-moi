import AppLayout from "@/components/layouts/AppLayout";
import React from "react";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";
import { CalendarDays, ChevronRight, Clock4, Plane, User } from "lucide-react";
import pic from "@/assets/images/test-image.jpg";
import Link from "next/link";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import TruncateUrl from "@/lib/TruncateUrl";

export default function ReadAllPage() {
  const formattedDate = "3 dec 2060";
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row lg:border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
          Lectures
          <div>
            <ChevronRight width={20} />
          </div>
          All reads
        </span>
        <div className="p-4 rounded-[5px] w-[330px] bg-[#F8F8F8] hidden lg:flex items-center gap-4 overflow-hidden">
          <Image src={Search} width={20} alt="Search" />
          <input
            type="text"
            className="outline-none text-[1.4rem] leading-[145%]"
            placeholder="Rechercher..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-[20px]">
        <div className="flex justify-between font-secondary font-bold items-center">
          <span className="text-[24px] leading-[120%] tracking-[-0.72px]">
            All reads
          </span>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
          <ul className="list-3">
            {Array.from({ length: 11 }).map((_, key) => {
              return (
                <li key={key} className="flex flex-col gap-4">
                  <Link
                    href={`/reads/1`}
                    className="flex flex-col gap-4"
                  >
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
                        // width={360}
                        // height={250}
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
    </AppLayout>
  );
}
