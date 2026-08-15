import { timingSafeEqual } from "@/lib/twitch-eventsub";

export function eventSubSetupTokenMatches(req: Request, url: URL) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7) : "";
  const token = bearer || url.searchParams.get("token") || "";
  return timingSafeEqual(expected, token);
}
