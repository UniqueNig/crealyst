/**
 * Adds this portfolio site as a Project. Idempotent — if a project with
 * slug "emmanuel-faniyi-portfolio" already exists, it's updated in place.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "emmanuel-faniyi-portfolio";
  const data = {
    slug,
    title: "Emmanuel Faniyi Portfolio",
    summary:
      "The site you're reading right now — a fully editable, GraphQL-powered developer portfolio + CMS.",
    description:
      "Designed and built end-to-end as a fully-bespoke portfolio + admin panel. Every public surface — bio, skills, services, projects, experience, education, certifications, contact inbox — is editable live from the /admin panel without redeploying. The admin uses urql against a Pothos + GraphQL Yoga endpoint, with on-demand cache invalidation via Next.js's revalidateTag for instant updates. SEO-optimized with per-page metadata, dynamic OG images, a database-driven sitemap, and Cloudinary-hosted images. Dark/light mode, motion-rich UI built with Framer Motion, and a contact form that saves to MongoDB plus emails via Resend.",
    role: "Designer & Full-Stack Engineer",
    year: 2026,
    liveUrl: "https://emmanuelfaniyi.vercel.app/",
    repoUrl: "https://github.com/UniqueNig",
    coverImage:
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=1600&h=900&fit=crop",
    gallery: [],
    techStack: [
      "Next.js 16",
      "TypeScript",
      "Tailwind 4",
      "MongoDB",
      "Prisma",
      "GraphQL",
      "Pothos",
      "urql",
      "Framer Motion",
      "Cloudinary",
      "Resend",
    ],
    order: -1,
    featured: true,
    published: true,
    metaTitle: null,
    metaDesc: null,
  };

  const existing = await prisma.project.findFirst({ where: { slug } });
  if (existing) {
    await prisma.project.update({ where: { id: existing.id }, data });
    console.log(`[portfolio] Updated existing project: ${data.title}`);
  } else {
    await prisma.project.create({ data });
    console.log(`[portfolio] Created: ${data.title}`);
  }

  console.log(
    `\nReplace the placeholder cover from /admin/projects/<id>/edit when ready.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
