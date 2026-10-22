// The site's categories (reads; videos are all "Le Spotlight"). Styling lives in ds/CategoryBadge.
export const CATEGORY_NAMES = ["Actualités", "Style de vie", "Le Spotlight", "Technologies"] as const;
export type CategoryName = (typeof CATEGORY_NAMES)[number];
