import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { closePoll, createPoll, loadPolls } from "@/app/api/polls/store";

async function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ polls: await loadPolls() });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = (await req.json()) as Record<string, unknown>;
  const question = String(body.question ?? "").trim();
  const rawOptions = Array.isArray(body.options)
    ? body.options.map((opt) => String(opt).trim()).filter(Boolean)
    : String(body.options ?? "")
        .split("\n")
        .map((opt) => opt.trim())
        .filter(Boolean);
  if (!question || rawOptions.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Question and at least two options are required." },
      { status: 400 },
    );
  }

  let closesAt = String(body.closesAt ?? "").trim();
  if (closesAt) {
    const parsed = new Date(closesAt);
    closesAt = Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }
  if (!closesAt) {
    closesAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const poll = await createPoll({ question, closesAt, options: rawOptions });
  return NextResponse.json({ ok: true, poll, polls: await loadPolls() });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = (await req.json()) as Record<string, unknown>;
  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "Missing poll id." }, { status: 400 });
  const polls = await closePoll(id);
  return NextResponse.json({ ok: true, polls });
}
