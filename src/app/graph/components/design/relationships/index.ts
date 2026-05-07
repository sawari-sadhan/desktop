import { Options } from "vis-network/standalone";

export const edgeOptions: Options["edges"] = {
  width: 0.5,
  hoverWidth: 3,
  selectionWidth: 3,
  color: {
    color: "rgba(94, 234, 212, 0)",
    highlight: "rgba(94, 234, 212, 0)",
    hover: "rgba(94, 234, 212, 0)"
  },
  arrows: {
    to: { enabled: true, scaleFactor: 0.2, type: "arrow" }
  },
  smooth: {
    enabled: true,
    type: "cubicBezier",
    roundness: 0.8
  },
  font: {
    size: 7,
    color: "rgba(209, 232, 226, 0.4)",
    face: "JetBrains Mono, monospace",
    align: "middle",
    strokeWidth: 0,
    background: "transparent"
  }
};

export const relationshipStyles: Record<string, any> = {
  MANUFACTURED_BY: { dashes: false, width: 0.8, color: "rgba(209, 232, 226, 0.2)" },
  VARIANT_OF: { dashes: [2, 2], width: 0.5 },
  EQUIPPED_WITH: { dashes: [4, 4], width: 0.5 },
  POWERED_BY: { dashes: [4, 4], width: 0.5 },
  COMPETES_WITH: { dashes: [8, 8], width: 0.5, color: "rgba(244, 63, 94, 0.1)" }
};

export const RELATIONSHIP_TYPES = {
  VARIANT_OF: "VARIANT_OF",
  VERSION_OF: "VERSION_OF",
  POWERED_BY: "POWERED_BY",
  USES_TRANSMISSION: "USES_TRANSMISSION",
  EQUIPPED_WITH: "EQUIPPED_WITH",
  MANUFACTURED_BY: "MANUFACTURED_BY"
};
