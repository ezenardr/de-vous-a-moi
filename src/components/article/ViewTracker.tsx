"use client";
import { useEffect } from "react";
import { recordReadView, recordWatchView } from "@/action/engagement";

// Counts one view per read (or video) per browser session. Runs in the browser, so most bots don't count.
export function ViewTracker({ kind = "read", id }: { kind?: "read" | "watch"; id: string }) {
  useEffect(() => {
    const key = `viewed:${kind === "watch" ? "watch:" : ""}${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable (private mode): count anyway.
    }
    void (kind === "watch" ? recordWatchView(id) : recordReadView(id));
  }, [kind, id]);
  return null;
}
