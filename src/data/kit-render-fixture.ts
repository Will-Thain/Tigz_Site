import { EXAMPLE_KIT_ITEMS, type Kit } from "@/data/kits";

/**
 * Same catalog IDs as the public example kit, kept off isCurrent for /kit/render QA.
 * Icons hydrate from json.tarkov.dev. Not a Tigz loadout.
 */
export const KIT_RENDER_FIXTURE: Kit = {
  id: "render-fixture",
  wipe: "1.0",
  title: "Layout fixture",
  notes: "Catalog icons on the Totov plate so we can test asset rendering. Not a Tigz loadout.",
  isCurrent: false,
  publishedAt: "2026-08-18T00:00:00.000Z",
  publishedBy: "hub",
  items: EXAMPLE_KIT_ITEMS,
};
