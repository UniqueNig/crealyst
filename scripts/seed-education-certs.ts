/**
 * One-shot: seed Education + Certifications from Emmanuel's CV.
 * Idempotent: skips rows that already exist (matched by school / name).
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Education ────────────────────────────────────────────────────────
  const educations = [
    {
      school: "Moshood Abiola Polytechnic, Ojere",
      degree:
        "Higher National Diploma (HND), Electrical & Electronics Engineering (Telecommunications)",
      range: "2019 – 2024",
      location: "Ojere, Ogun State",
      description: null,
      order: 0,
    },
    {
      school: "Ifelodun Comprehensive High School",
      degree: "Senior Secondary School Certificate (SSCE)",
      range: "2012 – 2018",
      location: null,
      description: null,
      order: 1,
    },
  ];

  for (const e of educations) {
    const existing = await prisma.education.findFirst({
      where: { school: e.school },
    });
    if (existing) {
      console.log(`[seed] Education exists: ${e.school}`);
    } else {
      await prisma.education.create({ data: e });
      console.log(`[seed] Education created: ${e.school}`);
    }
  }

  // ─── Certifications ───────────────────────────────────────────────────
  const certifications = [
    {
      name: "WordPress Developer",
      issuer: "Whogohost",
      year: "2023",
      credentialUrl: null,
      order: 0,
    },
    {
      name: "Website Developer",
      issuer: "ITF TVET Maximization Project",
      year: "2023",
      credentialUrl: null,
      order: 1,
    },
  ];

  for (const c of certifications) {
    const existing = await prisma.certification.findFirst({
      where: { name: c.name },
    });
    if (existing) {
      console.log(`[seed] Certification exists: ${c.name}`);
    } else {
      await prisma.certification.create({ data: c });
      console.log(`[seed] Certification created: ${c.name}`);
    }
  }

  console.log(`\n[seed] Done. Edit any of this from /admin/education or /admin/certifications.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
