import type { MetadataRoute } from "next";

const PATHS = [
  "/",
  "/watch",
  "/kit",
  "/kit/history",
  "/progress",
  "/faq",
  "/polls",
  "/partners",
  "/partners/apply",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
