"use client";

import React, { useEffect, useRef, useState } from "react";
import { Network, Options } from "vis-network/standalone";
import { DataSet } from "vis-data/standalone";
import { motion, AnimatePresence } from "framer-motion";
import { X, Database } from "lucide-react";
import { nodeGroups, defaultNodeOptions } from "../design/nodes";
import { edgeOptions, relationshipStyles } from "../design/relationships";
import SearchHUD from "../design/search";
import graphData from "../data/index.json";

const groupColors: Record<string, string> = {
  model: "#5EEAD4",
  variant: "#D9B08C",
  vehicle: "#5EEAD4",
  engine: "#5EEAD4",
  transmission: "#FFCB9A",
  tech: "#D9B08C"
};

const KnowledgeGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const networkRef = useRef<Network | null>(null);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<{ x: string; y: string; opacity: number }[]>([]);
  const [nebulae, setNebulae] = useState<{ x: string; y: string; scale: number; duration: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate starfield particles
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      opacity: Math.random() * 0.2
    }));
    setParticles(newParticles);

    // Generate abstract nebulae
    const newNebulae = [...Array(5)].map(() => ({
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      scale: 1 + Math.random(),
      duration: 30 + Math.random() * 20
    }));
    setNebulae(newNebulae);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, edges } = graphData;

    // Permanent Mesh: Lines are always visible, names manifest on hover
    const styledEdges = edges.map(edge => {
      const { color, ...restStyles } = relationshipStyles[edge.label] || {};
      return {
        ...edge,
        ...restStyles,
        label: "",
        hiddenLabel: edge.label.toUpperCase(),
        color: "rgba(94, 234, 212, 0.15)", // Always visible subtle hairline
        width: 0.5
      };
    });

    // Technical Uppercase Labels and Schema-Compliant Group Mapping
    const indexedNodes = nodes.map((node: any) => ({
      ...node,
      label: node.label.toUpperCase(),
      group: node.type // Map database 'type' to vis-network 'group' for styling
    }));

    const options: Options = {
      nodes: defaultNodeOptions,
      edges: edgeOptions,
      groups: nodeGroups,
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -4000,
          centralGravity: 0.7,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.12,
          avoidOverlap: 1
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        solver: "barnesHut",
        stabilization: { 
          enabled: true,
          iterations: 1500,
          updateInterval: 100
        }
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: false,
        selectConnectedEdges: false,
        tooltipDelay: 200,
        navigationButtons: false,
        keyboard: true
      }
    };

    const edgesDataSet = new DataSet(styledEdges);
    const nodesDataSet = new DataSet(indexedNodes);

    const data = {
      nodes: nodesDataSet,
      edges: edgesDataSet
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    const aggressiveClear = () => {
      const ids = edgesDataSet.getIds();
      if (ids.length > 0) {
        edgesDataSet.update(ids.map(id => ({ 
          id, 
          label: "", 
          font: { color: "rgba(0,0,0,0)", size: 1, strokeWidth: 0, background: "transparent" } 
        })));
        network.redraw();
      }
    };

    network.on("hoverEdge", (params) => {
      const edgeId = params.edge;
      const edge = edgesDataSet.get(edgeId) as any;
      if (edge) {
        aggressiveClear();
        edgesDataSet.update({ 
          id: edgeId, 
          label: edge.hiddenLabel || "",
          font: { color: "rgba(209, 232, 226, 0.9)", size: 7, strokeWidth: 0, background: "transparent" }
        });
      }
    });

    network.on("blurEdge", () => {
      aggressiveClear();
    });

    network.on("hoverNode", (params) => {
      aggressiveClear();
      const nodeId = params.node;
      const node = nodes.find((n) => n.id === nodeId);
      if (node) setSelectedNode(node);
    });

    network.on("blurNode", () => {
      aggressiveClear();
      if (network.getSelectedNodes().length === 0) {
        setSelectedNode(null);
      }
    });

    network.on("selectNode", (params) => {
      aggressiveClear();
      const nodeId = params.nodes[0];
      const node = nodes.find((n) => n.id === nodeId);
      if (node) setSelectedNode(node);
    });

    network.on("deselectNode", () => {
      aggressiveClear();
      setSelectedNode(null);
    });

    network.on("dragStart", aggressiveClear);
    network.on("zoom", aggressiveClear);
    network.on("dragEnd", aggressiveClear);

    return () => {
      network.destroy();
    };
  }, []);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    
    if (!networkRef.current) return;
    
    if (q.trim() === "") {
      networkRef.current.unselectAll();
      return;
    }

    const matches = graphData.nodes
      .filter(n => n.label.toLowerCase().includes(q))
      .map(n => n.id);

    if (matches.length > 0) {
      networkRef.current.selectNodes(matches);
      if (matches.length === 1) {
        networkRef.current.focus(matches[0], {
          scale: 1.2,
          animation: { duration: 1000, easingFunction: "easeInOutQuad" }
        });
      }
    } else {
      networkRef.current.unselectAll();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0d1117] overflow-hidden font-sans text-[#D1E8E2] selection:bg-teal-500/30">
      {/* 🔮 VIBRANT ABSTRACT SOLARIN ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Field Base */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0e14]/40 to-[#05070a] z-20" />
        
        {/* Luminous Core Nebulae */}
        <div className="absolute top-[20%] left-[15%] w-[60%] h-[60%] bg-[#116466]/15 rounded-full blur-[200px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-[#5EEAD4]/5 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] bg-purple-500/[0.03] rounded-full blur-[150px]" />
        
        {/* Drifting Abstract Elements */}
        {mounted && nebulae.map((neb, i) => (
          <motion.div
            key={`nebula-${i}`}
            initial={{ x: neb.x, y: neb.y, scale: neb.scale }}
            animate={{ 
              x: [null, (Math.random() - 0.5) * 20 + "%"], 
              y: [null, (Math.random() - 0.5) * 20 + "%"],
              rotate: [0, 360]
            }}
            transition={{ duration: neb.duration, repeat: Infinity, ease: "linear" }}
            className="absolute w-[40vw] h-[40vw] border border-teal-500/[0.02] rounded-full blur-[80px] opacity-20"
          />
        ))}

        {/* Digital Grain / Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Technical Scanlines */}
        <div className="absolute inset-0 opacity-[0.02] z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

        {/* Subtle Starfield */}
        {mounted && particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: p.opacity, x: p.x, y: p.y }}
            animate={{ opacity: [p.opacity, p.opacity + 0.3, p.opacity] }}
            transition={{ duration: 7 + Math.random() * 5, repeat: Infinity }}
            className="absolute w-[1px] h-[1px] bg-white/40 rounded-full"
          />
        ))}

        {/* HUD Precision Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)`, backgroundSize: "160px 160px" }} />
      </div>

      {/* 🔍 SOLARIN TOP SEARCH HUD */}
      <SearchHUD onSearch={handleSearch} />
      
      {/* Graph Container */}
      {/* Graph Container */}
      <div ref={containerRef} className="w-full h-full relative z-10" />

      {/* 🏛️ SOLARIN GLASS HUD SIDEBAR */}
      <div className="absolute top-10 right-10 bottom-10 w-[26rem] z-30 flex flex-col rounded-sm overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        {/* Glass Surface Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[#0a0e14]/70 backdrop-blur-3xl border border-white/10 z-[-1]" />
        
        {/* Luminous Glass Edge Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

        {/* System Status Bar */}
        <div className="h-12 border-b border-white/10 bg-white/[0.02] px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500/50" />
            <span className="text-[12px] font-mono text-zinc-500 uppercase tracking-[0.2em]">System.Ready</span>
          </div>
          <span className="text-[12px] font-mono text-zinc-500 uppercase tracking-[0.1em]">Explorer_v2.4</span>
        </div>

        {/* Dynamic Corner Brackets */}
        <div className="absolute top-12 left-0 w-8 h-[1px] transition-colors duration-500" style={{ backgroundColor: selectedNode ? `${groupColors[selectedNode.type]}40` : "rgba(45, 212, 191, 0.2)" }} />
        <div className="absolute top-12 left-0 w-[1px] h-8 transition-colors duration-500" style={{ backgroundColor: selectedNode ? `${groupColors[selectedNode.type]}40` : "rgba(45, 212, 191, 0.2)" }} />
        <div className="absolute bottom-0 right-0 w-8 h-[1px] transition-colors duration-500" style={{ backgroundColor: selectedNode ? `${groupColors[selectedNode.type]}40` : "rgba(45, 212, 191, 0.2)" }} />
        <div className="absolute bottom-0 right-0 w-[1px] h-8 transition-colors duration-500" style={{ backgroundColor: selectedNode ? `${groupColors[selectedNode.type]}40` : "rgba(45, 212, 191, 0.2)" }} />

        <AnimatePresence mode="wait">
          {!selectedNode ? (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 flex flex-col h-full"
            >
              <div className="space-y-3 mb-16 pt-4">
                <p className="text-[11px] font-bold text-teal-400/80 uppercase tracking-[0.5em] font-mono">Registry Index</p>
                <h2 className="text-3xl font-light text-zinc-100 tracking-[0.2em] uppercase font-outfit leading-tight">Sawari Sadhan<br/><span className="text-teal-400 font-bold tracking-[0.1em]">Knowledge Graph</span></h2>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Relational Mesh", code: "0xAF-12", status: "Secure" },
                    { label: "Entity Dossier", code: "0xBC-04", status: "Active" },
                    { label: "Technical Logs", code: "0xDE-99", status: "Sync" }
                  ].map((item) => (
                    <div key={item.label} className="p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-teal-500/20 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-teal-500/5 rotate-45 translate-x-8 translate-y-[-8px] pointer-events-none" />
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-[13px] font-bold text-zinc-100 uppercase tracking-[0.2em] font-outfit">{item.label}</p>
                        <span className="text-[11px] font-mono text-teal-400/80">{item.status}</span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 tracking-widest">{item.code}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 flex flex-col h-full relative"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: groupColors[selectedNode.type] || "#5EEAD4" }} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] font-mono opacity-80" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>Dossier.Resolved</span>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 mb-12">
                <p className="text-[12px] font-bold uppercase tracking-[0.5em] font-mono opacity-80" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>NODE_TYPE // {selectedNode.type?.toUpperCase() || "UNKNOWN"}</p>
                <h2 className="text-3xl font-light text-zinc-100 tracking-[0.1em] uppercase font-outfit leading-tight">{selectedNode.label}</h2>
              </div>

              <div className="flex-1 space-y-10 overflow-y-auto pr-4 custom-scrollbar">
                {selectedNode.details?.description && (
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] opacity-20" style={{ backgroundColor: groupColors[selectedNode.type] || "#5EEAD4" }} />
                    <p className="pl-6 text-[15px] text-zinc-400 font-sans leading-relaxed tracking-wide font-light italic">
                      {selectedNode.details.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-10">
                  {/* Registry Metadata */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] font-mono opacity-30" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>Registry_Metadata</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: "Market", val: selectedNode.market_code },
                        { label: "Category", val: selectedNode.category_code },
                        { label: "Slug", val: selectedNode.slug }
                      ].map((item) => item.val && (
                        <div key={item.label} className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5">
                          <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider font-sans">{item.label}</span>
                          <span className="text-[11px] font-bold text-zinc-200 font-mono tracking-tight">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Details Payload */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] font-mono opacity-30" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>Entity_Payload</p>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(selectedNode.details || {}).map(([key, value]) => {
                        if (key === "description" || key === "specs" || typeof value === "object") return null;
                        return (
                          <div key={key} className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                            <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider font-sans">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="text-[11px] font-bold text-zinc-200 font-mono">
                              {String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nested Technical Specs */}
                  {selectedNode.details?.specs && (
                    <div className="space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.4em] font-mono opacity-30" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>Technical_Specs</p>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(selectedNode.details.specs).map(([spec, val]) => (
                          <div key={spec} className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                            <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider font-sans">{spec}</span>
                            <span className="text-[11px] font-bold text-zinc-200 font-mono">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
