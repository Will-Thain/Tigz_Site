import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sendSponsorApplication } from "@/lib/mail";
import { readStore, writeStore } from "@/lib/store";

type StoredApplication = {
  id: string;
  payload: {
    company: string;
    contact: string;
    email: string;
    campaignType: string;
    dates: string;
    message: string;
  };
  status: "new";
  emailedAt: string | null;
  createdAt: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Record<string, unknown>;
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const company = String(body.company ?? "").trim();
  const contact = String(body.contact ?? "").trim();
  const email = String(body.email ?? "").trim();
  const campaignType = String(body.campaignType ?? "Other");
  const dates = String(body.dates ?? "");
  const message = String(body.message ?? "").trim();

  if (!company || !contact || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const result = await sendSponsorApplication({
    company,
    contact,
    email,
    campaignType,
    dates,
    message,
  });

  const applications = await readStore<StoredApplication[]>("applications", []);
  await writeStore("applications", [
    ...applications,
    {
      id: randomUUID(),
      payload: { company, contact, email, campaignType, dates, message },
      status: "new",
      emailedAt: result.delivered ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    },
  ]);

  return NextResponse.json({
    ok: true,
    mailto: result.delivered ? undefined : result.mailto,
  });
}
