import NextAuth from "next-auth";
import type { NextAuthResult, Session } from "next-auth";
import Twitch from "next-auth/providers/twitch";
import type { NextRequest } from "next/server";

declare module "next-auth" {
  interface Session {
    twitchId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    twitchId?: string;
  }
}

export type HubSession = {
  twitchId?: string;
};

function twitchCredentials() {
  const clientId = process.env.AUTH_TWITCH_ID || process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.AUTH_TWITCH_SECRET || process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function createAuth(): NextAuthResult {
  const twitch = twitchCredentials();
  return NextAuth({
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    providers: twitch
      ? [
          Twitch({
            clientId: twitch.clientId,
            clientSecret: twitch.clientSecret,
            authorization: {
              params: {
                scope: "openid",
                claims: {
                  id_token: { picture: null, preferred_username: null },
                },
              },
            },
          }),
        ]
      : [],
    callbacks: {
      jwt({ token, account, profile }) {
        const id =
          account?.providerAccountId ||
          (typeof profile?.sub === "string" ? profile.sub : undefined) ||
          token.sub;
        if (id) token.twitchId = id;
        return token;
      },
      session({ session, token }) {
        const id = (typeof token.twitchId === "string" && token.twitchId) || token.sub;
        if (id) {
          session.twitchId = id;
          if (session.user) session.user.id = id;
        }
        return session;
      },
    },
  });
}

let cached: NextAuthResult | undefined;

function authInstance() {
  cached ??= createAuth();
  return cached;
}

function notConfigured() {
  return Response.json({ error: "Auth is not configured." }, { status: 503 });
}

export const handlers = {
  GET: async (req: NextRequest) => {
    if (!process.env.AUTH_SECRET) return notConfigured();
    return authInstance().handlers.GET(req);
  },
  POST: async (req: NextRequest) => {
    if (!process.env.AUTH_SECRET) return notConfigured();
    return authInstance().handlers.POST(req);
  },
};

export function twitchSignInHref(callbackUrl: string) {
  return `/api/auth/signin/twitch?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function isTwitchAuthEnabled() {
  return Boolean(process.env.AUTH_SECRET && twitchCredentials());
}

export function twitchIdFromSession(session: Session | HubSession | null | undefined) {
  const id = session?.twitchId?.trim();
  return id || undefined;
}

export async function getAuthSession(): Promise<HubSession | null> {
  if (!process.env.AUTH_SECRET) return null;
  try {
    const session = await authInstance().auth();
    if (!session) return null;
    const twitchId =
      twitchIdFromSession(session) ||
      (typeof session.user?.id === "string" ? session.user.id.trim() : "") ||
      undefined;
    return { twitchId: twitchId || undefined };
  } catch {
    return null;
  }
}
