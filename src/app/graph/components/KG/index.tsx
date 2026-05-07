"use client";

import React, { useEffect, useRef, useState } from "react";
import { Network, Options, Node, Edge } from "vis-network/standalone";
import { motion, AnimatePresence } from "framer-motion";
import { X, Database } from "lucide-react";
import { nodeGroups, defaultNodeOptions } from "../design/nodes";
import { edgeOptions } from "../design/relationships";
import graphData from "../data/index.json";

const KnowledgeGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Data imported from index.json
    const { nodes, edges } = graphData;

    const options: Options = {
      nodes: defaultNodeOptions,
      edges: edgeOptions,
      groups: nodeGroups,
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -10000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.05,
          damping: 0.09,
          avoidOverlap: 1
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        solver: "barnesHut",
        timestep: 0.5,
        stabilization: { enabled: true, iterations: 1000, updateInterval: 25 }
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectConnectedEdges: true,
        tooltipDelay: 200,
        navigationButtons: false,
        keyboard: true
      }
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    network.on("selectNode", (params) => {
      const nodeId = params.nodes[0];
      const node = nodes.find((n) => n.id === nodeId);
      setSelectedNode(node);
    });

    network.on("deselectNode", () => {
      setSelectedNode(null);
    });

    return () => {
      network.destroy();
    };
  }, []);

  const [particles, setParticles] = useState<{ x: string; y: string; opacity: number }[]>([]);

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      opacity: Math.random() * 0.2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0d1110] overflow-hidden font-sans text-[#D1E8E2]">
      {/* 🔮 UNIFORM ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#116466]/10 rounded-full blur-[160px]" />
        
        {/* Subtle Starfield */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: p.opacity, x: p.x, y: p.y }}
            animate={{ opacity: [p.opacity, p.opacity + 0.2, p.opacity] }}
            transition={{ duration: 8 + Math.random() * 10, repeat: Infinity }}
            className="absolute w-[1px] h-[1px] bg-[#D1E8E2] rounded-full"
          />
        ))}

        {/* Technical Mesh Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#116466 1.5px, transparent 1.5px)`, backgroundSize: "60px 60px" }} />
      </div>
      
      {/* Graph Container */}
      <div ref={containerRef} className="w-full h-full relative z-10" />

      {/* 🏛️ UNIFORM TECHNICAL SIDEBAR */}
      <div className="absolute top-0 right-0 bottom-0 w-[26rem] bg-[#0d1110]/95 backdrop-blur-3xl border-l border-white/5 z-30 flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedNode ? (
            <motion.div
              key="ontology"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-16 flex flex-col h-full"
            >
              <div className="space-y-4 mb-20">
                <p className="text-[11px] font-bold text-[#116466] uppercase tracking-[0.4em] font-sans">Knowledge Framework</p>
                <h2 className="text-5xl font-extrabold text-white tracking-tight uppercase font-outfit">Core <br/>Systems</h2>
              </div>

              <div className="flex-1 space-y-12 overflow-y-auto custom-scrollbar pr-2">
                <section className="space-y-10">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] border-b border-white/5 pb-4">Classification Hub</p>
                  <div className="grid grid-cols-1 gap-8">
                    {[
                      { label: "Manufacturer", color: "#D1E8E2", id: "01" },
                      { label: "Model Architecture", color: "#116466", id: "02" },
                      { label: "Technical Unit", color: "#116466", id: "03" }
                    ].map((item) => (
                      <div key={item.label} className="group flex items-start gap-8">
                        <span className="text-[10px] font-mono text-[#116466] font-black pt-1">{item.id}</span>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <p className="text-[15px] font-bold text-white tracking-wide uppercase font-outfit">{item.label}</p>
                          </div>
                          <p className="text-[12px] text-zinc-500 font-medium leading-relaxed font-sans">Standardized global entity resolution for automotive metadata.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-auto pt-10 border-t border-white/5">
                <button className="w-full bg-white text-[#0d1110] py-6 text-[11px] font-black uppercase tracking-[0.6em] transition-all hover:bg-[#D1E8E2] font-outfit">
                  Sync Database
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-16 flex flex-col h-full relative"
            >
              <div className="flex justify-between items-center mb-16">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#D1E8E2]" />
                  <span className="text-[10px] font-bold text-[#116466] uppercase tracking-[0.4em] font-sans">Active Discovery</span>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3 mb-20">
                <p className="text-[12px] font-bold uppercase tracking-[0.5em] text-[#116466] font-sans">{selectedNode.group}</p>
                <h2 className="text-5xl font-extrabold text-white tracking-tight leading-none uppercase font-outfit">{selectedNode.label}</h2>
              </div>

              <div className="flex-1 space-y-12 overflow-y-auto pr-2 custom-scrollbar">
                <section className="space-y-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 border-b border-white/5 pb-4 font-sans">Specifications</p>
                  <div className="space-y-10">
                    {[
                      { key: "Global Slug", value: selectedNode.label.toLowerCase().replace(/ /g, '-') },
                      { key: "Technical ID", value: `SOL-${selectedNode.id.toString().padStart(6, '0')}` },
                      { key: "Security Protocol", value: "Verified Enterprise" }
                    ].map((attr) => (
                      <div key={attr.key} className="space-y-2">
                        <span className="text-[10px] text-[#116466] uppercase font-black block tracking-widest font-sans">{attr.key}</span>
                        <span className="text-lg font-bold text-white tracking-wider font-outfit">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              
              <div className="mt-auto pt-10">
                <button className="w-full border-2 border-white text-white font-black py-6 text-[11px] uppercase tracking-[0.6em] hover:bg-white hover:text-[#0d1110] transition-all font-outfit">
                  Full Resolution
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
