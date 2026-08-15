import { NextResponse } from "next/server";
import { tryAdminLogin } from "@/app/admin/login/session";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let password = "";
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { password?: unknown };
    password = String(body.password ?? "");
  } else {
    const form = await req.formData();
    password = String(form.get("password") ?? "");
  }

  const ok = await tryAdminLogin(password);
  if (contentType.includes("application/json")) {
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid password." }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), 303);
  }
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
