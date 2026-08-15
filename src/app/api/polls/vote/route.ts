import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { votePoll } from "@/app/api/polls/store";

function requestIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || undefined;
}

function voterKey(cookie: string, ip?: string) {
  return createHash("sha256").update(`${cookie}:${ip ?? ""}`).digest("hex");
}

export async function POST(req: Request) {
  const body = (await req.json()) as Record<string, unknown>;
  const pollId = String(body.pollId ?? "").trim();
  const optionId = String(body.optionId ?? "").trim();
  if (!pollId || !optionId) {
    return NextResponse.json({ ok: false, error: "Missing poll or option." }, { status: 400 });
  }

  const jar = await cookies();
  let voter = jar.get("tigz_voter")?.value;
  const issued = !voter;
  if (!voter) voter = randomUUID();

  const result = await votePoll(pollId, optionId, voterKey(voter, requestIp(req)));
  const status = result.ok ? 200 : result.error === "Already voted." ? 409 : 400;
  const res = NextResponse.json(result, { status });
  if (issued) {
    res.cookies.set("tigz_voter", voter, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
