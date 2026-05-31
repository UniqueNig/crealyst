"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export type WelcomeState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<
        Record<"name" | "title" | "tagline" | "bio", string>
      >;
    };

export async function completeOnboardingAction(
  _prev: WelcomeState,
  formData: FormData
): Promise<WelcomeState> {
  const session = await verifySession();

  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  const errs: Record<string, string> = {};
  if (!name) errs.name = "Add the name you go by publicly.";
  if (!title) errs.title = "What do you call yourself? e.g. 'Software Engineer'.";
  if (!tagline) errs.tagline = "A short one-liner shown on your homepage.";
  if (bio.length < 30) {
    errs.bio = "At least a sentence or two — visitors read this first.";
  }

  if (Object.keys(errs).length > 0) {
    return {
      status: "error",
      message: "A few fields need attention.",
      fieldErrors: errs as never,
    };
  }

  // Pull the user's email so the new Profile has the required contact email
  // pre-filled from their account. They can edit it later under Profile.
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { email: true },
  });
  if (!user) {
    return { status: "error", message: "Account not found." };
  }

  await prisma.profile.upsert({
    where: { userId: session.sub },
    create: {
      userId: session.sub,
      name,
      title,
      tagline,
      bio,
      email: user.email,
      location: location || null,
    },
    update: {
      name,
      title,
      tagline,
      bio,
      ...(location ? { location } : {}),
    },
  });

  revalidateTag(`profile:user:${session.sub}`, { expire: 0 });
  revalidateTag("discovery", { expire: 0 });
  redirect("/admin");
}

export async function skipOnboardingAction(): Promise<void> {
  // No-op on the data side — the user can finish from the dashboard's
  // onboarding card anytime. Just bounces them to the dashboard.
  redirect("/admin");
}
