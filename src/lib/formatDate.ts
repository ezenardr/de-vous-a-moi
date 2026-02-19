export function formaDate(inputDate: string) {
  const date = new Date(inputDate);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(date);
}
