import { Actions, can, currentUser } from "@/server/auth/permissions";
import { getAdminSubscribers } from "@/server/queries/admin";

export const dynamic = "force-dynamic";

const cell = (value: string) => (/[",\n;]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value);

// Admin › Newsletter › "Exporter (CSV)": the whole list, active and unsubscribed. UTF-8 with a BOM
// so Excel shows accents correctly.
export async function GET() {
  const user = await currentUser();
  if (!can(user, Actions.admin)) return new Response("Forbidden", { status: 403 });
  const subscribers = await getAdminSubscribers();
  const lines = [
    ["email", "statut", "inscrit_le", "modifie_le", "compte"],
    ...subscribers.map((s) => [s.email, s.status === "active" ? "actif" : "désinscrit", s.createdAt, s.updatedAt, s.account ?? ""]),
  ].map((row) => row.map(cell).join(","));
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`\uFEFF${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abonnes-newsletter-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
