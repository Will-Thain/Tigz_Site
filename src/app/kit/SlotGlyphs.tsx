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
        <g transform="translate(80 32) rotate(-32)">
          <path
            d="M-70 4h38l8-10h22l6 10h36l12 6v8h-18l-8 10H-28v-8h-14zM-20-12h22v10h-22z"
            {...fill}
          />
        </g>,
        "0 0 160 64",
      );
    case "Secondary":
      return glyph(
        <g transform="translate(80 32) rotate(-32)">
          <path
            d="M-66 6h34l6-8h20l6 8h32l14 6v8H-20l-8 8h-18v-6h-12z"
            {...fill}
          />
        </g>,
        "0 0 160 64",
      );
    case "Pistol":
      return glyph(
        <path d="M8 20h52l4-4h10v6l-8 4v6H54l-4 16H38l-4-16H20V32H8z" {...fill} />,
        "0 0 80 48",
      );
    case "Armor":
      return glyph(
        <path d="M18 16c10-10 34-10 44 0l8-6 2 10c0 30-12 44-32 48C20 64 8 50 8 20l2-10z" {...fill} />,
        "0 0 80 80",
      );
    case "Rig":
      return glyph(
        <path
          d="M14 12h52v8H14zm0 12h16v36H14zm18 0h16v36H32zm18 0h16v36H50zM18 20l-8-8M62 20l8-8"
          {...fill}
        />,
        "0 0 80 80",
      );
    case "Backpack":
      return glyph(
        <path d="M26 16c0-10 28-10 28 0v2h10v52H16V18h10zm-10 14h-8v22h8m40 0h8V30h-8M30 28h20v16H30z" {...fill} />,
        "0 0 80 80",
      );
    case "Headset":
      return glyph(
        <path d="M14 42c0-18 12-30 26-30s26 12 26 30h-8c0-13-8-22-18-22S22 29 22 42H14zm-6-2h14v24H8zm50 0h14v24H64z" {...fill} />,
        "0 0 80 80",
      );
    case "Ammo":
      return glyph(<path d="M18 22h12v36H18zm16-8h12v44H34zm16 8h12v36H50z" {...fill} />, "0 0 80 80");
    case "Headwear":
      return glyph(
        <path d="M12 40c2-20 16-32 28-32s26 12 28 32H12zm10 4h36l-4 12H26z" {...fill} />,
        "0 0 80 80",
      );
    case "FaceCover":
      return glyph(
        <path d="M18 20h44v12c0 24-10 36-22 40-12-4-22-16-22-40zm10 14h8v10h-8zm16 0h8v10h-8z" {...fill} />,
        "0 0 80 80",
      );
    case "Armband":
      return glyph(<path d="M16 18h48v14H16zm8 18h32v28H24z" {...fill} />, "0 0 80 80");
    case "Eyewear":
      return glyph(
        <path d="M8 32h18l6 12h16l6-12h18v8H64L56 56H24L16 40H8z" {...fill} />,
        "0 0 80 80",
      );
    case "Sheath":
      return glyph(<path d="M38 8l10 8-20 48H14L38 8zm-6 56h22v10H32z" {...fill} />, "0 0 80 80");
    case "Pouch":
      return glyph(<path d="M20 24h40v6l6 8v28H14V38l6-8zm10-10h20v10H30z" {...fill} />, "0 0 80 80");
    case "Pockets":
      return glyph(
        <path d="M12 12h24v24H12zm32 0h24v24H44zM12 44h24v24H12zm32 0h24v24H44z" fill="none" stroke="currentColor" strokeWidth="4" />,
        "0 0 80 80",
      );
    case "Special":
      return glyph(
        <text x="40" y="48" textAnchor="middle" fontSize="20" fontFamily="ui-monospace, monospace" {...fill}>
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
    <svg viewBox="0 0 200 540" className="eft-pmc" aria-hidden>
      <g fill="#8a8a82">
        <ellipse cx="100" cy="44" rx="26" ry="30" />
        <path d="M82 72c12-6 24-6 36 0 14 8 24 22 28 40v22H54V112c4-18 14-32 28-40z" />
        <path d="M46 148c20-14 88-14 108 0 12 8 20 32 20 56v78H26v-78c0-24 8-48 20-56z" />
        <path d="M26 276h24v92c-12 10-22 32-26 58l-6 36 18 6 12-40c4-16 10-30 14-40V276zm124 0h24v92c4 10 10 24 14 40l12 40 18-6-6-36c-4-26-14-48-26-58V276z" />
        <path d="M50 276h100v64c0 18-14 30-28 34H78c-14-4-28-16-28-34z" />
        <path d="M62 340h28v168H62zm48 0h28v168h-28z" />
        <path d="M58 498h36v28H58zm48 0h36v28h-36z" />
      </g>
    </svg>
  );
}
