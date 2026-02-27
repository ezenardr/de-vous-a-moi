"use client";
import Image from "next/image";
import BookMark from "@/assets/icons/BookmarkLineWhite.svg";
import {
  AddReadToFavorite as AddToFavorite,
  RemoveReadToFavorite,
} from "@/action/reads";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Read, User } from "@/types/types";
import { toast } from "sonner";
import { useState } from "react";
import PageLoader from "../loaders/PageLoader";
import NoAuthDialog from "./NoAuthDialog";

export function AddReadToFavorite({ read }: { read: Read }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  async function addToFavorite(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();
    const result = await AddToFavorite({
      pathname,
      read,
      user: session?.user as User,
    });
    if (result.success === false) {
      toast.error(result.error);
    }
    setIsLoading(false);
  }
  return (
    <>
      <PageLoader isLoading={isLoading} />
      {session?.user ? (
        <button
          onClick={addToFavorite}
          className="px-4 py-4 backdrop-blur-[5px] z-50 rounded-full absolute top-4 right-4 items-center cursor-pointer gap-2"
        >
          <Image src={BookMark} alt="Board Fill" width={20} height={20} />
        </button>
      ) : (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-4 right-4 z-50 "
        >
          <NoAuthDialog>
            <div className="px-4 py-4 backdrop-blur-[5px] rounded-full  items-center cursor-pointer gap-2">
              <Image src={BookMark} alt="Board Fill" width={20} height={20} />
            </div>
          </NoAuthDialog>
        </div>
      )}
    </>
  );
}

export function RemoveReadFromFavorite({ read }: { read: Read }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  async function removeFromFavorite(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();
    const result = await RemoveReadToFavorite({
      pathname,
      read,
      user: session?.user as User,
    });
    if (result.success === false) {
      toast.error(result.error);
    }
    setIsLoading(false);
  }
  return (
    <>
      <PageLoader isLoading={isLoading} />
      <button
        onClick={removeFromFavorite}
        className="px-4 py-4 backdrop-blur-[5px] bg-primary-700 z-50 rounded-full absolute top-4 right-4 items-center cursor-pointer gap-2"
      >
        <Image src={BookMark} alt="Board Fill" width={20} height={20} />
      </button>
    </>
  );
}
