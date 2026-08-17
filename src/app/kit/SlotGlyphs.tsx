import type { ReactNode } from "react";
import type { KitSlot } from "@/data/kits";

function glyph(children: ReactNode, viewBox: string) {
  return (
    <svg viewBox={viewBox} className="eft-glyph" aria-hidden>
      {children}
    </svg>
  );
}

export function SlotGlyph({ slot }: { slot: KitSlot }) {
  switch (slot) {
    case "Primary":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
          <path d="M18 44h28l8-8h72l12 8H186" />
          <path d="M46 36h54v-8h18v8" />
          <rect x="70" y="44" width="14" height="22" />
          <path d="M18 44v14h16" />
          <path d="M158 36h22v8" />
        </g>,
        "0 0 200 80",
      );
    case "Secondary":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
          <path d="M24 46h40l6-10h50l10 10h46" />
          <path d="M70 36h36v-8h12v8" />
          <rect x="88" y="46" width="12" height="18" />
          <path d="M24 46v12h14" />
        </g>,
        "0 0 200 80",
      );
    case "Pistol":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M10 18h70l8 8H10z" />
          <path d="M18 26v14h10l4-8" />
          <path d="M62 18v-6h18" />
        </g>,
        "0 0 120 40",
      );
    case "Armor":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M18 22c8-12 38-12 46 0v42H18V22z" />
          <path d="M18 22 8 16M64 22l10-6" />
          <rect x="26" y="30" width="30" height="22" />
        </g>,
        "0 0 80 80",
      );
    case "Rig":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M16 18h68v44H16z" />
          <path d="M16 18 8 12M84 18l8-6" />
          <rect x="22" y="28" width="14" height="20" />
          <rect x="43" y="28" width="14" height="20" />
          <rect x="64" y="28" width="14" height="20" />
        </g>,
        "0 0 100 80",
      );
    case "Backpack":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round">
          <path d="M28 18h44v70H28z" />
          <path d="M28 18c0-10 44-10 44 0" />
          <path d="M22 30h6M72 30h6" />
          <path d="M36 40h28v18H36z" />
        </g>,
        "0 0 100 110",
      );
    case "Headset":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round">
          <path d="M16 40c0-18 12-30 24-30s24 12 24 30" />
          <rect x="10" y="36" width="12" height="22" rx="3" />
          <rect x="42" y="36" width="12" height="22" rx="3" />
        </g>,
        "0 0 64 64",
      );
    case "Ammo":
      return glyph(
        <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="14" y="18" width="36" height="28" />
          <path d="M20 18v-6h8v6M36 18v-6h8v6" />
        </g>,
        "0 0 64 64",
      );
    default:
      return null;
  }
}

export function PmcFigure() {
  return (
    <svg viewBox="0 0 120 260" className="eft-pmc" aria-hidden>
      <g fill="#2a2c24" stroke="#6a6a55" strokeWidth="1.6">
        <ellipse cx="60" cy="28" rx="16" ry="18" />
        <path d="M38 52h44c16 8 22 28 22 48v18H16V100c0-20 6-40 22-48z" />
        <path d="M16 118h20v86c0 8 6 14 14 14h6V132h24v86h6c8 0 14-6 14-14v-86h20" />
        <path d="M44 218h12v36H44zM64 218h12v36H64z" />
      </g>
      <g fill="none" stroke="#8f866f" strokeWidth="1.2" opacity="0.7">
        <path d="M48 20h24" />
        <path d="M36 72h48" />
        <path d="M44 108h32" />
      </g>
    </svg>
  );
}
