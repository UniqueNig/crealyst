import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ProfileEditor } from "./profile-editor";
import { ThemePicker } from "./theme-picker";
import type { ThemeKey } from "@/lib/themes";

export default async function ProfileAdminPage() {
  const session = await verifySession();
  const profile = await prisma.profile.findFirst({
    where: { userId: session.sub },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="Profile"
        description="Your bio, photo, and social links — shown across the public site."
      />
      <div className="flex flex-col gap-8">
        <ThemePicker
          currentAccent={(profile?.accent as ThemeKey | null) ?? "default"}
          username={session.username}
        />
        <ProfileEditor initial={profile} />
      </div>
    </div>
  );
}
