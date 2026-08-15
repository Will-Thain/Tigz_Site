import { afterEach, describe, expect, it } from "vitest";
import { twitchEmbedSrc } from "./links";

describe("twitchEmbedSrc", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_HOST;
  });

  it("always includes parent=localhost and mutes the player", () => {
    const src = twitchEmbedSrc("tigz");
    expect(src).toContain("https://player.twitch.tv/?channel=tigz");
    expect(src).toContain("parent=localhost");
    expect(src).toContain("muted=true");
  });

  it("adds the configured site host as a parent without a scheme", () => {
    process.env.NEXT_PUBLIC_SITE_HOST = "tigz.example";
    const src = twitchEmbedSrc();
    expect(src).toContain("parent=tigz.example");
    expect(src).toContain("parent=www.tigz.example");
    expect(src).not.toContain("https://tigz.example");
  });

  it("strips a scheme if one is accidentally set on SITE_HOST", () => {
    process.env.NEXT_PUBLIC_SITE_HOST = "https://watch.tigz.example/path";
    const src = twitchEmbedSrc();
    expect(src).toContain("parent=watch.tigz.example");
    expect(src).not.toContain("parent=https");
  });
});
