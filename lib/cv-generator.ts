import "server-only";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import type { SkillCategory } from "@prisma/client";

// Default brand colors — overridden per user via theme accent.
const DEFAULT_BRAND = "#2D5BFF";
const INK = "#0A0A0B";
const MUTED = "#54545B";
const RULE = "#D5D5DA";

const CATEGORY_LABEL: Record<SkillCategory, string> = {
  LANGUAGE: "Languages",
  FRAMEWORK: "Frameworks & Libraries",
  DATABASE: "Databases & Backend",
  TOOL: "Tools & CMS",
  DESIGN: "Design",
  MARKETING: "Marketing",
  ANALYTICS: "Analytics & Data",
  PRODUCTIVITY: "Productivity",
  OTHER: "Other",
};

const CATEGORY_ORDER: SkillCategory[] = [
  "LANGUAGE",
  "FRAMEWORK",
  "DATABASE",
  "TOOL",
  "DESIGN",
  "MARKETING",
  "ANALYTICS",
  "PRODUCTIVITY",
  "OTHER",
];

function fmtMonthYear(d: Date | null): string {
  if (!d) return "Present";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

import { resolveTheme } from "@/lib/themes";

/**
 * Render a polished PDF CV from the user's portfolio content. Returns a Buffer
 * the caller can stream as a download response. All data is scoped to the
 * provided userId so this works for any tenant on the SaaS.
 */
export async function generateCvBuffer(
  userId: string,
  siteUrl: string
): Promise<Buffer> {
  const [user, profile, skills, experience, projects, education, certifications] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      }),
      prisma.profile.findFirst({ where: { userId } }),
      prisma.skill.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
      prisma.experience.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { startDate: "desc" }],
      }),
      prisma.project.findMany({
        where: { userId, published: true },
        orderBy: [{ order: "asc" }, { year: "desc" }],
      }),
      prisma.education.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.certification.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    ]);

  if (!user || !profile) {
    throw new Error("Profile not found for user");
  }

  // Brand color matches the user's chosen portfolio theme so the CV feels
  // visually connected to their site.
  const theme = resolveTheme(profile.accent);
  const BRAND = theme?.scale[500] ?? DEFAULT_BRAND;
  const portfolioUrl = `${siteUrl.replace(/\/$/, "")}/u/${user.username}`;

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `${profile.name} — CV`,
      Author: profile.name,
      Subject: profile.title,
    },
  });

  // Collect chunks into a buffer so callers can stream the result.
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  // ─── Header ───────────────────────────────────────────────────────────
  doc
    .fillColor(INK)
    .font("Helvetica-Bold")
    .fontSize(26)
    .text(profile.name.toUpperCase(), { align: "center", characterSpacing: 1 });

  doc
    .moveDown(0.2)
    .fillColor(BRAND)
    .font("Helvetica")
    .fontSize(12)
    .text(profile.title, { align: "center" });

  if (profile.location) {
    doc
      .moveDown(0.4)
      .fillColor(MUTED)
      .fontSize(10)
      .text(profile.location, { align: "center" });
  }

  doc
    .moveDown(0.3)
    .fillColor(MUTED)
    .fontSize(10)
    .text(profile.email, { align: "center" });

  // Links line — portfolio always present, social links only if set.
  doc.moveDown(0.4);
  const links = [
    { label: "Portfolio", url: portfolioUrl },
    profile.linkedin && { label: "LinkedIn", url: profile.linkedin },
    profile.github && { label: "GitHub", url: profile.github },
  ].filter(Boolean) as { label: string; url: string }[];

  const linksText = links.map((l) => `${l.label}: ${l.url}`).join("   |   ");
  doc.fillColor(MUTED).fontSize(9).text(linksText, { align: "center" });

  // ─── Section helpers ──────────────────────────────────────────────────
  function rule() {
    doc
      .moveDown(0.6)
      .strokeColor(RULE)
      .lineWidth(0.5)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke()
      .moveDown(0.6);
  }

  function sectionTitle(label: string) {
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(label.toUpperCase(), { characterSpacing: 1.5 });
    doc.moveDown(0.4);
  }

  function bullet(text: string) {
    const startX = doc.page.margins.left + 12;
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(10)
      .text("•", doc.page.margins.left + 2, doc.y, { continued: false });
    doc.moveUp(1);
    doc
      .fillColor(INK)
      .text(text, startX, doc.y, {
        width:
          doc.page.width -
          doc.page.margins.left -
          doc.page.margins.right -
          12,
        align: "left",
      });
    doc.moveDown(0.15);
  }

  function paragraph(text: string) {
    doc
      .fillColor(INK)
      .font("Helvetica")
      .fontSize(10)
      .text(text, { align: "left", lineGap: 2 });
  }

  // ─── Professional Summary ─────────────────────────────────────────────
  if (profile.bio.trim()) {
    rule();
    sectionTitle("Professional Summary");
    paragraph(profile.bio);
  }

  // ─── Core Technical Skills ────────────────────────────────────────────
  if (skills.length > 0) {
    rule();
    sectionTitle("Core Skills");

    const skillsByCategory = new Map<SkillCategory, string[]>();
    for (const s of skills) {
      if (!skillsByCategory.has(s.category)) skillsByCategory.set(s.category, []);
      skillsByCategory.get(s.category)!.push(s.name);
    }
    for (const cat of CATEGORY_ORDER) {
      const items = skillsByCategory.get(cat);
      if (!items || items.length === 0) continue;
      const startX = doc.page.margins.left + 12;
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(10)
        .text("•", doc.page.margins.left + 2, doc.y, { continued: false });
      doc.moveUp(1);
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .text(`${CATEGORY_LABEL[cat]}: `, startX, doc.y, {
          continued: true,
          width:
            doc.page.width -
            doc.page.margins.left -
            doc.page.margins.right -
            12,
        })
        .font("Helvetica")
        .text(items.join(", "), { width: undefined });
      doc.moveDown(0.15);
    }
  }

  // ─── Professional Experience ──────────────────────────────────────────
  if (experience.length > 0) {
    rule();
    sectionTitle("Professional Experience");

    for (const exp of experience) {
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(exp.role);

      const range = `${fmtMonthYear(exp.startDate)} – ${fmtMonthYear(exp.endDate)}`;
      doc
        .moveDown(0.1)
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(10)
        .text(
          `${exp.company}${exp.location ? ` (${exp.location})` : ""}  ||  ${range}`
        );

      doc.moveDown(0.3);
      if (exp.description) {
        doc.fillColor(INK).fontSize(10).text(exp.description);
        doc.moveDown(0.2);
      }
      for (const b of exp.bullets) bullet(b);
      doc.moveDown(0.5);
    }
  }

  // ─── Key Projects ─────────────────────────────────────────────────────
  if (projects.length > 0) {
    rule();
    sectionTitle("Key Projects");

    for (const p of projects) {
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(p.title);

      if (p.techStack.length > 0) {
        doc
          .moveDown(0.1)
          .fillColor(MUTED)
          .font("Helvetica-Oblique")
          .fontSize(9)
          .text(`Technologies: ${p.techStack.join(", ")}`);
      }

      if (p.liveUrl) {
        doc
          .moveDown(0.1)
          .fillColor(BRAND)
          .font("Helvetica")
          .fontSize(9)
          .text(`Live Demo: ${p.liveUrl}`);
      }

      doc.moveDown(0.3);
      bullet(p.description);
      doc.moveDown(0.4);
    }
  }

  // ─── Education ────────────────────────────────────────────────────────
  if (education.length > 0) {
    rule();
    sectionTitle("Education");
    for (const e of education) {
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(e.school, { continued: true })
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(10)
        .text(`  ||  ${e.range}`);
      doc.moveDown(0.1).fillColor(INK).fontSize(10).text(e.degree);
      if (e.location) {
        doc.moveDown(0.05).fillColor(MUTED).fontSize(9).text(e.location);
      }
      if (e.description) {
        doc.moveDown(0.1).fillColor(INK).fontSize(10).text(e.description);
      }
      doc.moveDown(0.4);
    }
  }

  // ─── Certifications ───────────────────────────────────────────────────
  if (certifications.length > 0) {
    rule();
    sectionTitle("Certifications");
    for (const c of certifications) {
      bullet(`${c.name}  ||  ${c.issuer}  ||  ${c.year}`);
    }
  }

  // ─── References ───────────────────────────────────────────────────────
  rule();
  sectionTitle("References");
  paragraph("Available upon request.");

  doc.end();
  return done;
}
