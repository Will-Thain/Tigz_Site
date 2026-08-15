import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { FAQ_CATEGORIES, isFaqCategory, loadFaqs, saveFaqs, type Faq } from "@/data/faqs";

async function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function parseFaq(body: Record<string, unknown>, existing?: Faq): Faq | null {
  const question = String(body.question ?? existing?.question ?? "").trim();
  const answer = String(body.answer ?? existing?.answer ?? "").trim();
  if (!question || !answer) return null;
  const rawCategory = String(body.category ?? existing?.category ?? "Community");
  const category = isFaqCategory(rawCategory) ? rawCategory : (existing?.category ?? "Community");
  const id = existing?.id ?? (typeof body.id === "string" && body.id.trim() ? body.id.trim() : randomUUID());
  return { id, question, answer, category };
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ faqs: await loadFaqs(), categories: FAQ_CATEGORIES });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const row = parseFaq((await req.json()) as Record<string, unknown>);
  if (!row) {
    return NextResponse.json({ ok: false, error: "Question and answer are required." }, { status: 400 });
  }
  const faqs = await saveFaqs([...(await loadFaqs()), row]);
  return NextResponse.json({ ok: true, faqs });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = (await req.json()) as Record<string, unknown>;
  const id = String(body.id ?? "").trim();
  const current = await loadFaqs();
  const existing = current.find((row) => row.id === id);
  if (!existing) return NextResponse.json({ ok: false, error: "FAQ not found." }, { status: 404 });
  const row = parseFaq(body, existing);
  if (!row) {
    return NextResponse.json({ ok: false, error: "Question and answer are required." }, { status: 400 });
  }
  const faqs = await saveFaqs(current.map((item) => (item.id === id ? row : item)));
  return NextResponse.json({ ok: true, faqs });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(req.url).searchParams.get("id")?.trim() ?? "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  const faqs = await saveFaqs((await loadFaqs()).filter((row) => row.id !== id));
  return NextResponse.json({ ok: true, faqs });
}
