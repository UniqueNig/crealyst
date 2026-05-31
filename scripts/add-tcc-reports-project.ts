/**
 * Adds "The Communion Centre Reports" as a Project. Idempotent.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "tcc-reports";
  const data = {
    slug,
    title: "The Communion Centre Reports",
    summary:
      "Secure church management and reporting platform — authenticated portal for members and admins.",
    description:
      "A web-based reporting and member-management tool built for The Communion Centre. Provides authenticated access for church members and administrators to consume reports, manage records, and coordinate operational data. Includes secure email/password login with password recovery, an admin-supported user model, and a clean, professional UI designed for non-technical church staff.",
    role: "Full-Stack Developer",
    year: 2025,
    liveUrl: "https://tcc-reports.vercel.app/",
    repoUrl: "",
    coverImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&h=900&fit=crop",
    gallery: [],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB", "Auth"],
    order: 5,
    featured: true,
    published: true,
    metaTitle: null,
    metaDesc: null,
  };

  const existing = await prisma.project.findFirst({ where: { slug } });
  if (existing) {
    await prisma.project.update({ where: { id: existing.id }, data });
    console.log(`[tcc-reports] Updated: ${data.title}`);
  } else {
    await prisma.project.create({ data });
    console.log(`[tcc-reports] Created: ${data.title}`);
  }

  console.log(
    `\nReplace the placeholder cover and tweak tech stack from /admin/projects when ready.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
