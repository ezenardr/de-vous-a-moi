import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import { userPolicy } from "@/lib/role/userPolicy";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import YoutubeVideoPlayer from "./YoutubeVideoPlayer";

export default async function AuthorWatchPage({
  params,
}: {
  params: Promise<{ watchId: string }>;
}) {
  const { watchId } = await params;
  if (!watchId) {
    redirect("/author/watches");
  }
  const session = await auth();
  const authorized = await userPolicy.createReads(session?.user.userId ?? "");
  if (!authorized) {
    redirect("/");
  }
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/author/watches/${watchId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    },
  );
  const response = await request.json();
  if (!response.sucess === false) {
    redirect("/author/reads");
  }
  const watch = response.watch;
  const author = response.author;
  return (
    <AppLayout>
      <>
        <div className="flex border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
          <div className="flex items-center gap-8">
            {/* <button
            onClick={() => router.back()}
            className="p-4 rounded-xl bg-[#F8F8F8] flex items-center cursor-pointer"
          >
            <ChevronLeft width={20} />
          </button> */}
            <span className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
              Lectures
              <div>
                <ChevronRight width={20} />
              </div>
              {watch.title}
            </span>
          </div>
          {/* <div className="flex items-center gap-4">
          <ButtonPrimary onClick={publish} disabled={isLoading}>
            {isLoading ? <LoadingDots /> : "Publier"}
          </ButtonPrimary>
        </div> */}
        </div>

        <div
          // ref={scrollRef}
          className="flex flex-col gap-10 lg:gap-14 overflow-y-scroll"
        >
          <section className="snap-start w-full flex flex-col gap-6">
            <YoutubeVideoPlayer
              videoUrl={watch.videoUrl}
              imageUrl={watch.imageUrl}
              title={watch.title}
              updatedAt={watch.updatedAt}
              author={author}
            />

            <div className="flex justify-between">
              <h1 className="font-secondary text-[1.8rem] lg:text-8 font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                {watch.title}
              </h1>
            </div>
          </section>

          <section className=" gap-12 w-full mb-10">
            <div className="col-span-2 tinymce-content w-full flex flex-col">
              {watch.description}
            </div>
          </section>
        </div>
      </>
    </AppLayout>
  );
}
