import { PrismaClient } from "@prisma/client";

// One-off: set the tenant owner's title + tagline, which drive the public
// portfolio's SEO/OG description ("<Name> — <title>" + tagline). Editable
// afterwards from /admin → Profile. Run: npx tsx scripts/update-seo.ts
const prisma = new PrismaClient();

async function main() {
  const username = process.env.NEXT_PUBLIC_TENANT_USERNAME?.trim();
  if (!username) throw new Error("NEXT_PUBLIC_TENANT_USERNAME not set in .env");

  const user = await prisma.user.findFirst({ where: { username } });
  if (!user) throw new Error(`No user with username '${username}'`);

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      title: "Creative Designer",
      tagline: "Design that tell stories. Jesus Inspires, I Design.",
    },
  });
  console.log(`[seo] Updated title + tagline for ${username}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
