import AppLayout from "@/components/layouts/AppLayout";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import { ChevronRight } from "lucide-react";
import pic from "@/assets/images/test-image.jpg";
import { CalendarDays, Clock4, Plane, User } from "lucide-react";
import { auth } from "@/lib/auth";
import TruncateUrl from "@/lib/TruncateUrl";
import Link from "next/link";

export default async function ReadPage() {
  const session = await auth();
  const formattedDate = "3 dec 2060";
  return (
    <AppLayout>
      <div className="flex  lg:border-b border-[#F9F9F9] items-center justify-between lg:py-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Lectures
        </span>
        <div className="p-4 rounded-[5px] max-w-[330px] lg:w-[330px] bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
          <Image src={Search} width={20} alt="Search" />
          <input
            type="text"
            className="outline-none text-[1.4rem] leading-[145%]"
            placeholder="Rechercher..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-12 lg:gap-10 overflow-y-auto">
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-10">
          <Link href={`/reads/1`} className="col-span-2">
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full lg:h-[400px] relative">
                <div className="px-[10px] py-[10px] backdrop-blur-xs  rounded-full absolute top-[10px] right-[10px] items-center gap-[5px]">
                  <Image
                    src={BookMark}
                    alt="Board Fill"
                    width={20}
                    height={20}
                  />
                </div>
                <Image
                  className="min-h-[350px] lg:h-[400px] object-cover object-top rounded-[5px]"
                  src={pic}
                  alt={"Draft"}
                  // width="750"
                />
                <div className="backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col lg:flex-row gap-4 justify-between rounded-[1.5rem]">
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
              <div>
                <span className="font-secondary text-[20px] font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                  The Quiet Power of Slowing Down
                </span>
                <p className="font-secondary text-[14px] leading-[145%] tracking-[-0.42px] text-[#A3A3A3] min-w-[380px] lg:w-[600px] break-words">
                  How taking intentional breaks can help you think more clearly,
                  create with purpose, and live a life that feels truly
                  balanced.
                </p>
              </div>
            </div>
          </Link>
          <Link href={`/reads/1`}>
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full  relative">
                <div className="px-[10px] py-4 backdrop-blur-[5px]  rounded-full absolute top-[10px] right-[10px] items-center gap-[5px]">
                  <Image
                    src={BookMark}
                    alt="Board Fill"
                    width={20}
                    height={20}
                  />
                </div>
                <Image
                  className="min-h-[350px] lg:h-[400px] lg:w-[375px] object-cover object-top rounded-[5px]"
                  src={pic}
                  alt={"Draft"}
                  // width={375}
                  // height={400}
                />
                <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
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
              <div className="font-secondary">
                <span className="text-[20px] font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                  Exploring East Africa
                </span>
                <p className="text-[14px] leading-[145%] tracking-[-0.42px] text-[#A3A3A3]">
                  A journey through the landscapes, people, and stories that
                  reveal the quiet beauty and bold spirit of East Africa.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex flex-col gap-[20px]">
          <div className="flex justify-between font-secondary font-bold items-center">
            <span className="text-[24px] leading-[120%] tracking-[-0.72px]">
              Latest reads
            </span>
            <Link
              href={`/reads`}
              className="flex flex-row gap-[5px] text-[16px] leading-[145%] tracking-[-0.48px]"
            >
              <span>See all</span>
              <div>
                <ChevronRight width={20} />
              </div>
            </Link>
          </div>
          <ul className="list-3">
            {Array.from({ length: 6 }).map((_, key) => {
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
    </AppLayout>
  );
}
