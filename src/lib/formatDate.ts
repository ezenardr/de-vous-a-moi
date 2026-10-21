export function formaDate(inputDate: string) {
  const date = new Date(inputDate);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(date);
}

// Badge dates as in Figma ("Oct 10, 2025"), in French: "10 oct. 2025".
export function formatBadgeDate(inputDate: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(inputDate));
}
