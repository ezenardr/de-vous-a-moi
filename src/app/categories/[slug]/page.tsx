export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import BackButton from "@/components/shared/BackButton";
import { SimpleArtworkCard } from "@/components/shared/cards";
import { auth } from "@/lib/auth";
import { getReadsByCategory } from "@/server/queries/reads";
import { ChevronRight } from "lucide-react";

export default async function SingleCategoryArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  const session = await auth();
  const reads = await getReadsByCategory(category, session?.user?.userId);
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row lg:border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <div className="flex items-center gap-8">
          <BackButton />
          <span className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
            Catégories
            <div>
              <ChevronRight width={20} />
            </div>
            {category}
          </span>
        </div>
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
      </div>
    </AppLayout>
  );
}
