import { describe, expect, it } from "vitest";
import { FAQ_CATEGORIES, faqs } from "./faqs";

describe("FAQ seed", () => {
  it("covers every public category from the hub plan", () => {
    const present = new Set(faqs.map((faq) => faq.category));
    expect([...FAQ_CATEGORIES].every((category) => present.has(category))).toBe(true);
  });

  it("says kit is published here, not pulled from the game", () => {
    const kit = faqs.find((faq) => faq.id === "kit");
    expect(kit?.answer).toMatch(/not pulled from the game/i);
  });

  it("keeps Twitch as the primary channel", () => {
    const kick = faqs.find((faq) => faq.id === "kick");
    expect(kick?.answer).toMatch(/Twitch is the main channel/);
  });

  it("does not invent sensitivity numbers", () => {
    const sens = faqs.find((faq) => faq.id === "sens");
    expect(sens?.answer).toMatch(/will not invent numbers/i);
  });
});
