import { describe, expect, it } from "vitest";
import { kits } from "@/data/kits";
import { KIT_RENDER_FIXTURE } from "./kit-render-fixture";

describe("kit render fixture", () => {
  it("reuses the example catalog IDs without becoming the current kit record", () => {
    expect(KIT_RENDER_FIXTURE.isCurrent).toBe(false);
    expect(kits.some((kit) => kit.id === KIT_RENDER_FIXTURE.id)).toBe(false);
    expect(KIT_RENDER_FIXTURE.items).toEqual(kits[0]?.items);
    expect(KIT_RENDER_FIXTURE.notes.toLowerCase()).toContain("not a tigz loadout");
  });
});
