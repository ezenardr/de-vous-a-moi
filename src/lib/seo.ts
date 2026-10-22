import type { Metadata } from "next";

// Site-wide SEO facts and schema.org (JSON-LD) builders. Page metadata uses Next's Metadata API;
// structured data is rendered with <JsonLd> (components/seo/JsonLd).

export const SITE = {
  name: "De vous à moi",
  locale: "fr_FR",
  description:
    "Le blog De vous à moi : des histoires, réflexions et vidéos qui informent, expliquent et enrichissent. Actualités, style de vie, portraits et technologies.",
  editor: "Messara Ezenard",
};

export const siteUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
export const absoluteUrl = (path: string) => `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;

// Next replaces a parent's openGraph object instead of merging it, so every page that sets its own
// openGraph starts from this base.
export const baseOpenGraph = { siteName: SITE.name, locale: SITE.locale } satisfies Metadata["openGraph"];

// The editor, as a schema.org Person: the founder on the Organization, the subject of the About page.
// Only facts that are on the site; add official social profiles to sameAs when there are some.
const EDITOR_ID = () => `${siteUrl()}/about#messara-ezenard`;
const editor = () => ({
  "@type": "Person",
  "@id": EDITOR_ID(),
  name: SITE.editor,
  jobTitle: "Rédactrice en chef",
  url: absoluteUrl("/about"),
  sameAs: ["https://www.facebook.com/messara.ezenard.2025"],
});

const organization = () => ({
  "@type": "Organization",
  "@id": `${siteUrl()}/#organization`,
  name: SITE.name,
  url: siteUrl(),
  logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png"), width: 512, height: 512 },
  description: SITE.description,
  founder: editor(),
});

// About page: Messara's letter and portrait make it her profile page.
export function profilePageJsonLd(portraitPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/about"),
    inLanguage: "fr",
    mainEntity: { ...editor(), image: absoluteUrl(portraitPath), worksFor: { "@id": `${siteUrl()}/#organization` } },
  };
}

// Home page: the site (with its search, so Google can show a search box) and its publisher.
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl()}/#website`,
        name: SITE.name,
        url: siteUrl(),
        description: SITE.description,
        inLanguage: "fr",
        publisher: { "@id": `${siteUrl()}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl()}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      organization(),
    ],
  };
}

type Author = { firstName: string; lastName: string };
const person = (author: Author) => ({ "@type": "Person", name: `${author.firstName} ${author.lastName}`.trim() });

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // The last crumb is the current page: Google takes its URL from the page, so it has no "item".
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name.trim(),
      ...(i < items.length - 1 ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function articleJsonLd(read: {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string; // public date: published_at, or created_at for older reads
  updatedAt: string | null;
  user: Author;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: read.title.trim().slice(0, 110),
    description: read.description.trim(),
    image: [read.imageUrl],
    datePublished: read.createdAt,
    dateModified: read.updatedAt && read.updatedAt > read.createdAt ? read.updatedAt : read.createdAt,
    author: person(read.user),
    publisher: organization(),
    articleSection: read.category,
    inLanguage: "fr",
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(read.path) },
  };
}

// ISO 8601 duration ("PT4M13S") from seconds.
const isoDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s || (!h && !m) ? `${s}S` : ""}`;
};

export function videoJsonLd(watch: {
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  durationSeconds: number | null;
  youtubeId: string | null;
  viewCount: number;
  user: Author;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: watch.title.trim(),
    description: (watch.description || watch.title).trim(),
    thumbnailUrl: [watch.imageUrl],
    uploadDate: watch.createdAt,
    ...(watch.durationSeconds ? { duration: isoDuration(watch.durationSeconds) } : {}),
    ...(watch.youtubeId ? { embedUrl: `https://www.youtube.com/embed/${watch.youtubeId}` } : {}),
    url: absoluteUrl(watch.path),
    interactionStatistic: { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: watch.viewCount },
    author: person(watch.user),
    publisher: organization(),
    inLanguage: "fr",
  };
}
