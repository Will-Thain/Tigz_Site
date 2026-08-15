import { LINKS } from "./links";

export async function sendSponsorApplication(input: {
  company: string;
  contact: string;
  email: string;
  campaignType: string;
  dates: string;
  message: string;
}) {
  const to = process.env.SPONSOR_TO ?? LINKS.talentEmail;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const subject = `[Sponsor] ${input.company} — ${input.campaignType} — ${input.dates || "TBD"}`;
  const text = [
    `Company: ${input.company}`,
    `Contact: ${input.contact}`,
    `Email: ${input.email}`,
    `Campaign: ${input.campaignType}`,
    `Dates: ${input.dates}`,
    "",
    input.message,
  ].join("\n");

  if (!key || !from) {
    return { delivered: false as const, mailto: `mailto:${to}?subject=${encodeURIComponent(subject)}` };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: input.email,
      subject,
      text,
    }),
  });

  return { delivered: res.ok, mailto: `mailto:${to}?subject=${encodeURIComponent(subject)}` };
}
