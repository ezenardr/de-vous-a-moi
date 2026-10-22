// YouTube helpers for watches. Every video on the site is a youtu.be / youtube.com link.

const ID_PATTERNS = [
  /youtu\.be\/([\w-]{6,})/,
  /youtube\.com\/watch\?(?:.*&)?v=([\w-]{6,})/,
  /youtube\.com\/(?:embed|shorts|live)\/([\w-]{6,})/,
];

export function youtubeId(url: string): string | null {
  for (const pattern of ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Privacy-enhanced embed: no YouTube cookies until the visitor presses play.
export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
}

// Best effort, no API key: reads `lengthSeconds` from the public watch page. Returns null on any
// failure so a missing duration only hides the badge.
export async function fetchYoutubeDuration(url: string): Promise<number | null> {
  const id = youtubeId(url);
  if (!id) return null;
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: { "user-agent": "Mozilla/5.0", "accept-language": "en" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const match = (await res.text()).match(/"lengthSeconds":"(\d+)"/);
    const seconds = match ? Number(match[1]) : NaN;
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
  } catch {
    return null;
  }
}

// 8:11, 1:02:05
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
