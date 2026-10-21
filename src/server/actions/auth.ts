"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  changePasswordSchema,
  emailSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { openToken, passwordFingerprint, sealToken } from "@/server/auth/tokens";
import { findUserByEmail, findUserById } from "@/server/auth/users";
import { db } from "@/server/db";
import { authAccessTokens, users } from "@/server/db/schema";
import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/server/email";

type Result = { success: true } | { success: false | "warning"; message: string };

// Links in emails always use the configured URL, never the request's Origin header:
// trusting Origin let anyone send a real reset email whose link pointed at their own site.
function appUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL is not set");
  return url.replace(/\/+$/, "");
}

const GENERIC_ERROR = "Une erreur est survenue. Veuillez réessayer.";
const REGISTRATION_TTL = 10 * 60;
const RESET_TTL = 10 * 60;

export type RegistrationToken = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
};

export async function register(input: unknown): Promise<Result> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Veuillez vérifier les informations saisies." };
  const { password, ...data } = parsed.data;
  try {
    if (await findUserByEmail(data.email)) {
      return {
        success: false,
        message: "Cette adresse email est déjà associée à un compte existant. Veuillez vous connecter.",
      };
    }
    // The account is only created once the email is confirmed. Until then the pending
    // registration lives in the encrypted link, holding a password hash, never the password.
    const token = sealToken(
      "registration",
      { ...data, passwordHash: await hashPassword(password) } satisfies RegistrationToken,
      REGISTRATION_TTL,
    );
    const params = new URLSearchParams({ entity: "Inscription", currentStep: "2", totalStep: "2", accessToken: token });
    await sendVerificationEmail(data.email, data.firstName, `${appUrl()}/auth/register/verified?${params}`);
    return { success: true };
  } catch (error) {
    console.error("register failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}

export async function completeRegistration(token: string): Promise<Result> {
  const data = openToken<RegistrationToken>("registration", token);
  if (!data) return { success: false, message: "Ce lien de validation a expiré. Veuillez vous inscrire à nouveau." };
  try {
    const existing = await findUserByEmail(data.email);
    // Opening the link twice (e.g. a mail scanner, then the user) must not fail the second time.
    if (existing) {
      return existing.password === data.passwordHash
        ? { success: true }
        : { success: false, message: "Cette adresse email est déjà associée à un compte existant. Veuillez vous connecter." };
    }
    const now = new Date();
    const inserted = await db
      .insert(users)
      .values({
        userId: randomUUID(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.passwordHash,
        role: "1",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: users.email })
      .returning({ userId: users.userId });
    if (inserted.length === 0) return completeRegistration(token);
    await sendWelcomeEmail(data.email).catch((error) => console.error("welcome email failed", error));
    return { success: true };
  } catch (error) {
    console.error("completeRegistration failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}

export async function requestPasswordReset(input: unknown): Promise<Result> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Adresse email invalide" };
  try {
    const user = await findUserByEmail(parsed.data);
    // Same answer whether or not the account exists, so this can't be used to probe emails.
    if (!user) return { success: true };

    const now = new Date();
    const lastResendAt = user.lastResendAt ?? new Date(0);
    const waitMinutes = Math.min(((user.resendCount ?? 0) + 1) * 2, 60);
    const nextAllowed = new Date(lastResendAt.getTime() + waitMinutes * 60_000);
    if (nextAllowed > now) {
      const remaining = Math.ceil((nextAllowed.getTime() - now.getTime()) / 60_000);
      return {
        success: "warning",
        message: `Veuillez patienter ${remaining} minute(s) avant de soumettre une nouvelle requête.`,
      };
    }

    const token = sealToken("password-reset", { uid: user.userId, fp: passwordFingerprint(user.password) }, RESET_TTL);
    const params = new URLSearchParams({
      accessToken: token,
      entity: "Mot de passe oublié",
      currentStep: "3",
      totalStep: "3",
    });
    await sendPasswordResetEmail(user.email, user.firstName, `${appUrl()}/auth/new-password?${params}`);
    await db
      .update(users)
      .set({ resendCount: (user.resendCount ?? 0) + 1, lastResendAt: now })
      .where(eq(users.userId, user.userId));
    return { success: true };
  } catch (error) {
    console.error("requestPasswordReset failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}

export async function resetPassword(input: unknown): Promise<Result> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Veuillez vérifier le mot de passe saisi." };
  const expired: Result = {
    success: false,
    message: "Ce lien de validation n'existe plus. Veuillez soumettre une nouvelle requête.",
  };
  const payload = openToken<{ uid: string; fp: string }>("password-reset", parsed.data.token);
  if (!payload) return expired;
  try {
    const user = await findUserById(payload.uid);
    // The fingerprint no longer matches once the password changed: the link is single-use.
    if (!user || passwordFingerprint(user.password) !== payload.fp) return expired;
    if (await verifyPassword(user.password, parsed.data.password)) {
      return { success: false, message: "Vous ne pouvez pas insérer votre mot de passe actuel" };
    }
    await setPassword(user.userId, parsed.data.password, { resetCounter: true });
    await sendPasswordChangedEmail(user.email, user.firstName, `${appUrl()}/auth/forgot-password`).catch((error) =>
      console.error("password-changed email failed", error),
    );
    return { success: true };
  } catch (error) {
    console.error("resetPassword failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}

export async function changePassword(input: unknown): Promise<Result> {
  const session = await auth();
  const userId = session?.user?.userId;
  if (!userId) return { success: false, message: "Veuillez vous reconnecter." };
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Veuillez vérifier le mot de passe saisi." };
  try {
    const user = await findUserById(userId);
    if (!user || !(await verifyPassword(user.password, parsed.data.password))) {
      return { success: false, message: "Les mots de passe ne correspondent pas." };
    }
    if (await verifyPassword(user.password, parsed.data.newPassword)) {
      return { success: false, message: "Vous ne pouvez pas insérer le même mot de passe." };
    }
    await setPassword(user.userId, parsed.data.newPassword);
    await sendPasswordChangedEmail(user.email, user.firstName, `${appUrl()}/auth/forgot-password`).catch((error) =>
      console.error("password-changed email failed", error),
    );
    return { success: true };
  } catch (error) {
    console.error("changePassword failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}

async function setPassword(userId: string, password: string, { resetCounter = false } = {}) {
  const hash = await hashPassword(password);
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ password: hash, updatedAt: new Date(), ...(resetCounter ? { resendCount: 0 } : {}) })
      .where(eq(users.userId, userId));
    // Revoke the user's API tokens, as the Adonis API did on password change.
    await tx.delete(authAccessTokens).where(eq(authAccessTokens.tokenableId, userId));
  });
}
