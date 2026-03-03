import AppLayout from "@/components/layouts/AppLayout";
import Image from "next/image";
// import Search from "@/assets/icons/SearchLine.svg";
import { Read } from "@/types/types";
import { SimpleArtworkCard } from "@/components/shared/cards";
import { auth } from "@/lib/auth";
import BoardFill from "@/assets/icons/BoardFill.svg";
import Link from "next/link";

export default async function Saved() {
  const session = await auth();
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
  });
  const response = await request.json();
  const reads: Read[] = response.reads;
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row lg:border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
          Favoris
        </span>
        {/* <div className="p-4 rounded-[5px] w-132 bg-[#F8F8F8] hidden lg:flex items-center gap-4 overflow-hidden">
          <Image src={Search} width={20} alt="Search" />
          <input
            type="text"
            className="outline-none text-[1.4rem] leading-[145%]"
            placeholder="Rechercher..."
          />
        </div> */}
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
              return (
                <li key={read.readId}>
                  <SimpleArtworkCard read={read} />
                </li>
              );
            })}
          <div></div>
        </ul>
        {reads.length === 0 && (
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
                Vous n’avez pas encore de favoris. Commencez à en ajouter pour
                retrouver facilement vos{" "}
                <Link href={"/"} className="text-primary-base underline">
                  articles
                </Link>{" "}
                préférés.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
