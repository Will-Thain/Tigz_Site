import { afterEach, describe, expect, it } from "vitest";
import { siteHost, twitchEmbedParents, twitchEmbedSrc } from "./links";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_HOST;
});

describe("siteHost", () => {
  it("defaults to localhost when SITE_HOST is unset", () => {
    expect(siteHost()).toBe("localhost");
  });

  it("strips http and https schemes and any path", () => {
    process.env.NEXT_PUBLIC_SITE_HOST = "https://watch.tigz.example/path";
    expect(siteHost()).toBe("watch.tigz.example");
    process.env.NEXT_PUBLIC_SITE_HOST = "http://tigz.example/embed";
    expect(siteHost()).toBe("tigz.example");
  });

  it("falls back to localhost when the host is empty after stripping", () => {
    process.env.NEXT_PUBLIC_SITE_HOST = "https://";
    expect(siteHost()).toBe("localhost");
    process.env.NEXT_PUBLIC_SITE_HOST = "   ";
    expect(siteHost()).toBe("localhost");
  });
});

describe("twitchEmbedParents", () => {
  it("always includes localhost and never adds www.localhost", () => {
    expect(twitchEmbedParents("localhost")).toEqual(["localhost"]);
  });

  it("adds a www twin for a bare production host", () => {
    expect(twitchEmbedParents("tigz.example")).toEqual(["tigz.example", "localhost", "www.tigz.example"]);
  });

  it("adds the apex host when given a www host", () => {
    expect(twitchEmbedParents("www.tigz.example")).toEqual(["www.tigz.example", "localhost", "tigz.example"]);
  });
});

describe("twitchEmbedSrc", () => {
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
