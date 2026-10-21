"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRightUpLineIcon,
  Book3FillIcon,
  BoardFillIcon,
  BoardLineIcon,
  BookmarksFillIcon,
  BookmarksLineIcon,
  ExitLineIcon,
  Folder3FillIcon,
  Folder3LineIcon,
  InformationLineIcon,
  More1LineIcon,
  QuillPenLineIcon,
  User4FillIcon,
  UserStarLineIcon,
  VideoFillIcon,
  VideoLineIcon,
} from "@/components/icons/mingcute";
import NoAuthDialog from "@/components/shared/NoAuthDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ProfileDialog from "./ProfileDialog";
import ProfileDrawer from "./ProfileDrawer";

type Icon = ComponentType<{ size?: number; className?: string }>;

// Figma "-base-nav items/standard": 36px row, 20px icon, active item on white with brand text.
function NavItem({
  href,
  label,
  icon: IconLine,
  activeIcon: IconFill = IconLine,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: Icon;
  activeIcon?: Icon;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = active ? IconFill : IconLine;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-[3.6rem] w-full items-center gap-4 rounded-card p-4 type-body font-medium transition-colors",
        active ? "bg-white text-primary-base" : "text-faint hover:text-primary-base",
      )}
    >
      <Icon className="shrink-0" />
      {label}
    </Link>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="px-4 type-body font-medium text-label">{label}</span>
      {children}
    </div>
  );
}

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" onClick={onNavigate} className="flex items-center gap-[0.5rem] p-4">
      <Book3FillIcon className="text-primary-base" />
      <span className="type-title font-bold whitespace-nowrap text-primary-base">De vous à moi</span>
    </Link>
  );
}

export default function NavContent({ variant, onNavigate }: { variant: "desktop" | "mobile"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  // Display only; every page and action re-checks the role on the server.
  const isAuthor = user && ["2", "3", "4"].includes(user.role);
  const isAdmin = user && ["3", "4"].includes(user.role);
  const at = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <nav aria-label="Navigation principale" className="flex h-full flex-col justify-between gap-12">
      <div className="flex flex-col gap-12">
        <NavGroup label="Mon espace">
          <NavItem href="/" label="Lectures" icon={BoardLineIcon} activeIcon={BoardFillIcon} active={pathname === "/" || at("/reads")} onNavigate={onNavigate} />
          <NavItem href="/watches" label="Vidéos" icon={VideoLineIcon} activeIcon={VideoFillIcon} active={at("/watches")} onNavigate={onNavigate} />
          <NavItem href="/categories" label="Catégories" icon={Folder3LineIcon} activeIcon={Folder3FillIcon} active={at("/categories")} onNavigate={onNavigate} />
          {user ? (
            <NavItem href="/saved" label="Favoris" icon={BookmarksLineIcon} activeIcon={BookmarksFillIcon} active={at("/saved")} onNavigate={onNavigate} />
          ) : (
            <NoAuthDialog>
              <span className="flex h-[3.6rem] w-full cursor-pointer items-center gap-4 rounded-card p-4 type-body font-medium text-faint hover:text-primary-base">
                <BookmarksLineIcon className="shrink-0" />
                Favoris
              </span>
            </NoAuthDialog>
          )}
          <NavItem href="/about" label="À propos" icon={InformationLineIcon} active={at("/about")} onNavigate={onNavigate} />
        </NavGroup>

        {isAuthor && (
          <NavGroup label="Auteur">
            <NavItem href="/author/reads" label="Mes articles" icon={QuillPenLineIcon} active={at("/author/reads")} onNavigate={onNavigate} />
            <NavItem href="/author/watches" label="Mes vidéos" icon={VideoLineIcon} activeIcon={VideoFillIcon} active={at("/author/watches")} onNavigate={onNavigate} />
          </NavGroup>
        )}
      </div>

      <NavGroup label="Autres">
        {isAdmin && (
          <NavItem href="/admin" label="Administration" icon={UserStarLineIcon} active={at("/admin")} onNavigate={onNavigate} />
        )}
        {user ? (
          <Popover>
            <PopoverTrigger className="flex h-[3.6rem] w-full cursor-pointer items-center justify-between rounded-card p-4 text-subtle hover:text-primary-base">
              <span className="flex min-w-0 items-center gap-4">
                {user.profileImageUrl ? (
                  <Image src={user.profileImageUrl} alt="" width={20} height={20} className="size-8 rounded-pill object-cover" />
                ) : (
                  <User4FillIcon className="shrink-0" />
                )}
                <span className="truncate type-body">{`${user.firstName} ${user.lastName}`}</span>
              </span>
              <More1LineIcon className="shrink-0" />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col items-start gap-7 rounded-2xl p-6 type-body text-ink">
              {variant === "desktop" ? <ProfileDialog /> : <ProfileDrawer />}
              <button
                type="button"
                onClick={() => signOut({ redirect: true, redirectTo: "/" })}
                className="flex cursor-pointer items-center gap-4 text-failure"
              >
                <ExitLineIcon size={16} />
                Se déconnecter
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <Link
            href="/auth/login"
            onClick={onNavigate}
            className="flex h-[3.6rem] w-full items-center justify-between rounded-card p-4 type-body text-subtle hover:text-primary-base"
          >
            <span className="flex items-center gap-4">
              <User4FillIcon className="shrink-0" />
              Se connecter
            </span>
            <ArrowRightUpLineIcon className="shrink-0" />
          </Link>
        )}
      </NavGroup>
    </nav>
  );
}
