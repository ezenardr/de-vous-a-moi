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

// "24 oct. 2026 à 09:00" (studio: scheduled publishing), in the reader's time zone.
export function formatDateTime(inputDate: string | Date) {
  const date = new Date(inputDate);
  const day = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${day} à ${time}`;
}
