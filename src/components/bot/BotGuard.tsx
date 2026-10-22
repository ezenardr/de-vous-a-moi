"use client";
import { useState } from "react";
import { Turnstile, turnstileSiteKey } from "./Turnstile";

// Client half of the bot checks (server/botCheck) for signed-out forms:
//   const guard = useBotGuard();
//   …send({ ...values, ...guard.fields }); guard.used();
//   <BotGuard {...guard.props} />        (where the Turnstile checkbox may appear)
//   <SubmitButton disabled={!guard.ready} …>
// enabled: false for signed-in readers (no Turnstile; the traps still ride along).
export function useBotGuard({ enabled = true }: { enabled?: boolean } = {}) {
  const [openedAt] = useState(() => Date.now());
  const [token, setToken] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [attempt, setAttempt] = useState(0);

  return {
    // Turnstile has answered (it usually does on its own within a second).
    ready: !enabled || (Boolean(turnstileSiteKey) && Boolean(token)),
    fields: { turnstileToken: token ?? undefined, website: website || undefined, openedAt },
    // Turnstile tokens are single-use: after each request, drop it and get a new one.
    used: () => {
      setToken(null);
      setAttempt((n) => n + 1);
    },
    props: { enabled, onToken: setToken, attempt, website, onWebsite: setWebsite },
  };
}

export function BotGuard({
  enabled,
  onToken,
  attempt,
  website,
  onWebsite,
}: {
  enabled: boolean;
  onToken: (token: string | null) => void;
  attempt: number;
  website: string;
  onWebsite: (value: string) => void;
}) {
  return (
    <>
      {/* Honeypot: off-screen and hidden from assistive tech; only bots fill it in. */}
      <div aria-hidden className="absolute -left-[999rem] h-0 w-0 overflow-hidden">
        <label>
          Site web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => onWebsite(e.target.value)} />
        </label>
      </div>
      {enabled && <Turnstile onToken={onToken} resetKey={attempt} />}
    </>
  );
}
