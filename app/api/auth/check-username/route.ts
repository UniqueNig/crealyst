import { NextResponse } from "next/server";
import { isUsernameAvailable, normalizeUsername, validateUsername } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("username") ?? "";
  const username = normalizeUsername(raw);

  if (!username) {
    return NextResponse.json({ available: false, reason: "Enter a username." });
  }

  const validation = validateUsername(username);
  if (!validation.ok) {
    return NextResponse.json({ available: false, reason: validation.reason });
  }

  const available = await isUsernameAvailable(username);
  return NextResponse.json(
    available
      ? { available: true }
      : { available: false, reason: "That username is taken." }
  );
}
