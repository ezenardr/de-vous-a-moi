import AppLayout from "@/components/layouts/AppLayout";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import { ChevronRight, Coffee, Landmark, Mic, RadioTower } from "lucide-react";
import pic from "@/assets/images/test-image.jpg";
import Time from "@/assets/icons/TimeFill.svg";
import { CalendarDays, Clock4, Plane, User as UserIcon } from "lucide-react";
import TruncateUrl from "@/lib/TruncateUrl";
import Link from "next/link";
import { Read } from "@/types/types";
import Slugify from "@/lib/Slugify";
import { formaDate } from "@/lib/formatDate";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
export default async function ReadPage() {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reads`, {
    method: "GET",
  });
  const response = await request.json();
  const reads: Read[] = response.reads;
  const formattedDate = "3 dec 2060";
  const featured1 = reads
    .filter((read) => read.featured === true)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .at(0) as Read;
  const featured2 = reads
    .filter((read) => read.featured === true)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .at(1) as Read;
  return (
    <AppLayout>
      <div className="flex  lg:border-b border-[#F9F9F9] items-center justify-between lg:py-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Lectures
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
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-10">
          <Link
            key={featured1.readId}
            href={`/reads/${Slugify(featured1.title)}`}
            className="col-span-2"
          >
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full h-[363px] lg:h-160 relative">
                <div className="p-4 backdrop-blur-xs z-50  rounded-full absolute top-4 right-4 items-center gap-2">
                  <Image
                    src={BookMark}
                    alt="Board Fill"
                    width={20}
                    height={20}
                  />
                </div>
                <Image
                  className="min-h-140 lg:h-160 object-cover object-top rounded-[5px]"
                  src={featured1.imageUrl}
                  alt={featured1.title}
                  fill
                />
                <div className="backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col lg:flex-row gap-4 justify-between rounded-[1.5rem]">
                  <div className="flex items-center gap-4">
                    {featured1.user.profileImageUrl ? (
                      <Image
                        src={featured1.user.profileImageUrl}
                        alt={featured1.user.firstName}
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
                      {featured1.user.firstName} {featured1.user.lastName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                      <CalendarDays
                        stroke="#fff"
                        fill="#334155"
                        size={15}
                        color="#334155"
                      />
                      {formaDate(featured1.createdAt).toUpperCase()}
                    </div>
                    <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                      <Image src={Time} alt="time" width={15} height={15} />
                      {calculateReadingTime(featured1.content)} mins
                    </div>
                    {featured1.category === "Style de vie" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                        <Coffee size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured1.category, 16)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured1.category, 16)}
                        </span>
                      </div>
                    )}
                    {featured1.category === "Actualités" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                        <Landmark size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured1.category, 16)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured1.category, 16)}
                        </span>
                      </div>
                    )}
                    {featured1.category === "Le Spotlight" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                        <Mic size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured1.category, 16)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured1.category, 16)}
                        </span>
                      </div>
                    )}
                    {featured1.category === "Technologies" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                        <RadioTower size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured1.category, 16)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured1.category, 4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <span className="font-secondary text-[2rem] font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                  {featured1.title}
                </span>
                <p className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] text-[#A3A3A3] min-w-152 lg:w-240 wrap-break-word">
                  {featured1.description}
                </p>
              </div>
            </div>
          </Link>

          <Link href={`/reads/${Slugify(featured2.title)}`}>
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full  relative h-[363px] lg:h-160">
                <div className="px-4 py-4 z-50 backdrop-blur-[5px]  rounded-full absolute top-4 right-4 items-center gap-2">
                  <Image
                    src={BookMark}
                    alt="Board Fill"
                    width={20}
                    height={20}
                  />
                </div>
                <Image
                  className="min-h-140 lg:h-160 lg:w-150 object-cover object-top rounded-[5px]"
                  src={featured2.imageUrl}
                  alt={featured2.title}
                  fill
                />
                <div className=" backdrop-blur-xs absolute bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 rounded-[1.5rem]">
                  <div className="flex items-center gap-4">
                    {featured2.user.profileImageUrl ? (
                      <Image
                        src={featured2.user.profileImageUrl}
                        alt={featured2.user.firstName}
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
                      {featured2.user.firstName} {featured2.user.lastName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary flex-nowrap">
                      <CalendarDays
                        stroke="#fff"
                        fill="#334155"
                        size={15}
                        color="#334155"
                      />
                      {formaDate(featured2.createdAt).toUpperCase()}
                    </div>
                    <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary flex-nowrap">
                      <Image src={Time} alt="time" width={15} height={15} />
                      {calculateReadingTime(featured2.content)} mins
                    </div>
                    {featured2.category === "Style de vie" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#CF5AD4] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary flex-nowrap">
                        <Coffee size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured2.category, 6)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured2.category, 16)}
                        </span>
                      </div>
                    )}
                    {featured2.category === "Actualités" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#967CCF] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary flex-nowrap">
                        <Landmark size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured2.category, 6)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured2.category, 16)}
                        </span>
                      </div>
                    )}
                    {featured2.category === "Le Spotlight" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary flex-nowrap">
                        <Mic size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured2.category, 6)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured2.category, 16)}
                        </span>
                      </div>
                    )}
                    {featured2.category === "Technologies" && (
                      <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-[#1E63F8] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary flex-nowrap">
                        <RadioTower size={15} color="#fff" />
                        <span className="hidden lg:inline">
                          {TruncateUrl(featured2.category, 4)}
                        </span>
                        <span className=" lg:hidden">
                          {TruncateUrl(featured2.category, 4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="font-secondary">
                <span className="text-[2rem] font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                  {featured2.title}
                </span>
                <p className="text-[1.4rem] leading-[145%] tracking-[-0.42px] text-[#A3A3A3]">
                  {featured2.description}
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex justify-between font-secondary font-bold items-center">
            <span className="text-[2.4rem] leading-[120%] tracking-[-0.72px]">
              Les plus récents
            </span>
            <Link
              href={`/reads`}
              className="flex flex-row gap-2 text-[1.6rem] leading-[145%] tracking-[-0.48px]"
            >
              <span>Voir tout</span>
              <div>
                <ChevronRight width={20} />
              </div>
            </Link>
          </div>
          <ul className="list-3">
            {/* les div qui laissent une petite espace a droite */}
            {Array.from({ length: 6 }).map((_, key) => {
              return (
                <li key={key} className="flex flex-col gap-4  w-full">
                  <Link href={`/reads/1`} className="flex flex-col gap-4">
                    <div className="rounded-[5px] overflow-hidden relative">
                      <div className="px-4 py-4 backdrop-blur-[5px]  rounded-full absolute top-4 right-4items-center gap-2">
                        <Image
                          src={BookMark}
                          alt="Board Fill"
                          width={20}
                          height={20}
                        />
                      </div>
                      <Image
                        className="w-full h-100 object-cover object-top"
                        src={pic}
                        alt={"Draft"}
                      />
                      <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 rounded-[1.5rem]">
                        <div className="flex items-center gap-4">
                          <div className="bg-white h-10 w-10 border border-secondary-base flex flex-col items-center justify-center rounded-full">
                            <UserIcon size={20} color="#9FE870" />
                          </div>
                          <span className="text-[1.4rem] text-white">
                            Edshy JB
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                            <CalendarDays
                              stroke="#fff"
                              fill="#334155"
                              size={15}
                              color="#334155"
                            />
                            {formattedDate.toUpperCase()}
                          </div>
                          <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                             <Image src={Time} alt="time" width={15} height={15} />3 mins
                          </div>
                          <div className="hidden pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-white lg:flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                            <Plane size={15} color="#334155" />
                            {TruncateUrl("Culture", 16)}
                          </div>
                          <div className="pl-2 pr-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex lg:hidden items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                            <Plane size={15} color="#334155" />
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
