import { readStore, writeStore } from "@/lib/store";

export type Sponsor = {
  id: string;
  name: string;
  url: string;
  blurb: string;
  status: "current" | "past";
  sortOrder: number;
};

export const sponsors: Sponsor[] = [];

export const mediaKit = {
  followersApprox: "219K",
  cadence: "Most days, Tarkov / extraction shooters",
  language: "English",
  managedBy: "Mythic Talent",
  contact: "Tigz@mythictalent.com",
};

function normalizeSponsors(rows: Sponsor[]): Sponsor[] {
  return [...rows]
    .map((row) => {
      const status: Sponsor["status"] = row.status === "past" ? "past" : "current";
      return {
        ...row,
        blurb: row.blurb ?? "",
        status,
        sortOrder: row.sortOrder ?? 0,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function loadSponsors(): Promise<Sponsor[]> {
  return normalizeSponsors(await readStore<Sponsor[]>("sponsors", sponsors));
}

export async function saveSponsors(rows: Sponsor[]): Promise<Sponsor[]> {
  const next = normalizeSponsors(rows);
  await writeStore("sponsors", next);
  return next;
}
