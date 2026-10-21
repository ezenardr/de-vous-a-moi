"use client";
import { useEffect } from "react";
import { recordReadView } from "@/action/engagement";

// Counts one view per read per browser session. Runs in the browser, so most bots don't count.
export function ViewTracker({ readId }: { readId: string }) {
  useEffect(() => {
    const key = `viewed:${readId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable (private mode): count anyway.
    }
    void recordReadView(readId);
  }, [readId]);
  return null;
}
