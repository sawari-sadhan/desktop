import { Options } from "vis-network/standalone";

export const edgeOptions: Options["edges"] = {
  width: 1,
  color: {
    color: "rgba(17, 100, 102, 0.4)",
    highlight: "rgba(209, 232, 226, 0.8)",
    hover: "rgba(209, 232, 226, 0.6)"
  },
  font: {
    size: 0
  },
  arrows: {
    to: { enabled: false }
  },
  smooth: {
    enabled: true,
    type: "cubicBezier",
    forceDirection: "horizontal",
    roundness: 0.5
  }
};

// Standard Relationship Types (Matching guideline.yml)
export const RELATIONSHIP_TYPES = {
  VARIANT_OF: "VARIANT_OF",
  VERSION_OF: "VERSION_OF",
  POWERED_BY: "POWERED_BY",
  USES_TRANSMISSION: "USES_TRANSMISSION",
  EQUIPPED_WITH: "EQUIPPED_WITH",
  MANUFACTURED_BY: "MANUFACTURED_BY"
};
