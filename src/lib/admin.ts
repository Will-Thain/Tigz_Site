import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";

function adminTwitchIds() {
  return (process.env.ADMIN_TWITCH_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function isAdmin() {
  const expected = process.env.ADMIN_PASSWORD;
  const jar = await cookies();

  if (expected && jar.get("tigz_admin")?.value === expected) {
    return true;
  }

  const allowlist = adminTwitchIds();
  if (allowlist.length) {
    const session = await getAuthSession();
    const twitchId = session?.twitchId;
    if (twitchId && allowlist.includes(twitchId)) return true;
  }

  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }

  return false;
}
