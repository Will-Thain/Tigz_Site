import { ImageResponse } from "next/og";

export const alt = "Tigz — Tarkov hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0b0c09",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div style={{ color: "#9aaa6a", fontSize: 22, letterSpacing: 6 }}>TWITCH.TV/TIGZ</div>
        <div style={{ color: "#e8e0d0", fontSize: 84, fontWeight: 700, marginTop: 16 }}>The raid is on Twitch.</div>
        <div style={{ color: "#c4b79a", fontSize: 28, marginTop: 24 }}>Kit, quests, schedule, and polls live here.</div>
      </div>
    ),
    size,
  );
}
