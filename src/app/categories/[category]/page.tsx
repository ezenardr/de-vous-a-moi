import AppLayout from "@/components/layouts/AppLayout";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";
import { Read } from "@/types/types";
import { SimpleArtworkCard } from "@/components/shared/cards";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CurrenCategory({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const category = (await params).category;
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${category}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const response = await request.json();
  const reads: Read[] = response.reads;
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row lg:border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
          <Link href={"/categories"}>Catégories</Link>
          <div>
            <ChevronRight width={20} />
          </div>
          {decodeURIComponent(category)}
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
      <div className="overflow-y-auto ">
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
        </ul>
      </div>
    </AppLayout>
  );
}
