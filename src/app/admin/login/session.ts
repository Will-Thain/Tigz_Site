import { cookies } from "next/headers";

export async function tryAdminLogin(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return true;
  if (password !== expected) return false;
  const jar = await cookies();
  jar.set("tigz_admin", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}
