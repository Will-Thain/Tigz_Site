import { describe, expect, it } from "vitest";
import { currentKit, EXAMPLE_KIT_ITEMS, KIT_SLOTS } from "./kits";

describe("example kit seed", () => {
  it("loads catalog item IDs on the current kit and does not claim a Tigz loadout", () => {
    const kit = currentKit();
    expect(kit.id).toBe("example-kit");
    expect(kit.isCurrent).toBe(true);
    expect(kit.title).toBe("Example kit");
    expect(kit.notes.toLowerCase()).toContain("not a tigz loadout");
    expect(kit.items.map((item) => item.slot)).toEqual([...KIT_SLOTS]);
    expect(kit.items).toEqual(EXAMPLE_KIT_ITEMS);
    expect(kit.items.every((item) => item.itemId.length > 0)).toBe(true);
  });
});
