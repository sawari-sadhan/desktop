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
  MADE_BY: { dashes: false, width: 0.8, color: "rgba(94, 234, 212, 0.2)" },
  VARIANT_OF: { dashes: [4, 2], width: 0.6, color: "rgba(245, 158, 11, 0.2)" },
  VERSION_OF: { dashes: [2, 2], width: 0.5, color: "rgba(236, 72, 153, 0.2)" },
  SUBSCRIBED_TO: { dashes: [10, 5], width: 0.4, color: "rgba(148, 163, 184, 0.15)" },
  COMPETES_WITH: { dashes: [8, 8], width: 0.5, color: "rgba(244, 63, 94, 0.1)" }
};

export const RELATIONSHIP_TYPES = {
  MADE_BY: "MADE_BY",
  VARIANT_OF: "VARIANT_OF",
  VERSION_OF: "VERSION_OF",
  SUBSCRIBED_TO: "SUBSCRIBED_TO",
  COMPETES_WITH: "COMPETES_WITH"
};
