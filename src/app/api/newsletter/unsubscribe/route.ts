import { unsubscribeByToken } from "@/server/newsletter";

// RFC 8058 one-click unsubscribe: mail apps POST here (List-Unsubscribe-Post header on our emails).
// Answers the same way for unknown tokens.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  try {
    await unsubscribeByToken(token);
  } catch (error) {
    console.error("one-click unsubscribe failed", error);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 200 });
}
