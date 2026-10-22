"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { EASE_OUT } from "@/components/motion/easing";
import { cn } from "@/lib/utils";

// Sections not built yet stay visible but inert, so the shape of the admin is clear from day one.
const SECTIONS = [
  { href: "/admin", label: "Vue d'ensemble", ready: true },
  { href: "/admin/content", label: "Contenus", ready: true },
  { href: "/admin/comments", label: "Commentaires", ready: true },
  { href: "/admin/users", label: "Utilisateurs", ready: true },
  { href: "/admin/newsletter", label: "Newsletter", ready: true },
];

// The admin sections as SegmentedTabs-styled links (same track, pill and type). The white pill slides
// between sections; on phones the track scrolls sideways.
export function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const track = useRef<HTMLElement>(null);

  // Phones: bring the current section into view in the sideways-scrolling track.
  useEffect(() => {
    const nav = track.current;
    const current = nav?.querySelector<HTMLElement>("[aria-current=page]");
    if (!nav || !current) return;
    const offset = current.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    nav.scrollTo({ left: nav.scrollLeft + offset - (nav.clientWidth - current.offsetWidth) / 2, behavior: "smooth" });
  }, [pathname]);

  return (
    <nav ref={track} aria-label="Administration" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
      <ul className="inline-flex items-center gap-[0.4rem] rounded-[0.75rem] bg-field p-[0.5rem]">
        {SECTIONS.map((section) => {
          const current = active(section.href);
          const className = cn(
            "relative block whitespace-nowrap px-4 py-[0.5rem] type-body transition-colors",
            current ? "font-medium text-ink" : section.ready ? "text-faint hover:text-subtle" : "cursor-not-allowed text-placeholder",
          );
          return (
            <li key={section.href}>
              {section.ready ? (
                <Link href={section.href} aria-current={current ? "page" : undefined} className={className}>
                  {current && (
                    <motion.span
                      layoutId="admin-nav-pill"
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="absolute inset-0 rounded-card border border-[#f5f5f5] bg-white drop-shadow-[0_2px_5.3px_rgba(198,198,198,0.33)]"
                    />
                  )}
                  <span className="relative">{section.label}</span>
                </Link>
              ) : (
                <span aria-disabled title="Bientôt disponible" className={className}>
                  {section.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
