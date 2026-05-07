import { Options } from "vis-network/standalone";

export const nodeGroups: Options["groups"] = {
  model: { 
    shape: "dot",
    size: 10,
    borderWidth: 2,
    color: { 
      background: "#0a0e14", 
      border: "#5EEAD4", 
      highlight: { background: "#0a0e14", border: "#5EEAD4" },
      hover: { background: "#116466", border: "#FFFFFF" }
    },
    font: { color: "#5EEAD4", size: 10, face: "JetBrains Mono, monospace", align: "right", hadjust: 10 },
    shadow: { enabled: true, color: "rgba(94, 234, 212, 0.2)", size: 15, x: 0, y: 0 }
  },
  variant: { 
    shape: "dot",
    size: 7,
    borderWidth: 1.5,
    color: { 
      background: "#0a0e14", 
      border: "#D9B08C", 
      highlight: { background: "#0a0e14", border: "#D9B08C" },
      hover: { background: "#141817", border: "#FFCB9A" }
    },
    font: { color: "#D9B08C", size: 9, face: "JetBrains Mono, monospace", align: "right", hadjust: 8 },
    shadow: { enabled: true, color: "rgba(217, 176, 140, 0.2)", size: 10, x: 0, y: 0 }
  },
  vehicle: { 
    shape: "dot",
    size: 5,
    borderWidth: 1,
    color: { 
      background: "#0a0e14", 
      border: "#D1E8E2",
      highlight: { background: "#0a0e14", border: "#D1E8E2" },
      hover: { background: "#116466", border: "#FFFFFF" }
    },
    font: { color: "#D1E8E2", size: 8, face: "JetBrains Mono, monospace", align: "right", hadjust: 6 }
  },
  engine: { 
    shape: "dot", size: 5, borderWidth: 1,
    color: { background: "#0a0e14", border: "#5EEAD4" },
    font: { color: "#5EEAD4", size: 8, face: "JetBrains Mono, monospace", align: "right", hadjust: 6 }
  },
  transmission: { 
    shape: "dot", size: 5, borderWidth: 1,
    color: { background: "#0a0e14", border: "#FFCB9A" },
    font: { color: "#FFCB9A", size: 8, face: "JetBrains Mono, monospace", align: "right", hadjust: 6 }
  },
  tech: { 
    shape: "dot", size: 5, borderWidth: 1,
    color: { background: "#0a0e14", border: "#D9B08C" },
    font: { color: "#D9B08C", size: 8, face: "JetBrains Mono, monospace", align: "right", hadjust: 6 }
  }
};

export const defaultNodeOptions: Options["nodes"] = {
  shape: "dot",
  size: 5,
  font: {
    size: 9,
    color: "#D1E8E2",
    face: "JetBrains Mono, monospace"
  },
  borderWidth: 2,
  shadow: {
    enabled: true,
    color: "rgba(94, 234, 212, 0.15)",
    size: 10,
    x: 0,
    y: 0
  }
};
