import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { prisma } from "./prisma";

const SESSION_COOKIE = "ef_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "api",
  "app",
  "auth",
  "about",
  "blog",
  "contact",
  "dashboard",
  "docs",
  "explore",
  "faq",
  "help",
  "home",
  "login",
  "logout",
  "marketing",
  "new",
  "now",
  "press",
  "pricing",
  "privacy",
  "profile",
  "projects",
  "public",
  "register",
  "root",
  "services",
  "settings",
  "signin",
  "signup",
  "site",
  "static",
  "support",
  "team",
  "terms",
  "u",
  "user",
  "www",
]);

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to a 32+ character random string. See .env.example."
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
  username: string;
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    email: payload.email,
    username: payload.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_TTL_SECONDS)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function readSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = await readSessionToken();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  } catch {
    return null;
  }
});

export async function verifySession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

/**
 * Look up the current user's role. Cached per request to avoid repeat DB hits
 * when the layout AND the page both check ownership.
 */
export const getCurrentRole = cache(
  async (): Promise<"OWNER" | "USER" | null> => {
    const session = await getSession();
    if (!session) return null;
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { role: true },
    });
    return user?.role ?? null;
  }
);

export async function isOwner(): Promise<boolean> {
  return (await getCurrentRole()) === "OWNER";
}

export async function requireOwner(): Promise<SessionPayload> {
  const session = await verifySession();
  const role = await getCurrentRole();
  if (role !== "OWNER") throw new Error("FORBIDDEN");
  return session;
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<SessionPayload> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");
  // Verify credentials BEFORE leaking account-state details, so an attacker
  // can't tell suspended / deleted accounts apart from non-existent ones
  // without knowing the password.
  if (user.deletedAt) throw new Error("ACCOUNT_DEACTIVATED");
  if (user.suspendedAt) throw new Error("ACCOUNT_SUSPENDED");
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    username: user.username,
  };
  await createSession(payload);
  return payload;
}

// ─── Username helpers ─────────────────────────────────────────────────────

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export type UsernameValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateUsername(input: string): UsernameValidationResult {
  const u = normalizeUsername(input);
  if (u.length < 3) return { ok: false, reason: "Username must be at least 3 characters." };
  if (u.length > 30) return { ok: false, reason: "Username must be at most 30 characters." };
  if (!USERNAME_RE.test(u)) {
    return {
      ok: false,
      reason:
        "Username may only contain lowercase letters, numbers, and hyphens, and must start and end with a letter or number.",
    };
  }
  if (RESERVED_USERNAMES.has(u)) {
    return { ok: false, reason: "That username is reserved. Try another." };
  }
  return { ok: true };
}

export async function isUsernameAvailable(input: string): Promise<boolean> {
  const u = normalizeUsername(input);
  if (!validateUsername(u).ok) return false;
  const existing = await prisma.user.findUnique({ where: { username: u } });
  return existing == null;
}

// ─── Registration ─────────────────────────────────────────────────────────

export type RegisterInput = {
  email: string;
  password: string;
  username: string;
};

export type RegisterError =
  | "INVALID_EMAIL"
  | "WEAK_PASSWORD"
  | "INVALID_USERNAME"
  | "EMAIL_TAKEN"
  | "USERNAME_TAKEN";

export async function registerWithCredentials(
  input: RegisterInput
): Promise<SessionPayload> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INVALID_EMAIL" satisfies RegisterError);
  }
  if (input.password.length < 8) {
    throw new Error("WEAK_PASSWORD" satisfies RegisterError);
  }
  const username = normalizeUsername(input.username);
  const validation = validateUsername(username);
  if (!validation.ok) {
    throw new Error("INVALID_USERNAME" satisfies RegisterError);
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error("EMAIL_TAKEN" satisfies RegisterError);

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) throw new Error("USERNAME_TAKEN" satisfies RegisterError);

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username,
      profile: {
        create: {
          name: username,
          title: "",
          tagline: "",
          bio: "",
          email,
        },
      },
    },
  });

  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    username: user.username,
  };
  await createSession(payload);
  return payload;
}
