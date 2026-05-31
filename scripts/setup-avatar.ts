import sharp from "sharp";
import { existsSync, unlinkSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const ROOT = process.cwd();
const SOURCE_CANDIDATES = [
  "public/_avatar-original.jpg",
  "public/_avatar-original.jpeg",
  "public/_avatar-original.png",
  "public/_avatar-original.webp",
];

async function main() {
  const sourceRel = SOURCE_CANDIDATES.find((p) => existsSync(path.join(ROOT, p)));
  if (!sourceRel) {
    console.error(
      `\n[avatar] No source image found.\n\n  Save your photo as ONE of:\n${SOURCE_CANDIDATES.map((p) => "    " + p).join("\n")}\n\n  Then re-run: npm run setup:avatar\n`
    );
    process.exit(1);
  }
  const sourceAbs = path.join(ROOT, sourceRel);
  console.log(`[avatar] Reading from ${sourceRel}`);

  const meta = await sharp(sourceAbs).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) throw new Error("Could not read source image dimensions.");
  console.log(`[avatar] Source dimensions: ${w}x${h}`);

  // ── Large avatar: top-cropped square, keeps head + chest ──────────────
  await sharp(sourceAbs)
    .resize({ width: 800, height: 800, fit: "cover", position: "top" })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(ROOT, "public/me.jpg"));
  console.log(`[avatar] Wrote public/me.jpg (800x800)`);

  // ── Tight face crop for favicon/icon ───────────────────────────────────
  // Heuristic for centered portrait: take a square = 50% of image width,
  // centered horizontally, starting ~8% from the top (skips the very top so
  // the face dominates the crop instead of the background above the head).
  const cropSize = Math.min(Math.floor(w * 0.55), w, h);
  const left = Math.max(0, Math.floor((w - cropSize) / 2));
  const top = Math.max(0, Math.min(h - cropSize, Math.floor(h * 0.06)));

  const tight = sharp(sourceAbs).extract({
    left,
    top,
    width: cropSize,
    height: cropSize,
  });
  console.log(`[avatar] Face crop: ${cropSize}x${cropSize} @ (${left}, ${top})`);

  await tight
    .clone()
    .resize(512, 512, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "app/icon.png"));
  console.log(`[avatar] Wrote app/icon.png (512x512)`);

  await tight
    .clone()
    .resize(180, 180, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "app/apple-icon.png"));
  console.log(`[avatar] Wrote app/apple-icon.png (180x180)`);

  // Remove the default favicon.ico so the new icon.png takes priority.
  const oldFavicon = path.join(ROOT, "app/favicon.ico");
  if (existsSync(oldFavicon)) {
    unlinkSync(oldFavicon);
    console.log(`[avatar] Removed default app/favicon.ico`);
  }

  // ── Update the Profile row in MongoDB ──────────────────────────────────
  const prisma = new PrismaClient();
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      console.warn(`[avatar] No Profile row found in DB — run \`npm run db:seed\` first.`);
    } else {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { avatarUrl: "/me.jpg" },
      });
      console.log(`[avatar] Profile.avatarUrl set to /me.jpg`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(
    `\n[avatar] Done. Refresh your dev server (the page revalidates the cached 'profile' tag automatically on next load).`
  );
  console.log(`[avatar] You can delete ${sourceRel} now if you want — it's no longer needed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
