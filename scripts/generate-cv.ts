/**
 * One-shot CLI to generate a CV PDF from a user's portfolio data.
 *
 *   npm run cv                       # uses NEXT_PUBLIC_TENANT_USERNAME from .env
 *   npm run cv -- --user emmanuel    # explicit username
 *
 * Output: <project-root>/<username>_CV.pdf
 *
 * The actual rendering lives in lib/cv-generator.ts so the web route at
 * /u/<username>/cv and this CLI share one source of truth.
 */

import { writeFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { generateCvBuffer } from "../lib/cv-generator";

const prisma = new PrismaClient();

function parseUsernameArg(): string | null {
  const idx = process.argv.indexOf("--user");
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

async function main() {
  const usernameArg =
    parseUsernameArg() ?? process.env.NEXT_PUBLIC_TENANT_USERNAME ?? null;

  if (!usernameArg) {
    throw new Error(
      "No username supplied. Pass --user <name> or set NEXT_PUBLIC_TENANT_USERNAME in .env"
    );
  }

  const user = await prisma.user.findUnique({
    where: { username: usernameArg },
    select: { id: true, username: true },
  });
  if (!user) throw new Error(`No user with username "${usernameArg}"`);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const buffer = await generateCvBuffer(user.id, siteUrl);

  const outPath = path.join(process.cwd(), `${user.username}_CV.pdf`);
  writeFileSync(outPath, buffer);

  console.log(`\n[cv] PDF written to: ${outPath}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
