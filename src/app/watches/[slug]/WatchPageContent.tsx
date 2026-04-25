"use client";
import { ButtonPrimary } from "@/components/shared/Buttons";
import Image from "next/image";
import CommentFill from "@/assets/icons/CommentFill.svg";
import Send from "@/assets/icons/SendFill.svg";
import UserAdd from "@/assets/icons/UserAdd.svg";
import UserFill from "@/assets/icons/UserFill.svg";
import Link from "next/link";
import LikeFill from "@/assets/icons/LikeFill.svg";
import CommentFillLighter from "@/assets/icons/CommentFill2.svg";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { User, Watch } from "@/types/types";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import YoutubeVideoPlayer from "@/app/author/watches/[watchId]/YoutubeVideoPlayer";
import { useSession } from "next-auth/react";
import LoadingDots from "@/components/loaders/LoadingDots";
import NoAuthDialog from "@/components/shared/NoAuthDialog";
import { timeAgo } from "@/lib/timeAgo";
import { AddWatchComment } from "@/action/watch";
import { toast } from "sonner";
import ShareButton from "@/components/shared/ShareButton";
import { slugify } from "@/lib/Slugify";

const CommentSchema = z.object({
  comment: z.string().min(3, { error: "Insérez au moins 3 caractères" }),
});
type TCommentSchema = z.infer<typeof CommentSchema>;

