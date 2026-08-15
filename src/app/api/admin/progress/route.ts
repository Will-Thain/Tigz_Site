import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { saveProgress } from "@/lib/tarkov";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "set ADMIN_PASSWORD and log in at /admin" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const stats = await saveProgress({
    pmcLevel: String(body.pmcLevel ?? ""),
    pmcKd: String(body.pmcKd ?? ""),
    scavKd: String(body.scavKd ?? ""),
    survival: String(body.survival ?? ""),
    hideoutNotes: String(body.hideoutNotes ?? ""),
    questNotes: String(body.questNotes ?? ""),
    updatedAt: new Date().toISOString(),
    source: "admin",
  });
  revalidatePath("/progress");
  return NextResponse.json({ ok: true, updatedAt: stats.updatedAt });
}
