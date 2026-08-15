import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static-cdn.jtvnw.net" },
      { protocol: "https", hostname: "clips-media-assets2.twitch.tv" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "assets.tarkov.dev" },
    ],
  },
};

export default nextConfig;