export default function WatchPageContent({ watch }: { watch: Watch }) {
  const {
    register,
    handleSubmit,
    resetField,
    formState: { isSubmitting },
  } = useForm<TCommentSchema>({ resolver: zodResolver(CommentSchema) });
  const author = {
    fullName: `${watch.user.firstName} ${watch.user.lastName}`,
    profileImageUrl: watch.user.profileImageUrl,
  };
  const { data: session } = useSession();
  const [wordCount, setWordCount] = useState(0);
  async function submitHandler(data: TCommentSchema) {
    const result = await AddWatchComment({
      body: { watchId: watch.watchId, comment: data.comment },
      watch: watch,
      user: session?.user as User,
    });
    if (result.success === true) {
      toast.success("Votre commentaire a été publié.");
      resetField("comment");
    } else {
      toast.error(result.error);
    }
  }
  return (
    <>
      <div className="flex  border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <Link
          href={"/watches"}
          className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] tracking-[-0.6px] text-[#333333]"
        >
          Videos
          <div>
            <ChevronRight width={20} />
          </div>
          {watch.title}
        </Link>
        <Link
          href={"/watches"}
          className="p-4 rounded-xl bg-[#F8F8F8] flex lg:hidden items-center"
        >
          <ChevronLeft width={20} />
        </Link>
        <div className="flex gap-4 items-center">
          {/* <div className="p-4 rounded-xl bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
            <Image
              src={BookMarkBlack}
              alt="Board Fill"
              width={20}
              height={20}
            />
            <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium text-[#333]">
              Save video
            </span>
          </div> */}
          <ShareButton
            entity="watch"
            url={`${process.env.NEXT_PUBLIC_APP_URL}/watches/${slugify(watch.title, watch.watchId)}`}
          />
        </div>
      </div>
      <div className="flex flex-col gap-10 lg:gap-14 overflow-y-auto ">
        <section className="snap-start w-full flex flex-col gap-6">
          <YoutubeVideoPlayer
            author={author}
            imageUrl={watch.imageUrl}
            title={watch.title}
            updatedAt={watch.createdAt}
            videoUrl={watch.videoUrl}
          />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-0 justify-between">
              <h1 className="font-secondary text-[1.8rem] lg:text-8 font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
                {watch.title}
              </h1>
            </div>
          </div>
        </section>
        <section className="snap-start grid grid-cols-1 lg:grid-cols-3 gap-12 border-[#E8E8E8] border-t pt-14">
          <div className="order-2 lg:order-1 w-full flex flex-col gap-6">
            {/* <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[1.4rem] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Views</span>
              <div className="flex gap-4 items-center">
                <Image
                  src={ChartBarFill}
                  alt="Chart Bar"
                  width={20}
                  height={20}
                />
                <span>1</span>
              </div>
            </div> */}
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[1.4rem] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Likes</span>
              <div className="flex gap-4 items-center">
                <Image src={LikeFill} alt="like" width={20} height={20} />
                <span>{watch.watchFavorites.length}</span>
              </div>
            </div>
            <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Comments</span>
              <div className="flex gap-4 items-center">
                <Image src={CommentFill} alt="Comment" width={20} height={20} />
                <span>{watch.watchComments.length}</span>
              </div>
            </div>
            {/* <div className="w-full flex justify-between pb-6 border-[#E8E8E8] border-b font-secondary text-[14px] font-medium leading-[145%] tracking-[-0.42px]">
              <span className="text-[#A3A3A3]">Shares</span>
              <div className="flex gap-4 items-center">
                <Image
                  src={ShareArticleFill}
                  alt="Share Article"
                  width={20}
                  height={20}
                />
                <span>0</span>
              </div>
            </div> */}
          </div>
          <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {session?.user ? (
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="flex flex-col gap-6"
                >
                  <textarea
                    className={`peer transition-all resize-none duration-300 delay-200 bg-[#F8F8F8] w-[calc(100%-3px)] h-[200px] rounded-[5px] px-3.5 p-[18px] text-[1.4rem] leading-8 placeholder:text-gray-400 text-[#333333] outline-none border border-transparent focus:border focus:border-[#9FE870] focus:outline-none focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:border-none disabled:cursor-not-allowed`}
                    {...register("comment")}
                    onChange={(e) => setWordCount(e.target.value.length)}
                    placeholder="Partagez librement vos impressions, vos suggestions ou vos observations dans cet espace ; votre voix compte et contribue à rendre la conversation plus riche et inclusive…"
                  />{" "}
                  {wordCount > 0 && (
                    <span
                      className={`text-right ${wordCount < 3 ? "text-failure" : "text-success"}`}
                    >
                      {wordCount}/500
                    </span>
                  )}
                  <ButtonPrimary
                    className="px-6 py-4 flex gap-[0.8rem] self-end"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoadingDots />
                    ) : (
                      <span className="flex gap-[0.8rem]">
                        {" "}
                        <Image src={Send} alt="Send comment" />
                        {"Commenter"}
                      </span>
                    )}
                  </ButtonPrimary>
                </form>
              ) : (
                <div className="self-center">
                  <NoAuthDialog>
                    <div className="mt-18 w-fit flex flex-col items-center self-center gap-6">
                      <Image
                        src={CommentFillLighter}
                        alt="Comment"
                        width={45}
                        height={45}
                      />
                      <span className="w-full flex gap-[0.8rem] border-2 border-transparent text-center  h-auto transition-all duration-400 items-center justify-center cursor-pointer rounded-[5px] bg-[#9FE870] font-secondary text-[16px] font-bold tracking-[-0.48px] text-primary-base leading-[145%] px-[25px] py-[1.2rem] disabled:bg-[#E8E8E8] disabled:text-white  disabled:cursor-not-allowed">
                        <Image src={UserAdd} alt="User add" />
                        Connectez-vous pour laisser un commentaire.
                      </span>
                    </div>
                  </NoAuthDialog>
                </div>
              )}
              <div className=" flex flex-col w-full">
                <span className="font-secondary text-[2rem] leading-[120%] tracking-[-0.6] text-[#333] font-bold">
                  Commentaires
                </span>
                {watch.watchComments.length === 0 && (
                  <div className="mt-18 w-fit flex flex-col items-center self-center gap-6">
                    <Image
                      src={CommentFillLighter}
                      alt="Comment"
                      width={45}
                      height={45}
                    />
                    <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] text-[#A3A3A3] font-medium">
                      Pas de commentaire pour l’instant.
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-6 mt-8">
                  {[...watch.watchComments]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .map((comment, key) => {
                      return (
                        <div key={key} className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            {comment.user.profileImageUrl ? (
                              <Image
                                src={comment.user.profileImageUrl}
                                alt={comment.user.firstName}
                                width={25}
                                height={25}
                                className="rounded-full"
                              />
                            ) : (
                              <Image
                                src={UserFill}
                                alt="user icon"
                                width={20}
                              />
                            )}
                            <span className="font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px] font-medium">
                              {comment.user.firstName} {comment.user.lastName}{" "}
                              <span className="text-[#A3A3A3]">
                                &bull; {timeAgo(comment.createdAt)}
                              </span>
                            </span>
                          </div>
                          <blockquote className="ml-6 bg-[#F9F9F9] rounded-xl p-4 items-center font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42px]">
                            {comment.comment}
                          </blockquote>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <section className="snap-start hidden mt-6 flex flex-col gap-8">
          <div className="flex justify-between font-secondary font-bold items-center">
            <span className="text-[2rem] lg:text-[2.4rem] leading-[120%] tracking-[-0.6px] lg:tracking-[-0.72px]">
              Recommended watches
            </span>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-170px)]">
            <ul className="list-3">
              {Array.from({ length: 3 }).map((_, key) => {
                return (
                  <li key={key} className="flex flex-col gap-4">
                    <Link href={`/watches/1`} className="flex flex-col gap-4">
                      <div className="rounded-xl overflow-hidden relative">
                        <div className="px-4 py-4 backdrop-blur-xs  rounded-full absolute top-4 right-4 items-center gap-[5px]">
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
                            <div className="px-4 py-2 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-2 text-[1.2rem] font-bold leading-6 text-[#333333] font-secondary">
                              <Image
                                src={Time}
                                alt="time"
                                width={15}
                                height={15}
                              />
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
                      <span className="font-secondary font-medium text-[1.6rem] text-[#333333]">
                        The Last Time I Spoke to My Grandfather
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section> */}
      </div>
    </>
  );
}
