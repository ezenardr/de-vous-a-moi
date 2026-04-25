import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import { formaDate } from "@/lib/formatDate";
import { userPolicy } from "@/lib/role/userPolicy";
import { Watch } from "@/types/types";
import { CalendarDays, Mic, Plus, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import BoardFill from "@/assets/icons/BoardFill.svg";
import { LinkButtonPrimary } from "@/components/shared/Links";

export default async function AuthorWatches() {
  const session = await auth();
  const authorized = await userPolicy.createReads(session?.user.userId ?? "");
  if (!authorized) {
    redirect("/");
  }
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/author/watches`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    },
  );
  const response = await request.json();
  const watches: Watch[] = response.watches;
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0 lg:items-center justify-between lg:pt-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Mes Vidéos
        </span>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="hidden lg:block">
            <LinkButtonPrimary href="/author/watches/create">
              Nouvelle vidéo
            </LinkButtonPrimary>
          </div>
        </div>
      </div>
      <ul className="list-3 pt-4">
        {[...watches]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map((watch) => {
            const formattedDate = formaDate(watch.createdAt);
            return (
              <li key={watch.watchId}>
                <Link
                  href={`/author/watches/${watch.watchId}`}
                  className="flex flex-col gap-4"
                >
                  <div className="rounded-[5px] overflow-hidden relative">
                    <Image
                      className="h-[250px] object-cover object-top"
                      src={watch.imageUrl}
                      alt={watch.title}
                      width={360}
                      height={250}
                    />
                    <div className=" backdrop-blur-xs absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
                      <div className="flex items-center gap-4">
                        {session?.user.profileImageUrl ? (
                          <Image
                            src={session.user.profileImageUrl}
                            alt={session.user.firstName}
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
                        {/* <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                          <Clock4 size={12} color="#334155" />
                          test
                        </div> */}
                        <div className="px-4 py-[5px] rounded-[3rem] w-fit uppercase bg-[#84C15D] flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-white font-secondary">
                          <Mic size={12} color="#fff" />
                          <span className="hidden lg:inline">Le Spotlight</span>
                          <span className=" lg:hidden">Le Spotlight</span>
                        </div>
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
        <div></div>
      </ul>
      {watches.length === 0 && (
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
              <Image src={BoardFill} alt="Board Fill" width={50} height={50} />
            </div>
          </div>
          <div className={"flex flex-col gap-12 items-center text-center"}>
            <p
              className={
                "text-[1.8rem] leading-[25px] text-neutral-500 max-w-[330px] w-full lg:max-w-[560px]"
              }
            >
              Nous vous informons que cette page ne comporte actuellement aucune
              vidéo publiée. En conséquence, la page demeure vide et ne présente
              aucun élément. Nous vous invitons, en tant qu’auteur, à procéder à
              la publication d’une vidéo afin de donner vie à cet espace.
            </p>
          </div>
        </div>
      )}
      <div className="lg:hidden absolute bottom-8 right-8 z-60">
        <LinkButtonPrimary href="/author/watches/create">
          <Plus />
        </LinkButtonPrimary>
      </div>
    </AppLayout>
  );
}
