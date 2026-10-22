import z from "zod";

// Scheduled publishing (reads and videos): a time at least a minute ahead and at most a year out.
// Absent means "publish now".
export const SCHEDULE_MIN_MS = 60 * 1000;
export const SCHEDULE_MAX_MS = 365 * 24 * 60 * 60 * 1000;

export const publishAtSchema = z
  .union([z.iso.datetime({ offset: true }), z.date()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) return undefined;
    const date = new Date(value);
    const ahead = date.getTime() - Date.now();
    if (ahead < SCHEDULE_MIN_MS || ahead > SCHEDULE_MAX_MS) {
      ctx.addIssue({ code: "custom", message: "Choisissez une date entre maintenant et dans un an." });
      return z.NEVER;
    }
    return date;
  });
