"use client";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logos/logo.png";
import MailOpenFill from "@/assets/icons/MailOpenFill.svg";
import User4Fill from "@/assets/icons/User4Fill.svg";
import BoardLine from "@/assets/icons/BoardLine.svg";
import BoardFill from "@/assets/icons/BoardFill.svg";
import VideoLine from "@/assets/icons/VideoLine.svg";
import VideoFill from "@/assets/icons/VideoFill.svg";
import Folder3Line from "@/assets/icons/Folder3Line.svg";
import Folder3Fill from "@/assets/icons/Folder3Fill.svg";
import BookmarkLine from "@/assets/icons/BookmarkLine.svg";
import BookmarkFill from "@/assets/icons/BookmarkFill.svg";
import More1Line from "@/assets/icons/More1Line.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  function isPathnameActive(path: string) {
    return pathname.startsWith(path);
  }
  const { data: session } = useSession();
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-12">
        <div className="lg:flex items-center gap-[5px] hidden">
          <Image
            src={Logo}
            width={35}
            height={35}
            alt="Logo"
            className="w-auto h-auto"
          />
          <span className="font-secondary font-bold text-primary-base text-[2rem] leading-[120%]">
            De vous à moi
          </span>
        </div>
        <div className="flex flex-col gap-4 text-[1.4rem] leading-[145%] font-secondary">
          <span className="font-medium text-[#484848]">Mon espace</span>
          <Link
            href={"/"}
            className={`flex items-center gap-4 p-4 rounded-[5px] hover:text-primary-base transition-all duration-300 ease-in-out font-medium ${
              pathname === "/" ? "text-primary-base bg-white" : "text-[#767676]"
            }`}
          >
            {pathname === "/" ? (
              <Image src={BoardFill} alt="Board Fill" width={20} height={20} />
            ) : (
              <Image src={BoardLine} alt="Board Line" width={20} height={20} />
            )}
            Lectures
          </Link>
          <Link
            href={"/watches"}
            className={`flex items-center gap-4 p-4 rounded-[5px] hover:text-primary-base transition-all duration-300 ease-in-out font-medium ${
              isPathnameActive("/watches")
                ? "text-primary-base bg-white"
                : "text-[#767676]"
            }`}
          >
            {isPathnameActive("/watches") ? (
              <Image src={VideoFill} alt="VideoFill" width={20} height={20} />
            ) : (
              <Image src={VideoLine} alt="VideoLine" width={20} height={20} />
            )}
            Vidéos
          </Link>
          <Link
            href={"/categories"}
            className={`flex items-center gap-4 p-4 rounded-[5px] hover:text-primary-base transition-all duration-300 ease-in-out font-medium ${
              isPathnameActive("/categories")
                ? "text-primary-base bg-white"
                : "text-[#767676]"
            }`}
          >
            {isPathnameActive("/categories") ? (
              <Image
                src={Folder3Fill}
                alt="Folder3Fill"
                width={20}
                height={20}
              />
            ) : (
              <Image
                src={Folder3Line}
                alt="Folder3Line"
                width={20}
                height={20}
              />
            )}
            Catégories
          </Link>
          <Link
            href={"/saved"}
            className={`flex items-center gap-4 p-4 rounded-[5px] hover:text-primary-base transition-all duration-300 ease-in-out font-medium ${
              isPathnameActive("/saved")
                ? "text-primary-base bg-white"
                : "text-[#767676]"
            }`}
          >
            {isPathnameActive("/saved") ? (
              <Image
                src={BookmarkFill}
                alt="BookmarkFill"
                width={20}
                height={20}
              />
            ) : (
              <Image
                src={BookmarkLine}
                alt="BookmarkLine"
                width={20}
                height={20}
              />
            )}
            Favoris
          </Link>
        </div>
        {(session?.user.role === "2" ||
          session?.user.role === "3" ||
          session?.user.role === "4") && (
          <div className="flex flex-col gap-4 text-[1.4rem] leading-[145%] font-secondary">
            <span className="font-medium text-[#484848]">Autheur</span>
            <Link
              href={"/author/reads"}
              className={`flex items-center gap-4 p-4 rounded-[5px] hover:text-primary-base transition-all duration-300 ease-in-out font-medium ${
                isPathnameActive("/author/reads")
                  ? "text-primary-base bg-white"
                  : "text-[#767676]"
              }`}
            >
              {isPathnameActive("/author/reads") ? (
                <Image
                  src={BoardFill}
                  alt="Board Fill"
                  width={20}
                  height={20}
                />
              ) : (
                <Image
                  src={BoardLine}
                  alt="Board Line"
                  width={20}
                  height={20}
                />
              )}
              Mes Articles
            </Link>
            <Link
              href={"/author/watches"}
              className={`flex items-center gap-4 p-4 rounded-[5px] hover:text-primary-base transition-all duration-300 ease-in-out font-medium ${
                isPathnameActive("/author/watches")
                  ? "text-primary-base bg-white"
                  : "text-[#767676]"
              }`}
            >
              {isPathnameActive("/author/watches") ? (
                <Image src={VideoFill} alt="VideoFill" width={20} height={20} />
              ) : (
                <Image src={VideoLine} alt="VideoLine" width={20} height={20} />
              )}
              Mes Vidéos
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 text-[1.4rem] leading-[145%] font-secondary">
        <span className="font-medium text-[#484848]">Autres</span>

        <Dialog>
          <DialogTrigger className="cursor-pointer">
            <span className="flex items-center gap-4 p-4 text-[#767676] hover:text-primary-base transition-all duration-300 ease-in-out">
              <Image
                src={MailOpenFill}
                alt="Mail open fill"
                width={16}
                height={18}
              />
              Newsletter
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="sr-only">Newletter</DialogTitle>
            test
          </DialogContent>
        </Dialog>
        {session?.user ? (
          <Popover>
            <PopoverTrigger>
              <div className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <Image
                    src={User4Fill}
                    alt="User 4 Fill"
                    width={16}
                    height={18}
                  />
                  <span className="text-[1.4rem] leading-[145%] text-[#333333]">
                    {session.user.firstName} {session.user.lastName}
                  </span>
                </div>
                <Image
                  src={More1Line}
                  alt="More 1 LIne"
                  width={20}
                  height={20}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className=" p-6 rounded-2xl flex flex-col items-start gap-7 text-[1.4rem] leading-[145%] text-[#333333]">
              <Link href={"/profile"} className="flex items-center gap-4">
                <Image
                  src={User4Fill}
                  alt="User 4 Fill"
                  width={16}
                  height={18}
                />
                Profile
              </Link>
              <button
                onClick={() => signOut({ redirect: true, redirectTo: "/" })}
                className="text-failure flex items-center gap-4 cursor-pointer"
              >
                <LogOut color="#cc0000" size={16} />
                Se déconnecter
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <Link
            href={"/auth/login"}
            className="flex items-center gap-4 p-4 text-[#767676] hover:text-primary-base transition-all duration-300 ease-in-out"
          >
            <Image src={User4Fill} alt="User 4 Fill" width={16} height={18} />
            Se connecter
          </Link>
        )}
      </div>
    </aside>
  );
}
