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

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordSchema = z
  .object({ token: z.string().min(1), password: passwordSchema, password_confirmation: z.string() })
  .refine((d) => d.password === d.password_confirmation, { message: "Les mots de passe ne correspondent pas" });

export const changePasswordSchema = z.object({ password: z.string().min(1).max(128), newPassword: passwordSchema });
