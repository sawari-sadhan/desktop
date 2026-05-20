import { Options } from "vis-network/standalone";

export const nodeGroups: Options["groups"] = {
  brand: { 
    shape: "dot", size: 15, borderWidth: 3,
    color: { background: "#0a0e14", border: "#5EEAD4" },
    font: { color: "#5EEAD4", size: 11, face: "Josefin Sans, sans-serif" },
    shadow: { enabled: true, color: "rgba(94, 234, 212, 0.3)", size: 20 }
  },
  model: { 
    shape: "dot", size: 10, borderWidth: 2,
    color: { background: "#0a0e14", border: "#2DD4BF" },
    font: { color: "#2DD4BF", size: 11, face: "Josefin Sans, sans-serif" },
    shadow: { enabled: true, color: "rgba(45, 212, 191, 0.2)", size: 15 }
  },
  variant: { 
    shape: "dot", size: 7, borderWidth: 1.5,
    color: { background: "#0a0e14", border: "#F59E0B" },
    font: { color: "#F59E0B", size: 11, face: "Josefin Sans, sans-serif" },
    shadow: { enabled: true, color: "rgba(245, 158, 11, 0.2)", size: 10 }
  },
  release: { 
    shape: "dot", size: 5, borderWidth: 1,
    color: { background: "#0a0e14", border: "#EC4899" },
    font: { color: "#EC4899", size: 11, face: "Josefin Sans, sans-serif" },
    shadow: { enabled: true, color: "rgba(236, 72, 153, 0.2)", size: 10 }
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
    font: { color: "#D1E8E2", size: 11, face: "Josefin Sans, sans-serif", align: "right", hadjust: 6 }
  },
  engine: { 
    shape: "dot", size: 5, borderWidth: 1,
    color: { background: "#0a0e14", border: "#5EEAD4" },
    font: { color: "#5EEAD4", size: 11, face: "Josefin Sans, sans-serif", align: "right", hadjust: 6 }
  },
  transmission: { 
    shape: "dot", size: 5, borderWidth: 1,
    color: { background: "#0a0e14", border: "#FFCB9A" },
    font: { color: "#FFCB9A", size: 11, face: "Josefin Sans, sans-serif", align: "right", hadjust: 6 }
  },
  tech: { 
    shape: "dot", size: 5, borderWidth: 1,
    color: { background: "#0a0e14", border: "#D9B08C" },
    font: { color: "#D9B08C", size: 11, face: "Josefin Sans, sans-serif", align: "right", hadjust: 6 }
  }
};

export const defaultNodeOptions: Options["nodes"] = {
  shape: "dot",
  size: 5,
  font: {
    size: 11,
    color: "#D1E8E2",
    face: "Josefin Sans, sans-serif"
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
