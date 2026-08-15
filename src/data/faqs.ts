import { readStore, writeStore } from "@/lib/store";

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: "Stream" | "Tarkov" | "Community" | "Support";
};

export const FAQ_CATEGORIES: Faq["category"][] = ["Stream", "Tarkov", "Community", "Support"];

export const faqs: Faq[] = [
  {
    id: "when-live",
    category: "Stream",
    question: "When does Tigz go live?",
    answer:
      "He streams Tarkov most days. Check the schedule on this site or twitch.tv/tigz. If the red LIVE pill is on, he is on right now.",
  },
  {
    id: "vods",
    category: "Stream",
    question: "Where are the VODs?",
    answer:
      "Twitch keeps recent broadcasts on twitch.tv/tigz/videos. Edited raids and highlights go to youtube.com/@tigztwitch.",
  },
  {
    id: "kick",
    category: "Stream",
    question: "Does he stream on Kick?",
    answer: "Twitch is the main channel. Use this hub and twitch.tv/tigz first.",
  },
  {
    id: "kit",
    category: "Tarkov",
    question: "What kit is he running?",
    answer:
      "The /kit page is published by Tigz or a mod. It is not pulled from the game client. If the stamp is old, the kit on stream may have changed.",
  },
  {
    id: "ammo",
    category: "Tarkov",
    question: "What ammo is he using?",
    answer:
      "Ammo is listed on the current kit card when it has been published. Do not trust random chat copy-paste over that card.",
  },
  {
    id: "pve",
    category: "Tarkov",
    question: "Is this PvP or PvE?",
    answer:
      "Tigz is a PvP Tarkov streamer. If a wipe or mode change is relevant, it will be noted on /kit and /progress.",
  },
  {
    id: "discord",
    category: "Community",
    question: "Where is the Discord?",
    answer: "discord.gg/tigz — settings, LFG, and memes live there. This site does not replace it.",
  },
  {
    id: "sens",
    category: "Community",
    question: "What settings / sensitivity does he use?",
    answer: "Ask in Discord or wait for a settings FAQ update from a mod. We will not invent numbers.",
  },
  {
    id: "sub-tip",
    category: "Support",
    question: "How do I sub or tip?",
    answer:
      "Subscribe on Twitch. Tips go through streamelements.com/Tigz/tip. Do not send money through random chat links.",
  },
  {
    id: "sponsor",
    category: "Support",
    question: "How do brands get in touch?",
    answer:
      "Partnerships are managed by Mythic Talent. Use /partners/apply or email Tigz@mythictalent.com.",
  },
];

export function isFaqCategory(value: string): value is Faq["category"] {
  return (FAQ_CATEGORIES as string[]).includes(value);
}

export async function loadFaqs(): Promise<Faq[]> {
  return readStore<Faq[]>("faqs", faqs);
}

export async function saveFaqs(rows: Faq[]): Promise<Faq[]> {
  await writeStore("faqs", rows);
  return rows;
}
