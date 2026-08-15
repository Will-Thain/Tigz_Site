import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { loadSponsors, saveSponsors, type Sponsor } from "@/data/sponsors";

async function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function parseSponsor(body: Record<string, unknown>, existing?: Sponsor): Sponsor | null {
  const name = String(body.name ?? existing?.name ?? "").trim();
  const url = String(body.url ?? existing?.url ?? "").trim();
  if (!name || !url) return null;
  const requested = body.status;
  const status: Sponsor["status"] =
    requested === "past" || requested === "current" ? requested : (existing?.status ?? "current");
  const sortOrder = Number(body.sortOrder ?? existing?.sortOrder ?? 0);
  const id = existing?.id ?? (typeof body.id === "string" && body.id.trim() ? body.id.trim() : randomUUID());
  return {
    id,
    name,
    url,
    blurb: String(body.blurb ?? existing?.blurb ?? ""),
    status,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ sponsors: await loadSponsors() });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const row = parseSponsor((await req.json()) as Record<string, unknown>);
  if (!row) {
    return NextResponse.json({ ok: false, error: "Name and URL are required." }, { status: 400 });
  }
  const sponsors = await saveSponsors([...(await loadSponsors()), row]);
  return NextResponse.json({ ok: true, sponsors });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = (await req.json()) as Record<string, unknown>;
  const id = String(body.id ?? "").trim();
  const current = await loadSponsors();
  const existing = current.find((row) => row.id === id);
  if (!existing) return NextResponse.json({ ok: false, error: "Sponsor not found." }, { status: 404 });
  const row = parseSponsor(body, existing);
  if (!row) {
    return NextResponse.json({ ok: false, error: "Name and URL are required." }, { status: 400 });
  }
  const sponsors = await saveSponsors(current.map((item) => (item.id === id ? row : item)));
  return NextResponse.json({ ok: true, sponsors });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(req.url).searchParams.get("id")?.trim() ?? "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  const sponsors = await saveSponsors((await loadSponsors()).filter((row) => row.id !== id));
  return NextResponse.json({ ok: true, sponsors });
}
