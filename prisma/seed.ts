import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SKILLS_CATALOG } from "../lib/skills-catalog";

const prisma = new PrismaClient();

/**
 * Seeds a single-tenant graphic-designer portfolio with realistic PLACEHOLDER
 * content so the site looks complete out of the box. Everything here is meant
 * to be edited from /admin — the names, projects, and socials are stand-ins.
 *
 * Re-running is safe: the profile is only filled while it's still blank, and
 * each content type is only seeded when the user has none yet. Once the friend
 * edits his portfolio, re-seeding won't overwrite his work.
 */

function skillIcon(key: string): string | null {
  return SKILLS_CATALOG.find((s) => s.key === key)?.iconUrl ?? null;
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.NEXT_PUBLIC_TENANT_USERNAME;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before running the seed."
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }
  if (!username) {
    throw new Error(
      "NEXT_PUBLIC_TENANT_USERNAME must be set in .env — it's the username the " +
        "portfolio resolves at and must match what proxy.ts rewrites to."
    );
  }

  // ─── The tenant user ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, username },
    create: { email, passwordHash, username, emailVerified: true },
  });
  console.log(`[seed] User ready: ${user.username} (${user.email})`);
  const userId = user.id;

  // ─── Profile ──────────────────────────────────────────────────────────
  // Fill only while blank (name === ""), so we never clobber real edits.
  const existingProfile = await prisma.profile.findUnique({ where: { userId } });
  const profileData = {
    name: "Jordan Rivera",
    title: "Graphic Designer & Brand Strategist",
    tagline: "I craft brands, layouts, and visual stories that stick.",
    bio: "I'm a multidisciplinary graphic designer with a love for clean type, bold color, and brands with personality. Over the years I've shaped identities, packaging, editorial layouts, and social campaigns for studios and independent clients — taking each project from first sketch to print-ready files. I care about the details most people feel but never notice.",
    email,
    location: "Lagos, Nigeria",
    avatarUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=480&h=480&fit=crop",
    resumeUrl: "",
    github: "",
    linkedin: "https://www.linkedin.com/",
    twitter: "",
    instagram: "https://www.instagram.com/",
    dribbble: "https://dribbble.com/",
  };
  if (!existingProfile) {
    await prisma.profile.create({ data: { userId, ...profileData } });
    console.log(`[seed] Profile created with placeholder content.`);
  } else if (!existingProfile.name?.trim()) {
    await prisma.profile.update({
      where: { userId },
      data: profileData,
    });
    console.log(`[seed] Blank profile filled with placeholder content.`);
  } else {
    console.log(`[seed] Profile already edited, leaving it untouched.`);
  }

  // ─── Skills ─────────────────────────────────────────────────────────────
  const skillCount = await prisma.skill.count({ where: { userId } });
  if (skillCount === 0) {
    const keys = [
      "photoshop",
      "illustrator",
      "indesign",
      "coreldraw",
      "figma",
      "aftereffects",
      "premiere",
      "lightroom",
      "canva",
      "affinity",
      "blender",
      "framer",
    ];
    const data = keys.map((k, i) => ({
      userId,
      name: SKILLS_CATALOG.find((s) => s.key === k)?.name ?? k,
      category: "DESIGN" as const,
      iconUrl: skillIcon(k),
      order: i,
    }));
    await prisma.skill.createMany({ data });
    console.log(`[seed] Created ${data.length} skills.`);
  } else {
    console.log(`[seed] Skills already exist (${skillCount}), skipping.`);
  }

  // ─── Services ─────────────────────────────────────────────────────────
  const serviceCount = await prisma.service.count({ where: { userId } });
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          userId,
          slug: "brand-identity-logo-design",
          title: "Brand Identity & Logo Design",
          description:
            "Distinctive logos and complete visual identity systems that give your brand a confident, consistent voice.",
          icon: "Palette",
          features: [
            "Logo design & identity systems",
            "Color, typography & brand guidelines",
            "Stationery & brand collateral",
            "Rebrands & logo refreshes",
          ],
          order: 0,
          featured: true,
          published: true,
        },
        {
          userId,
          slug: "print-editorial-design",
          title: "Print & Editorial Design",
          description:
            "Layouts that read beautifully on paper — from magazines and brochures to posters and packaging.",
          icon: "Layout",
          features: [
            "Magazines, brochures & catalogs",
            "Posters, flyers & banners",
            "Book & cover layout",
            "Print-ready file preparation",
          ],
          order: 1,
          featured: true,
          published: true,
        },
        {
          userId,
          slug: "social-digital-graphics",
          title: "Social Media & Digital Graphics",
          description:
            "Scroll-stopping visuals and templates that keep your brand looking sharp across every feed.",
          icon: "Megaphone",
          features: [
            "Social templates & campaign kits",
            "Ad creatives & banners",
            "Presentation & pitch decks",
            "Motion graphics for reels",
          ],
          order: 2,
          featured: true,
          published: true,
        },
        {
          userId,
          slug: "illustration-motion",
          title: "Illustration & Motion",
          description:
            "Custom illustration and lightweight motion that add character and movement to your story.",
          icon: "Film",
          features: [
            "Custom illustration & iconography",
            "Character & mascot design",
            "Animated logos & intros",
            "Short promo & explainer clips",
          ],
          order: 3,
          featured: true,
          published: true,
        },
      ],
    });
    console.log(`[seed] Created 4 services.`);
  } else {
    console.log(`[seed] Services already exist (${serviceCount}), skipping.`);
  }

  // ─── Projects ──────────────────────────────────────────────────────────
  const projectCount = await prisma.project.count({ where: { userId } });
  if (projectCount === 0) {
    const projects = [
      {
        slug: "aurora-coffee-brand",
        title: "Aurora Coffee — Brand Identity",
        summary:
          "A warm, modern identity for a specialty coffee roaster — logo, packaging, and storefront.",
        description:
          "Aurora Coffee needed an identity as carefully sourced as their beans. I built a flexible logo system, a warm earthy palette, custom packaging, and signage that work together from the bag on the shelf to the sign above the door.",
        role: "Brand & Identity Designer",
        year: 2024,
        coverImage:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=900&fit=crop",
        tags: ["Branding"],
        techStack: ["Illustrator", "Photoshop", "InDesign"],
        order: 0,
        featured: true,
      },
      {
        slug: "bloom-skincare-packaging",
        title: "Bloom Skincare — Packaging",
        summary:
          "Minimal, tactile packaging for a clean-beauty skincare line across a full product range.",
        description:
          "A calm, botanical packaging system for Bloom's skincare range — soft gradients, generous whitespace, and a typographic hierarchy that scales cleanly from tiny serum bottles to boxed gift sets.",
        role: "Packaging Designer",
        year: 2024,
        coverImage:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=900&fit=crop",
        tags: ["Packaging"],
        techStack: ["Illustrator", "Photoshop"],
        order: 1,
        featured: true,
      },
      {
        slug: "type-forward-poster-series",
        title: "Type Forward — Poster Series",
        summary:
          "An experimental typographic poster series exploring rhythm, scale, and negative space.",
        description:
          "A self-initiated series of large-format posters pushing expressive typography — each one a study in contrast, grid-breaking layouts, and bold color blocking, printed as a limited risograph run.",
        role: "Graphic Designer",
        year: 2023,
        coverImage:
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&h=900&fit=crop",
        tags: ["Print", "Typography"],
        techStack: ["InDesign", "Illustrator"],
        order: 2,
        featured: true,
      },
      {
        slug: "wander-travel-magazine",
        title: "Wander — Travel Magazine",
        summary:
          "Editorial design and art direction for an independent quarterly travel magazine.",
        description:
          "Wander is a print-first travel magazine. I designed the grid, type system, and feature layouts — balancing immersive full-bleed photography with long-form reading comfort across a 96-page issue.",
        role: "Editorial Designer",
        year: 2023,
        coverImage:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop",
        tags: ["Editorial"],
        techStack: ["InDesign", "Photoshop"],
        order: 3,
        featured: true,
      },
      {
        slug: "pulse-fest-social-campaign",
        title: "Pulse Fest — Social Campaign",
        summary:
          "A bold, animated social campaign kit for a three-day music festival.",
        description:
          "Pulse Fest needed a campaign that felt as energetic as the lineup. I created an animated visual language — gradient washes, kinetic type, and a modular template kit the team could roll out across Instagram, TikTok, and out-of-home.",
        role: "Visual Designer",
        year: 2023,
        coverImage:
          "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&h=900&fit=crop",
        tags: ["Social", "Motion"],
        techStack: ["After Effects", "Illustrator", "Photoshop"],
        order: 4,
        featured: false,
      },
      {
        slug: "mark-makers-logo-collection",
        title: "Mark Makers — Logo Collection",
        summary:
          "A curated collection of logo marks and wordmarks designed for small businesses.",
        description:
          "A rolling collection of logo work for startups and local businesses — each mark built for versatility, working as cleanly in a favicon as on a storefront. A look at range across industries and styles.",
        role: "Logo Designer",
        year: 2022,
        coverImage:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop",
        tags: ["Logo", "Branding"],
        techStack: ["Illustrator"],
        order: 5,
        featured: false,
      },
    ];
    await prisma.project.createMany({
      data: projects.map((p) => ({ userId, published: true, ...p })),
    });
    console.log(`[seed] Created ${projects.length} projects.`);
  } else {
    console.log(`[seed] Projects already exist (${projectCount}), skipping.`);
  }

  // ─── Experience ─────────────────────────────────────────────────────────
  const expCount = await prisma.experience.count({ where: { userId } });
  if (expCount === 0) {
    await prisma.experience.createMany({
      data: [
        {
          userId,
          company: "Studio Mono",
          role: "Senior Graphic Designer",
          location: "Lagos, Nigeria",
          startDate: new Date("2022-01-01"),
          endDate: null,
          description:
            "Leading brand and editorial projects end to end, and art-directing junior designers.",
          bullets: [
            "Led identity systems for 15+ brands across hospitality and retail.",
            "Built the studio's reusable template and brand-guideline kits.",
            "Mentored two junior designers on type, grids, and print production.",
          ],
          companyUrl: "",
          order: 0,
        },
        {
          userId,
          company: "Bright Creative Agency",
          role: "Graphic Designer",
          location: "Lagos, Nigeria",
          startDate: new Date("2019-03-01"),
          endDate: new Date("2021-12-31"),
          description:
            "Designed campaigns, social content, and print collateral for agency clients.",
          bullets: [
            "Produced social and ad creative for 20+ client accounts.",
            "Designed pitch decks that helped win several new retainers.",
          ],
          companyUrl: "",
          order: 1,
        },
        {
          userId,
          company: "Freelance",
          role: "Junior Designer",
          location: "Remote",
          startDate: new Date("2017-06-01"),
          endDate: new Date("2019-02-28"),
          description:
            "Took on logo, flyer, and social work for small businesses while building a portfolio.",
          bullets: [
            "Delivered 50+ small-business design projects.",
            "Learned client communication and print prep on real jobs.",
          ],
          companyUrl: "",
          order: 2,
        },
      ],
    });
    console.log(`[seed] Created 3 experience entries.`);
  } else {
    console.log(`[seed] Experience already exists (${expCount}), skipping.`);
  }

  // ─── Education ────────────────────────────────────────────────────────
  const eduCount = await prisma.education.count({ where: { userId } });
  if (eduCount === 0) {
    await prisma.education.createMany({
      data: [
        {
          userId,
          school: "University of the Arts",
          degree: "BA, Graphic Design",
          range: "2013 — 2017",
          location: "Lagos, Nigeria",
          description:
            "Studied visual communication, typography, and print production. Graduated with honors.",
          order: 0,
        },
      ],
    });
    console.log(`[seed] Created 1 education entry.`);
  } else {
    console.log(`[seed] Education already exists (${eduCount}), skipping.`);
  }

  // ─── Certifications ───────────────────────────────────────────────────
  const certCount = await prisma.certification.count({ where: { userId } });
  if (certCount === 0) {
    await prisma.certification.createMany({
      data: [
        {
          userId,
          name: "Adobe Certified Professional — Visual Design",
          issuer: "Adobe",
          year: "2021",
          credentialUrl: "",
          order: 0,
        },
        {
          userId,
          name: "Google UX Design Certificate",
          issuer: "Google",
          year: "2022",
          credentialUrl: "",
          order: 1,
        },
      ],
    });
    console.log(`[seed] Created 2 certifications.`);
  } else {
    console.log(`[seed] Certifications already exist (${certCount}), skipping.`);
  }

  console.log(
    `\n[seed] Done. Placeholder content is live — sign in at /admin to make it yours.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
