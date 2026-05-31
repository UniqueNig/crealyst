/**
 * Generate QR codes for the portfolio URL.
 * Outputs:
 *   - public/qr-portfolio.svg  (vector — scales infinitely, ideal for print)
 *   - public/qr-portfolio.png  (1024×1024 raster — ideal for sharing online)
 *
 * Override the encoded URL by passing it as the first arg:
 *   npx tsx scripts/generate-qr.ts https://your-other-url.com
 */

import QRCode from "qrcode";
import { writeFileSync } from "fs";
import path from "path";

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://emmanuelfaniyi.vercel.app/";

async function main() {
  const url = process.argv[2] ?? DEFAULT_URL;
  const root = process.cwd();
  const svgPath = path.join(root, "public", "qr-portfolio.svg");
  const pngPath = path.join(root, "public", "qr-portfolio.png");

  // High error-correction so the code stays scannable even if you crop or add a
  // logo overlay later. Brand-blue foreground, white background.
  const opts: QRCode.QRCodeRenderersOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#2D5BFF",
      light: "#FFFFFF",
    },
  };

  const svg = await QRCode.toString(url, { ...opts, type: "svg" });
  writeFileSync(svgPath, svg, "utf-8");
  console.log(`[qr] Wrote ${path.relative(root, svgPath)} (vector)`);

  await QRCode.toFile(pngPath, url, { ...opts, width: 1024 });
  console.log(`[qr] Wrote ${path.relative(root, pngPath)} (1024×1024 PNG)`);

  console.log(`\n[qr] Encoded URL: ${url}`);
  console.log(`[qr] Both files are now in /public — drop them anywhere.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
