import { Options } from "vis-network/standalone";

export const nodeGroups: Options["groups"] = {
  brand: { 
    shape: "dot",
    size: 10,
    borderWidth: 2,
    color: { background: "#141817", border: "#D1E8E2", highlight: { background: "#D1E8E2", border: "#FFFFFF" } },
    font: { color: "#D1E8E2", size: 16, face: "Outfit", weight: "800", align: "top" },
    shadow: { enabled: true, color: "rgba(209, 232, 226, 0.3)", size: 8 }
  },
  model: { 
    shape: "dot",
    size: 8,
    borderWidth: 2,
    color: { background: "#141817", border: "#116466", highlight: { background: "#116466", border: "#116466" } },
    font: { color: "#116466", size: 14, face: "Outfit", weight: "700", align: "top" },
    shadow: { enabled: true, color: "rgba(17, 100, 102, 0.2)", size: 6 }
  },
  variant: { 
    shape: "dot",
    size: 7,
    borderWidth: 1.5,
    color: { background: "#141817", border: "#116466", highlight: { background: "#116466", border: "#116466" } },
    font: { color: "#116466", size: 12, face: "Outfit", weight: "600", align: "top" }
  },
  vehicle: { 
    shape: "dot",
    size: 6,
    borderWidth: 1,
    color: { background: "#141817", border: "#116466", highlight: { background: "#116466", border: "#116466" } },
    font: { color: "#116466", size: 11, face: "Outfit", weight: "500", align: "top" }
  },
  engine: { 
    shape: "dot",
    size: 5,
    borderWidth: 1,
    color: { background: "#141817", border: "#D1E8E2" },
    font: { color: "#D1E8E2", size: 10, face: "Outfit", align: "bottom" }
  },
  transmission: { 
    shape: "dot",
    size: 5,
    borderWidth: 1,
    color: { background: "#141817", border: "#D1E8E2" },
    font: { color: "#D1E8E2", size: 10, face: "Outfit", align: "bottom" }
  },
  tech: { 
    shape: "dot",
    size: 5,
    borderWidth: 1,
    color: { background: "#141817", border: "#D1E8E2" },
    font: { color: "#D1E8E2", size: 10, face: "Outfit", align: "bottom" }
  }
};

export const defaultNodeOptions: Options["nodes"] = {
  shape: "dot",
  size: 25,
  font: {
    size: 14,
    color: "#ffffff",
    face: "Inter, sans-serif"
  },
  borderWidth: 2,
  shadow: {
    enabled: true,
    color: "rgba(0,0,0,0.5)",
    size: 10,
    x: 5,
    y: 5
  }
};
