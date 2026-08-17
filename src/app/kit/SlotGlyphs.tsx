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
    <svg viewBox="0 0 200 520" className="eft-pmc" aria-hidden>
      <defs>
        <linearGradient id="pmc-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8d8d82" />
          <stop offset="1" stopColor="#5c5c54" />
        </linearGradient>
      </defs>
      <g fill="url(#pmc-fill)" stroke="#2a2a24" strokeWidth="1.2" strokeLinejoin="round">
        <ellipse cx="100" cy="42" rx="28" ry="32" />
        <path d="M78 68c8-4 36-4 44 0 8 2 18 8 22 16v18H56V84c4-8 14-14 22-16z" />
        <path d="M52 118c18-10 78-10 96 0 10 8 16 28 16 48v70H36v-70c0-20 6-40 16-48z" />
        <path d="M36 228h28v86c-10 8-22 28-24 48l-8 36 18 8 14-40c4-14 8-28 12-36V228zm100 0h28v94c4 8 8 22 12 36l14 40 18-8-8-36c-2-20-14-40-24-48V228z" />
        <path d="M64 236h72v70c0 16-12 28-24 32H88c-12-4-24-16-24-32z" />
        <path d="M72 338h24v150H72zm32 0h24v150H104z" />
        <path d="M68 478h32v28H68zm32 0h32v28h-32z" />
      </g>
      <g fill="none" stroke="#cfcab8" strokeWidth="1.1" opacity="0.35">
        <path d="M84 28h32" />
        <path d="M70 108h60" />
        <path d="M78 168h44" />
        <path d="M82 248h36" />
      </g>
    </svg>
  );
}
