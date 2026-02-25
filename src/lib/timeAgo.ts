export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const seconds = Math.floor((now - new Date(date).getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 48) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `${days}j`;
}
