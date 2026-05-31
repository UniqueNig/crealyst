"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { resolveTheme, type ThemeKey } from "@/lib/themes";

export type ThemeState =
  | { status: "idle" }
  | { status: "success"; message: string; accent: ThemeKey }
  | { status: "error"; message: string };

export async function updateAccentAction(
  _prev: ThemeState,
  formData: FormData
): Promise<ThemeState> {
  const session = await verifySession();
  const raw = String(formData.get("accent") ?? "").trim();

  // "default" stores null — keeps the column tidy and avoids special-casing
  // unset users elsewhere.
  const persist = raw === "default" || raw === "" ? null : raw;

  // Reject unknown presets so the field can't be poisoned with arbitrary
  // strings via a crafted request.
  if (persist && !resolveTheme(persist)) {
    return { status: "error", message: "Unknown theme." };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.sub },
    select: { id: true },
  });

  if (!profile) {
    // Edge case: user hit theme picker before completing onboarding.
    // Create a minimal profile shell so the accent has somewhere to live.
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { email: true, username: true },
    });
    if (!user) return { status: "error", message: "Account not found." };
    await prisma.profile.create({
      data: {
        userId: session.sub,
        name: user.username,
        title: "",
        tagline: "",
        bio: "",
        email: user.email,
        accent: persist,
      },
    });
  } else {
    await prisma.profile.update({
      where: { userId: session.sub },
      data: { accent: persist },
    });
  }

  revalidateTag(`profile:user:${session.sub}`, { expire: 0 });
  revalidateTag("discovery", { expire: 0 });

  return {
    status: "success",
    message: "Theme saved.",
    accent: (persist ?? "default") as ThemeKey,
  };
}
