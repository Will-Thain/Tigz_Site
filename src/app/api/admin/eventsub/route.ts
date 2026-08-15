import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { subscribeToStreamEvents } from "@/lib/twitch-eventsub";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await subscribeToStreamEvents();
  const missing = Boolean(result.error?.toLowerCase().includes("missing"));
  return NextResponse.json(result, { status: result.ok ? 200 : missing ? 503 : 502 });
}
