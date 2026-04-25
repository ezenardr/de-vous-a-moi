import AppLayout from "@/components/layouts/AppLayout";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import Time from "@/assets/icons/TimeFill.svg";
import { ChevronRight, Mic } from "lucide-react";
import pic from "@/assets/images/test-image.jpg";
import Play from "@/assets/icons/PlayFill.svg";
import { CalendarDays, Clock4, Plane, User } from "lucide-react";
import TruncateUrl from "@/lib/TruncateUrl";
import Link from "next/link";
import ChartFill from "@/assets/icons/ChartFill.svg";
import { Watch } from "@/types/types";
import { slugify } from "@/lib/Slugify";

export default async function WatchesPage() {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watches`, {
    method: "GET",
  });
  const response = await request.json();
  const watches: Watch[] = response.watches;
  const formattedDate = "3 dec 2060";
  return (
    <AppLayout>
      <div className="flex  lg:border-b border-[#F9F9F9] items-center justify-between lg:py-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Vidéos
        </span>
        <div className="p-4 rounded-[5px] max-w-132 lg:w-132 bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
          <Image src={Search} width={20} alt="Search" />
          <input
            type="text"
            className="outline-none text-[1.4rem] leading-[145%]"
            placeholder="Rechercher..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-12 lg:gap-10 overflow-y-auto overflow-x-hidden">
        <div className="hidden grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-10">
          <Link href={`/watches/1`} className="col-span-2">
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full lg:h-160 relative">
                <div className="p-4 backdrop-blur-xs  rounded-full absolute top-4 right-4 items-center gap-2">
                  <Image
                    src={BookMark}
                    alt="Board Fill"
                    width={20}
                    height={20}
                  />
                </div>
                <span className="flex gap-2 p-2 font-bold font-secondary text-[1.4rem] text-white leading-[145%] tracking-[-0.42px] backdrop-blur-xs  rounded-full absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] items-center">
                  <Image src={Play} alt="Play" width={20} height={20} />
                  Play video
                </span>
                <Image
                  className="min-h-140 lg:h-160 object-cover object-top rounded-[5px]"
                  src={pic}
                  alt={"Draft"}
                />
                <div className="backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col lg:flex-row gap-4 justify-between rounded-[1.5rem]">
                  <div className="flex items-center gap-4">
                    <div className="bg-white h-10 w-10 border border-secondary-base flex flex-col items-center justify-center rounded-full">
                      <User size={20} color="#9FE870" />
                    </div>
                    <span className="text-[1.4rem] text-white">Edshy JB</span>
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
                    <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-21.2rem] font-bold leading-6 text-[#333333] font-secondary">
                      <Image src={Time} alt="time" width={15} height={15} />
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
              <div>
                <span className="font-secondary text-[2rem] font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                  The Quiet Power of Slowing Down
                </span>
                <p className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] text-[#A3A3A3] min-w-152 lg:w-240 wrap-break-word">
                  How taking intentional breaks can help you think more clearly,
                  create with purpose, and live a life that feels truly
                  balanced.
                </p>
              </div>
            </div>
          </Link>
          <Link href={`/watches/1`}>
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full  relative">
                <div className="px-4 py-4 backdrop-blur-[5px]  rounded-full absolute top-4 right-4 items-center gap-2">
                  <Image
                    src={BookMark}
                    alt="Board Fill"
                    width={20}
                    height={20}
                  />
                </div>
                <Image
                  className="min-h-160 lg:h-160 lg:w-150 object-cover object-top rounded-[5px]"
                  src={pic}
                  alt={"Draft"}
                />
                <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 rounded-[1.5rem]">
                  <div className="flex items-center gap-4">
                    <div className="bg-white h-105rem] border border-secondary-base flex flex-col items-center justify-center rounded-full">
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
                      <Image src={Time} alt="time" width={15} height={15} />
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
              <div className="font-secondary">
                <span className="text-[2rem] font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                  Exploring East Africa
                </span>
                <p className="text-[1.4rem] leading-[145%] tracking-[-0.42px] text-[#A3A3A3]">
                  A journey through the landscapes, people, and stories that
                  reveal the quiet beauty and bold spirit of East Africa.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex flex-col gap-8">
          {/* <div className="flex justify-between font-secondary font-bold items-center">
            <span className="text-[2.4rem] leading-[120%] tracking-[-0.72px]">
              Latest releases
            </span>
            <Link
              href={`/watches/all`}
              className="flex flex-row gap-2 text-[1.6rem] leading-[145%] tracking-[-0.48px]"
            >
              <span>See all</span>
              <div>
                <ChevronRight width={20} />
              </div>
            </Link>
          </div> */}
          <ul className="list-3">
            {[...watches]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((watch, key) => {
                return (
                  <li key={key} className="flex flex-col gap-4">
                    <Link
                      href={`/watches/${slugify(watch.title, watch.watchId)}`}
                      className="flex flex-col gap-4"
                    >
                      <div className="rounded-[5px] overflow-hidden relative">
                        {/* <div className="px-4 py-4 backdrop-blur-[5px]  rounded-full absolute top-4 right-4 items-center gap-2">
                          <Image
                            src={watch.imageUrl}
                            alt={watch.title}
                            width={20}
                            height={20}
                          />
                        </div> */}
                        <Image
                          className="h-100 object-cover object-top"
                          src={watch.imageUrl}
                          alt={watch.title}
                          width={360}
                          height={250}
                        />
                        <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 rounded-[1.5rem]">
                          <div className="flex items-center gap-4">
                            {watch.user.profileImageUrl ? (
                              <Image
                                src={watch.user.profileImageUrl}
                                alt={watch.user.firstName}
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
                              {watch.user.firstName} {watch.user.lastName}
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
                            <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-white font-secondary">
                              <Mic size={12} color="#fff" />
                              Le Spotlight
                            </div>
                            {/* <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                              <Image
                                src={Time}
                                alt="time"
                                width={15}
                                height={15}
                              />
                              4:32
                            </div> */}
                            {/* <div className="flex px-4 py-2 rounded-[3rem] w-fit uppercase bg-white lg:flex items-center gap-2 text-[1.2rem] font-bold leading-6#333333] font-secondary">
                              <Image
                                src={ChartFill}
                                alt="Chart Bar"
                                width={15}
                                height={15}
                              />
                              3,309
                            </div> */}
                          </div>
                        </div>
                      </div>
                      <span className="font-secondary font-medium text-[1.6rem] text-[#333333]">
                        {watch.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="hidden  flex-col gap-8">
          <div className="flex justify-between font-secondary font-bold items-center">
            <span className="text-[2.4rem] leading-[120%] tracking-[-0.72px]">
              Videos you might like
            </span>
          </div>
          <div className="flex flex-col gap-8">
            <ul className="list-3">
              {Array.from({ length: 3 }).map((_, key) => {
                return (
                  <li key={key} className="flex flex-col gap-4">
                    <Link href={`/watches/1`} className="flex flex-col gap-4">
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
                            <div className="px-4 py-2 rounded-[3rem] w-fit bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6#333333] font-secondary">
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
            <ul className="grid grid-cols-2 gap-8">
              {Array.from({ length: 2 }).map((_, key) => {
                return (
                  <li key={key} className="flex flex-col gap-4">
                    <Link href={`/watches/1`} className="flex flex-col gap-4">
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
                            <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-21.2rem] font-bold leading-6 text-[#333333] font-secondary">
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
      </div>
    </AppLayout>
  );
}
