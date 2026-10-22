import z from "zod";

// Same rules the Adonis API enforced (validators/auth.ts), shared by forms and server actions.
export const passwordSchema = z
  .string()
  .min(8, "Au moins 8 caractères")
  .max(128)
  .regex(/[A-Z]/, "Lettre majuscule")
  .regex(/[a-z]/, "Lettre minuscule")
  .regex(/[0-9]/, "Chiffre")
  .regex(/[^A-Za-z0-9]/, "Caractère spécial");

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide").max(254));

// First and last names: letters from any language (accents included), spaces, hyphens, apostrophes
// (' and ’) and dots. No digits, links or symbols: names are echoed in emails ("Bonjour Ada"), so this
// keeps sign-up forms from being used to mail spam text to someone else's address. Spaces are collapsed.
// Words of letters joined by an apostrophe or hyphen; a word may end with a dot (initials, "Jr.");
// words are separated by one space or hyphen. So "spam.com" or "www.x.fr" never pass.
const WORD = String.raw`[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*\.?`;
const NAME = new RegExp(String.raw`^${WORD}(?:[ -]${WORD})*$`, "u");
export const personNameSchema = (label: "Prénom" | "Nom") =>
  z
    .string()
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(1, `${label} requis`)
        .max(60, `${label} trop long (60 caractères max)`)
        .regex(NAME, "Lettres, espaces, tirets et apostrophes uniquement"),
    );

export const nameSchema = z.object({ firstName: personNameSchema("Prénom"), lastName: personNameSchema("Nom") });

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });

export const registerSchema = nameSchema.extend({
  email: emailSchema,
  password: passwordSchema,
});

// One field, as in Figma "Create new password" (153:17768): the eye toggle lets the user check it.
export const resetPasswordSchema = z.object({ token: z.string().min(1).max(2048), password: passwordSchema });

export const changePasswordSchema = z.object({ password: z.string().min(1).max(128), newPassword: passwordSchema });
