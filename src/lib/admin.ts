import { cookies } from "next/headers";

export async function isAdmin() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return true;
  const jar = await cookies();
  return jar.get("tigz_admin")?.value === expected;
}
