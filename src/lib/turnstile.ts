const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function isTurnstileMisconfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY) !== Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstileToken(
  token: unknown,
  options: { ip?: string; fetchImpl?: typeof fetch } = {},
): Promise<boolean> {
  if (isTurnstileMisconfigured()) return false;
  if (!isTurnstileEnabled()) return true;

  const value = typeof token === "string" ? token.trim() : "";
  if (!value) return false;

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY ?? "",
    response: value,
  });
  if (options.ip) body.set("remoteip", options.ip);

  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const res = await fetchImpl(SITEVERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
