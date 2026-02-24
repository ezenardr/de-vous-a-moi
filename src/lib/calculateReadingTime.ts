export function calculateReadingTime(htmlContent: string): number {
  // Strip HTML tags to get plain text
  const plainText = htmlContent.replace(/<[^>]*>/g, "");

  // Remove extra whitespace
  const cleanText = plainText.replace(/\s+/g, " ").trim();

  // Average adult reading speed: 200-250 wpm, we use 225
  const WORDS_PER_MINUTE = 225;

  const wordCount = cleanText.split(" ").filter(Boolean).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return minutes;
}
