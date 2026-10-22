import Image, { type StaticImageData } from "next/image";
import book from "@/assets/newsletter/book.svg";
import bookBookmark from "@/assets/newsletter/book-bookmark.svg";
import bookOpen from "@/assets/newsletter/book-open.svg";
import books from "@/assets/newsletter/books.svg";
import notebook from "@/assets/newsletter/notebook.svg";

// Figma newsletter modal band (153:16258): a 540 x 133 #d1fb95 strip of scattered book icons
// (24px, rotated, some mirrored) fading into white over its lower 97px. Positions are Figma's;
// icons that fall below the strip are clipped there, so they're left out.
type Placement = [icon: StaticImageData, left: number, top: number, box: number, rotate: number, mirrored?: boolean];

const UPRIGHT: Placement[] = [
  [books, -18, 20, 24, 0],
  [bookBookmark, 16, 61, 29.686, 16],
  [book, 66, 79, 33.199, -57],
  [notebook, -25, 92, 33.199, -57],
  [bookOpen, 56, 19, 32.092, -26],
];
const MIRRORED: Placement[] = [
  [books, 138.23, 100.38, 27.107, -8, true],
  [bookBookmark, 166.33, 49.55, 31.687, -24, true],
  [book, 213.74, 21.69, 33.858, 49, true],
  [notebook, 121.82, 21.48, 33.858, 49, true],
  [bookOpen, 213.53, 84.93, 30.242, 18, true],
];
// The pattern repeats once, 290px to the right and 9px up.
const shift = (list: Placement[]): Placement[] => list.map(([i, l, t, b, r, m]) => [i, l + 290, t - 9, b, r, m]);
const ICONS = [...UPRIGHT, ...shift(UPRIGHT), ...MIRRORED, ...shift(MIRRORED)];

export function NewsletterBand() {
  return (
    <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 h-[13.3rem] w-[54rem] -translate-x-1/2 overflow-hidden rounded-card bg-[#d1fb95]">
      {ICONS.map(([icon, left, top, box, rotate, mirrored], i) => (
        <span key={i} className="absolute flex items-center justify-center" style={{ left, top, width: box, height: box }}>
          <Image src={icon} alt="" width={24} height={24} unoptimized style={{ rotate: `${rotate}deg`, scale: mirrored ? "1 -1" : undefined }} />
        </span>
      ))}
      <span className="absolute top-[3.7rem] left-0 h-[9.7rem] w-full bg-linear-to-t from-white via-white/74 via-[44.5%] to-white/0" />
    </div>
  );
}
