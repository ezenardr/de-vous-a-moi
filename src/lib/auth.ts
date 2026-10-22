import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginSchema } from "@/lib/validation/auth";
import { exchangeGoogleCode, findOrCreateGoogleUser, GOOGLE_STATE_COOKIE } from "@/server/auth/google";
import { blockedFor, clear, hit, LIMITS } from "@/server/auth/rateLimit";
import { botFieldsSchema, checkBot } from "@/server/botCheck";
import { recheckToken, sessionToken } from "@/server/auth/session";
import { openToken } from "@/server/auth/tokens";
import { checkCredentials, findUserByEmail } from "@/server/auth/users";
import type { RegistrationToken } from "@/server/actions/auth";

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}
class RateLimited extends CredentialsSignin {
  code = "rate_limited";
}
class BotCheckFailed extends CredentialsSignin {
  code = "bot_check";
}

// Google sign-in is offered only once its OAuth client is configured (AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET).
export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
// The OAuth client ID is public (it is in every Google sign-in URL); the popup button needs it.
export const googleClientId = googleEnabled ? process.env.AUTH_GOOGLE_ID : undefined;

const ipOf = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

// The popup's state cookie, read from the sign-in request (double-submit check against login CSRF).
function cookieValue(request: Request, name: string) {
  for (const part of request.headers.get("cookie")?.split(";") ?? []) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
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
        turnstileToken: {},
        website: {},
        openedAt: {},
      },
      // Bot checks first (server/botCheck: a caught trap looks like wrong credentials), then throttled
      // per email (5 failures / 15 min) and per IP (30 / 15 min); success clears the email counter.
      authorize: async (credentials, request) => {
        const parsed = loginSchema.extend(botFieldsSchema.shape).safeParse(credentials);
        if (!parsed.success) throw new InvalidCredentials();
        const { email, password, ...bot } = parsed.data;
        const ip = ipOf(request);
        const check = await checkBot(bot, ip);
        if (check === "trap") throw new InvalidCredentials();
        if (check === "challenge-failed") throw new BotCheckFailed();
        if ((await blockedFor(LIMITS.loginEmail, email)) || (await blockedFor(LIMITS.loginIp, ip))) throw new RateLimited();
        const user = await checkCredentials(email, password);
        if (!user) {
          await Promise.all([hit(LIMITS.loginEmail, email), hit(LIMITS.loginIp, ip)]);
          throw new InvalidCredentials();
        }
        await clear(LIMITS.loginEmail, email);
        return sessionToken(user);
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
        return sessionToken(user);
      },
    }),
    // Google in a popup (Google Identity Services, ux_mode "popup"): the page sends the one-time code and
    // the state Google echoed back; the state must match the cookie the page set before opening the popup.
    ...(googleEnabled
      ? [
          Credentials({
            id: "google-popup",
            credentials: { code: {}, state: {} },
            authorize: async (credentials, request) => {
              const code = String(credentials.code ?? "");
              const state = String(credentials.state ?? "");
              if (!code || code.length > 2048 || state.length < 16 || state !== cookieValue(request, GOOGLE_STATE_COOKIE)) {
                throw new InvalidCredentials();
              }
              const profile = await exchangeGoogleCode(code);
              const user = profile && (await findOrCreateGoogleUser(profile));
              if (!user) throw new InvalidCredentials();
              return sessionToken(user);
            },
          }),
          // Full-page fallback when the popup is blocked or Google's script didn't load.
          Google,
        ]
      : []),
  ],

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  callbacks: {
    // Google: only verified addresses, since the account is linked by email.
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      return profile?.email_verified === true && typeof profile.email === "string";
    },

    async jwt({ token, user, account, profile, trigger }) {
      if (account?.provider === "google" && profile?.email) {
        const row = await findOrCreateGoogleUser({
          email: profile.email.toLowerCase(),
          firstName: String(profile.given_name ?? ""),
          lastName: String(profile.family_name ?? ""),
        });
        return row ? { ...token, ...sessionToken(row) } : null;
      }
      if (user) {
        return { ...token, ...user };
      }
      // The client calls update() after changing its profile. Never trust the payload it sends
      // (it could rewrite userId or role); reload the profile from the database instead.
      // The same reload runs every few minutes: a session whose password changed since is ended.
      return recheckToken(token, trigger === "update");
    },

    async session({ session, token }) {
      // Internal fields stay in the encrypted cookie, never in the client-side session.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pwfp, checkedAt, ...publicToken } = token;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.user = publicToken as any;
      return session;
    },

    // Only redirect within the site (the previous callback allowed any URL: an open redirect).
    redirect({ url, baseUrl }) {
      if (url.startsWith("/") && !url.startsWith("//")) return `${baseUrl}${url}`;
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
