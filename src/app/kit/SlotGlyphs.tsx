import type { ReactNode } from "react";
import type { SilhouetteGlyph } from "@/lib/kit-display";

function glyph(children: ReactNode, viewBox: string) {
  return (
    <svg viewBox={viewBox} className="eft-glyph" aria-hidden>
      {children}
    </svg>
  );
}

const fill = { fill: "currentColor" };

export function SlotGlyph({ slot }: { slot: SilhouetteGlyph }) {
  switch (slot) {
    case "Primary":
      return glyph(
        <>
          <text x="6" y="22" fontSize="18" fontFamily="ui-monospace, monospace" {...fill}>
            1
          </text>
          <path
            d="M18 52l10-8h22l6-8h28l8 8h36l14 8v6H28zM40 44v-8h16v8M92 36h18v8"
            {...fill}
          />
        </>,
        "0 0 160 64",
      );
    case "Secondary":
      return glyph(
        <>
          <text x="6" y="22" fontSize="18" fontFamily="ui-monospace, monospace" {...fill}>
            2
          </text>
          <path d="M22 50l8-10h18l6-8h24l8 8h32l12 10v6H30z" {...fill} />
        </>,
        "0 0 160 64",
      );
    case "Pistol":
      return glyph(<path d="M8 18h54l10 10H18v16h12l6-8h8V28H8z" {...fill} />, "0 0 80 48");
    case "Armor":
      return glyph(
        <path d="M22 14c8-8 28-8 36 0l8-4v8c0 28-10 40-26 44C24 54 14 42 14 18v-8z" {...fill} />,
        "0 0 80 80",
      );
    case "Rig":
      return glyph(
        <path d="M16 16h48v10H16zm0 14h14v28H16zm17 0h14v28H33zm17 0h14v28H50z" {...fill} />,
        "0 0 80 80",
      );
    case "Backpack":
      return glyph(
        <path d="M28 18c0-8 24-8 24 0v4h8v48H20V22h8zm-8 10h-6v16h6m40 0h6V28h-6" {...fill} />,
        "0 0 80 80",
      );
    case "Headset":
      return glyph(
        <path d="M16 40c0-16 10-28 24-28s24 12 24 28h-8c0-12-6-20-16-20S24 28 24 40H16zm-4-2h12v22H12zm40 0h12v22H52z" {...fill} />,
        "0 0 80 80",
      );
    case "Ammo":
      return glyph(<path d="M18 22h12v36H18zm16-8h12v44H34zm16 8h12v36H50z" {...fill} />, "0 0 80 80");
    case "Headwear":
      return glyph(
        <path d="M14 38c2-18 14-28 26-28s24 10 26 28H14zm8 4h36v8l-6 8H28l-6-8z" {...fill} />,
        "0 0 80 80",
      );
    case "FaceCover":
      return glyph(
        <path d="M20 22h40v10c0 22-8 34-20 38-12-4-20-16-20-38zm8 14h8v8h-8zm16 0h8v8h-8z" {...fill} />,
        "0 0 80 80",
      );
    case "Armband":
      return glyph(<path d="M18 18h44v12H18zm6 16h32v28H24z" {...fill} />, "0 0 80 80");
    case "Eyewear":
      return glyph(
        <path d="M10 34h16l4 8h20l4-8h16v8H58l-6 12H28L22 42H10z" {...fill} />,
        "0 0 80 80",
      );
    case "Sheath":
      return glyph(<path d="M36 10l8 6-18 44H16L36 10zm-4 52h16v8H32z" {...fill} />, "0 0 80 80");
    case "Pouch":
      return glyph(<path d="M22 22h36v8l4 6v28H18V36l4-6zm8 0v-8h20v8" {...fill} />, "0 0 80 80");
    case "Pockets":
      return glyph(
        <path d="M14 14h20v20H14zm32 0h20v20H46zM14 46h20v20H14zm32 0h20v20H46z" {...fill} />,
        "0 0 80 80",
      );
    case "Special":
      return glyph(
        <text x="40" y="48" textAnchor="middle" fontSize="22" fontFamily="ui-monospace, monospace" {...fill}>
          SPEC
        </text>,
        "0 0 80 80",
      );
    default:
      return null;
  }
}

export function PmcFigure() {
  return (
    <svg viewBox="0 0 220 560" className="eft-pmc" aria-hidden>
      <g fill="#9a9a90" stroke="none">
        <ellipse cx="110" cy="48" rx="32" ry="36" />
        <path d="M78 78c10-8 54-8 64 0 16 10 28 28 32 48 2 12 2 22-6 28H52c-8-6-8-16-6-28 4-20 16-38 32-48z" />
        <path d="M48 154c22-16 102-16 124 0 14 10 22 38 22 64v92H26v-92c0-26 8-54 22-64z" />
        <path d="M26 300c8 8 18 14 28 16v88c-16 12-30 40-34 70l-8 42 22 6 16-48c6-18 12-34 18-44V316h8v196h36V316h8v196h36V316h8c6 10 12 26 18 44l16 48 22-6-8-42c-4-30-18-58-34-70v-88c10-2 20-8 28-16H26z" />
      </g>
    </svg>
  );
}
