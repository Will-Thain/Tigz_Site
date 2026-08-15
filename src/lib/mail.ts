import { LINKS } from "./links";

export type SponsorApplicationInput = {
  company: string;
  contact: string;
  email: string;
  campaignType: string;
  dates: string;
  message: string;
};

export function sponsorMailSubject(input: Pick<SponsorApplicationInput, "company" | "campaignType" | "dates">) {
  return `[Sponsor] ${input.company} — ${input.campaignType} — ${input.dates || "TBD"}`;
}

export function sponsorMailto(to: string, subject: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}

export async function sendSponsorApplication(input: SponsorApplicationInput) {
  const to = process.env.SPONSOR_TO ?? LINKS.talentEmail;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const subject = sponsorMailSubject(input);
  const mailto = sponsorMailto(to, subject);
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
    return { delivered: false as const, mailto };
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

  return { delivered: res.ok, mailto };
}
