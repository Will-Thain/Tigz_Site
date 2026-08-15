import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { publishKit } from "@/lib/kit-store";

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

  const items = Array.isArray(body.items) ? body.items : [];
  try {
    const kit = await publishKit({
      wipe: String(body.wipe ?? ""),
      title: String(body.title ?? ""),
      notes: String(body.notes ?? ""),
      vodUrl: typeof body.vodUrl === "string" ? body.vodUrl : "",
      items: items.map((row) => {
        const item = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        return {
          slot: String(item.slot ?? ""),
          itemId: String(item.itemId ?? ""),
          label: String(item.label ?? ""),
          detail: String(item.detail ?? ""),
        };
      }),
    });
    revalidatePath("/kit");
    revalidatePath("/kit/history");
    return NextResponse.json({ ok: true, id: kit.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not publish.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
