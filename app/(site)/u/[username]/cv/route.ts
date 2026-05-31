import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/data/user";
import { generateCvBuffer } from "@/lib/cv-generator";

// pdfkit pulls in Node-only deps (fs, etc.) — force Node runtime so the route
// doesn't try to deploy to edge.
export const runtime = "nodejs";

/**
 * GET /u/<username>/cv
 * Streams a freshly generated CV PDF built from the user's portfolio data.
 * Public — any visitor can download any user's CV (these are public profiles).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) {
    return new NextResponse("Not found", { status: 404 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let buffer: Buffer;
  try {
    buffer = await generateCvBuffer(user.id, siteUrl);
  } catch (e) {
    console.error("[cv] generation failed", { username, error: e });
    return new NextResponse("Failed to generate CV", { status: 500 });
  }

  // Filename: <username>_CV.pdf — keeps it predictable for recruiters.
  const filename = `${username}_CV.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Generated content can be cached briefly so repeated downloads from
      // the same visitor are fast, but short enough that edits land quickly.
      "Cache-Control": "private, max-age=60",
    },
  });
}
