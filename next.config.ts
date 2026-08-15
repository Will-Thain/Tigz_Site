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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value:
              "frame-src 'self' https://player.twitch.tv https://www.youtube.com https://clips.twitch.tv https://challenges.cloudflare.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
