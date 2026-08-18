import { describe, expect, it } from "vitest";
import { kits } from "@/data/kits";
import { KIT_RENDER_FIXTURE } from "./kit-render-fixture";

describe("kit render fixture", () => {
  it("keeps catalog asset IDs off the unpublished current kit", () => {
    expect(KIT_RENDER_FIXTURE.isCurrent).toBe(false);
    expect(kits.some((kit) => kit.id === KIT_RENDER_FIXTURE.id)).toBe(false);
    expect(KIT_RENDER_FIXTURE.items.every((item) => item.itemId.length > 0)).toBe(true);
    expect(KIT_RENDER_FIXTURE.notes.toLowerCase()).toContain("not a tigz loadout");
  });
});
