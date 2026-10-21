import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validation/auth";
import { openToken } from "@/server/auth/tokens";
import { checkCredentials, findUserByEmail, findUserById, toSessionUser, type UserRow } from "@/server/auth/users";
import type { RegistrationToken } from "@/server/actions/auth";

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

// TRANSITIONAL: actions not yet ported still call the Adonis API with a bearer token.
// Passwords are verified against the database above; this only mints the API token.
// Remove once nothing reads `session.user.accessToken`.
async function issueApiToken(email: string, password: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: process.env.NEXT_PUBLIC_APP_URL!,
        "Accept-Language": "fr",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) return data.user.accessToken;
    console.error("API token bridge: login refused", response.status);
  } catch (error) {
    console.error("API token bridge failed", error);
  }
  return "";
}

const nextAuthResult = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidCredentials();
        const { email, password } = parsed.data;
        const user = await checkCredentials(email, password);
        if (!user) throw new InvalidCredentials();
        return toSessionUser(user, await issueApiToken(email, password));
      },
    }),
    // Signs the user in from the emailed registration link, right after the account is created,
    // so the plaintext password never has to travel back to the browser.
    Credentials({
      id: "registration",
      credentials: { token: {} },
      authorize: async (credentials) => {
        const data = openToken<RegistrationToken>("registration", String(credentials.token ?? ""));
        if (!data) throw new InvalidCredentials();
        const user = await findUserByEmail(data.email);
        if (!user || user.password !== data.passwordHash) throw new InvalidCredentials();
        return toSessionUser(user, "");
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        return { ...token, ...user };
      }
      // The client calls update() after changing its profile. Never trust the payload it sends
      // (it could rewrite userId or role); reload the profile from the database instead.
      if (trigger === "update" && typeof token.userId === "string") {
        const fresh: UserRow | null = await findUserById(token.userId);
        if (!fresh) return null;
        const { accessToken, ...profile } = toSessionUser(fresh, String(token.accessToken ?? ""));
        return { ...token, ...profile, accessToken };
      }
      return token;
    },

    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.user = token as any;
      return session;
    },

    // Only redirect within the site (the previous callback allowed any URL: an open redirect).
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {}
      return baseUrl;
    },
  },
});

export const handlers: typeof nextAuthResult.handlers = nextAuthResult.handlers;
export const signIn: typeof nextAuthResult.signIn = nextAuthResult.signIn;
export const signOut: typeof nextAuthResult.signOut = nextAuthResult.signOut;
export const auth: typeof nextAuthResult.auth = nextAuthResult.auth;
