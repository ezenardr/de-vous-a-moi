"use client";
import { ReadDraft } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import pic from "@/assets/images/test-image.jpg";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CalendarDays, Clock4, Plane, User } from "lucide-react";
import BoardFill from "@/assets/icons/BoardFill.svg";
import Link from "next/link";
import TruncateUrl from "@/lib/TruncateUrl";

export default function ReadsPageContent({ drafts }: { drafts: ReadDraft[] }) {
  const { data: session } = useSession();
  return (
    <div className="overflow-y-scroll w-full h-full">
      <Tabs defaultValue="reads" className="w-full h-full">
        <TabsList className="w-full lg:w-fit flex">
          <TabsTrigger value="reads" className="w-full">
            Articles
          </TabsTrigger>
          <TabsTrigger value="drafts" className="w-full">
            Brouillon
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reads" className="w-full">
          <div
            className={
              "w-[330px] lg:w-[560px] mx-auto pt-16 justify-center flex flex-col items-center gap-20 "
            }
          >
            <div
              className={
                "w-[120px] h-[120px] rounded-full flex items-center justify-center bg-neutral-100"
              }
            >
              <div
                className={
                  "w-[90px] h-[90px] rounded-full flex items-center justify-center bg-neutral-200"
                }
              >
                <Image
                  src={BoardFill}
                  alt="Board Fill"
                  width={50}
                  height={50}
                />
              </div>
            </div>
            <div className={"flex flex-col gap-12 items-center text-center"}>
              <p
                className={
                  "text-[1.8rem] leading-[25px] text-neutral-500 max-w-[330px] w-full lg:max-w-[560px]"
                }
              >
                Nous vous informons que cette page ne comporte actuellement
                aucun article publié. En conséquence, la page demeure vide et ne
                présente aucun élément. Nous vous invitons, en tant qu’auteur, à
                procéder à la publication d’un article afin de donner vie à cet
                espace.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="drafts" className="h-full">
          <ul className="list-3 pt-4">
            {[...drafts]
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              )
              .map((draft) => {
                const date = new Date(draft.createdAt);
                const formattedDate = new Intl.DateTimeFormat("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                }).format(date);
                return (
                  <li key={draft.readDraftId}>
                    <Link
                      href={`/author/reads/draft/${draft.readDraftId}`}
                      className="flex flex-col gap-4"
                    >
                      <div className="rounded-[5px] overflow-hidden relative">
                        <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase absolute top-4 right-4 bg-secondary-100 items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-secondary-900 font-secondary">
                          Brouillon
                        </div>
                        <Image
                          className="h-[250px] object-cover object-top"
                          src={draft.imageUrl ?? pic}
                          alt={draft.title ?? "Draft"}
                          width={360}
                          height={250}
                        />
                        <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
                          <div className="flex items-center gap-4">
                            <div className="bg-white h-[25px] w-[25px] border border-secondary-base flex flex-col items-center justify-center rounded-full">
                              <User size={20} color="#9FE870" />
                            </div>
                            <span className="text-[1.4rem] text-white">
                              {session?.user.firstName} {session?.user.lastName}
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
                              {TruncateUrl(draft.category ?? "", 7)}
                            </div>
                            <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex lg:hidden items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                              <Plane size={12} color="#334155" />
                              {TruncateUrl(draft.category ?? "", 16)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="font-secondary font-medium text-[1.6rem] text-[#333333]">
                        {draft.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            <div></div>
          </ul>
          {drafts.length === 0 && (
            <div
              className={
                "w-[330px] lg:w-[560px] mx-auto pt-16 justify-center flex flex-col items-center gap-20 "
              }
            >
              <div
                className={
                  "w-[120px] h-[120px] rounded-full flex items-center justify-center bg-neutral-100"
                }
              >
                <div
                  className={
                    "w-[90px] h-[90px] rounded-full flex items-center justify-center bg-neutral-200"
                  }
                >
                  <Image
                    src={BoardFill}
                    alt="Board Fill"
                    width={50}
                    height={50}
                  />
                </div>
              </div>
              <div className={"flex flex-col gap-12 items-center text-center"}>
                <p
                  className={
                    "text-[1.8rem] leading-[25px] text-neutral-500 max-w-[330px] w-full lg:max-w-[560px]"
                  }
                >
                  Nous vous informons que cette page ne comporte actuellement
                  aucun article publié. En conséquence, la page demeure vide et
                  ne présente aucun élément. Nous vous invitons, en tant
                  qu’auteur, à procéder à la création d’un article afin de
                  donner vie à cet espace.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
