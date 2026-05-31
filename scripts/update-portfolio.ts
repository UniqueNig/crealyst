/**
 * One-shot: refresh Profile / Skills / Projects / Experience in MongoDB to match
 * Emmanuel's real CV. Safe to re-run — it wipes Projects + Experience and recreates.
 * Profile and Skill rows are upserted.
 */

import { PrismaClient } from "@prisma/client";
import { SKILLS_CATALOG } from "../lib/skills-catalog";

const prisma = new PrismaClient();

const PORTFOLIO_URL = "https://emmanuelfaniyi.vercel.app/";

async function main() {
  // ─── Profile ──────────────────────────────────────────────────────────
  const existing = await prisma.profile.findFirst();
  const profileData = {
    name: "Emmanuel Faniyi",
    title: "Full-Stack Developer",
    tagline: "Building responsive, performant web products end-to-end.",
    bio: "Full-Stack Developer with 1+ year of hands-on experience building responsive, high-performance, SEO-optimized web applications across the MERN stack and Next.js. I've shipped 15+ production websites and apps for SMEs, NGOs, and startups — translating designs into clean, scalable code, integrating REST and GraphQL APIs, and improving load times by up to 40%. Currently open to new opportunities and collaborations.",
    email: "faniyiemmanuel2018@gmail.com",
    location: "Abeokuta, Ogun State, Nigeria",
    github: "https://github.com/UniqueNig",
    linkedin: "https://linkedin.com/in/emmanuelfaniyi4/",
  };
  if (existing) {
    await prisma.profile.update({
      where: { id: existing.id },
      data: profileData,
    });
    console.log(`[update] Profile updated`);
  } else {
    await prisma.profile.create({ data: profileData });
    console.log(`[update] Profile created`);
  }

  // ─── Skills: ensure these exist (added by name; won't duplicate) ──────
  const wantedSkillKeys = [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "nextjs",
    "tailwind",
    "bootstrap",
    "nodejs",
    "express",
    "mongodb",
    "graphql",
    "rest",
    "firebase",
    "wordpress",
    "git",
    "github",
    "figma",
  ];

  for (let i = 0; i < wantedSkillKeys.length; i++) {
    const key = wantedSkillKeys[i];
    const cat = SKILLS_CATALOG.find((s) => s.key === key);
    if (!cat) {
      console.warn(`[update] Skipping unknown catalog key: ${key}`);
      continue;
    }
    const existingSkill = await prisma.skill.findFirst({
      where: { name: cat.name },
    });
    if (existingSkill) {
      await prisma.skill.update({
        where: { id: existingSkill.id },
        data: { iconUrl: cat.iconUrl, category: cat.category, order: i },
      });
    } else {
      await prisma.skill.create({
        data: {
          name: cat.name,
          category: cat.category,
          iconUrl: cat.iconUrl,
          order: i,
        },
      });
    }
  }
  console.log(`[update] Upserted ${wantedSkillKeys.length} skills`);

  // ─── Projects: wipe + reseed with real ones from the CV ───────────────
  await prisma.project.deleteMany({});
  const projects = [
    {
      slug: "fanmid-commerce",
      title: "FanMid Commerce",
      summary:
        "Full-stack fashion e-commerce platform with admin panel, payments, and 2,000+ curated products.",
      description:
        "Built a full-stack fashion e-commerce platform across four categories (Tops, Bottoms, Outerwear, Accessories) with 2,000+ curated products. Implemented a GraphQL API with Apollo Server for flexible data querying, JWT-based authentication, and a full admin panel for inventory and order management. Integrated Paystack for secure checkout, added dark/light mode theming, and used Next.js App Router for SSR and optimized performance. MongoDB powers persistence.",
      role: "Full-Stack Developer",
      year: 2025,
      liveUrl: "https://fanmidcommerce.vercel.app/",
      repoUrl: "",
      coverImage:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=900&fit=crop",
      gallery: [],
      techStack: [
        "Next.js 15",
        "TypeScript",
        "GraphQL",
        "Apollo Server",
        "MongoDB",
        "Tailwind CSS",
        "Paystack",
      ],
      order: 0,
      featured: true,
      published: true,
    },
    {
      slug: "abeokuta-gospel-competition",
      title: "Abeokuta Gospel Competition (AGC)",
      summary:
        "Real-time gospel talent show voting platform with live leaderboard and admin stage management.",
      description:
        "Built a real-time gospel talent show voting platform for Abeokuta, Season 1, featuring contestant profiles, a live leaderboard, and a countdown timer for active voting stages. Implemented an admin panel for stage management, contestant registration, and vote tracking, with MongoDB for persistent data storage. Designed a responsive, engaging UI with Tailwind CSS optimized for community event audiences on both mobile and desktop.",
      role: "Full-Stack Developer",
      year: 2025,
      liveUrl: "https://agc-mauve.vercel.app/",
      repoUrl: "",
      coverImage:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop",
      gallery: [],
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB"],
      order: 1,
      featured: true,
      published: true,
    },
    {
      slug: "fanmid-consult",
      title: "FanMid Consult",
      summary:
        "Professional consulting platform with React frontend and Express.js backend.",
      description:
        "Developed a professional consulting platform with a React frontend and Express.js backend, featuring service listings, consultation booking, and contact workflows. Styled with Tailwind CSS for a modern, fully responsive UI across desktop and mobile. Built RESTful API endpoints with Express.js to handle form submissions, service inquiries, and client data management.",
      role: "Full-Stack Developer",
      year: 2024,
      liveUrl: "https://fanmidconsult.vercel.app/",
      repoUrl: "",
      coverImage:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&h=900&fit=crop",
      gallery: [],
      techStack: ["React", "Tailwind CSS", "Express.js", "REST"],
      order: 2,
      featured: true,
      published: true,
    },
    {
      slug: "branmart-marketplace",
      title: "Branmart Online Marketplace",
      summary:
        "Modern React-based e-commerce frontend with interactive cart and product filtering.",
      description:
        "Developed a modern e-commerce frontend using React, featuring structured product listings and intuitive navigation. Built reusable, responsive UI components optimized for mobile, tablet, and desktop. Implemented interactive shopping cart functionality with real-time updates, robust form validation, and search/filter features. Delivered a scalable frontend architecture optimized for performance and future backend integrations.",
      role: "Frontend Developer",
      year: 2024,
      liveUrl: "https://branmart.vercel.app/",
      repoUrl: "",
      coverImage:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=900&fit=crop",
      gallery: [],
      techStack: ["React", "HTML5", "Bootstrap"],
      order: 3,
      featured: true,
      published: true,
    },
    {
      slug: "book-ecommerce-platform",
      title: "Book E-Commerce Platform",
      summary:
        "Full-featured online bookstore with Firebase auth, secure checkout, and real-time cart.",
      description:
        "Built a full-featured online bookstore with user authentication, secure checkout, and real-time cart updates. Implemented dynamic product listings, filtering, and search functionality, and integrated Firebase Authentication, Firestore, and Hosting for backend services. Designed reusable UI components for consistency and scalability, with strong cross-browser compatibility and clean validation throughout.",
      role: "Solo Developer",
      year: 2023,
      liveUrl: "https://uniquebooks-bc7cb.web.app",
      repoUrl: "",
      coverImage:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&h=900&fit=crop",
      gallery: [],
      techStack: ["HTML5", "Bootstrap", "JavaScript", "Firebase"],
      order: 4,
      featured: false,
      published: true,
    },
  ];
  await prisma.project.createMany({ data: projects });
  console.log(`[update] Created ${projects.length} projects`);

  // ─── Experience: wipe + reseed with real ones from the CV ─────────────
  await prisma.experience.deleteMany({});
  const experience = [
    {
      company: "Semester Technologies",
      role: "Frontend Developer",
      location: "Remote",
      startDate: new Date("2025-02-01"),
      endDate: null,
      description:
        "Building and shipping responsive, performant web apps for clients in a fast-paced remote team.",
      bullets: [
        "Developed and deployed 10+ responsive web applications, improving user engagement by 20%.",
        "Translated UI/UX designs into reusable React + Tailwind components.",
        "Reduced page load time by 40% and improved Lighthouse scores from 65 to 90+.",
        "Ensured cross-browser and cross-device compatibility across Chrome, Firefox, Safari, Edge.",
        "Collaborated in Agile sprints, delivering features up to 2 weeks ahead of deadline.",
      ],
      companyUrl: "",
      order: 0,
    },
    {
      company: "SQI College of ICT",
      role: "Fullstack Developer (Trainee)",
      location: "Nigeria",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2026-03-31"),
      description:
        "Project-based training expanding into full-stack with the MERN stack and modern Next.js workflows.",
      bullets: [
        "Expanding expertise in React, Node.js, Express, MongoDB, and Tailwind CSS.",
        "Building dynamic full-stack applications with scalable frontend-backend integration.",
        "Applying Agile methodologies to real-world team development.",
      ],
      companyUrl: "",
      order: 1,
    },
    {
      company: "Floxy VBA",
      role: "WordPress Developer",
      location: "Remote",
      startDate: new Date("2022-12-01"),
      endDate: new Date("2024-02-29"),
      description:
        "Built and maintained WordPress sites for SMEs, NGOs, and e-commerce businesses.",
      bullets: [
        "Designed, developed, and maintained 15+ WordPress sites with 95% client satisfaction.",
        "Customized themes and plugins to meet branding and functional needs.",
        "Implemented SEO best practices, increasing organic traffic by ~30% on average.",
        "Integrated WooCommerce + payment gateways, supporting 50+ monthly transactions.",
        "Wrote user guides + technical docs, reducing post-launch support requests by 25%.",
      ],
      companyUrl: "",
      order: 2,
    },
  ];
  await prisma.experience.createMany({ data: experience });
  console.log(`[update] Created ${experience.length} experience entries`);

  console.log(`\n[update] Done. Portfolio URL on CV: ${PORTFOLIO_URL}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
