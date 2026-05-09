"use client";

import React, { useEffect, useRef, useState } from "react";
import { Network, Options } from "vis-network/standalone";
import { DataSet } from "vis-data/standalone";
import { motion, AnimatePresence } from "framer-motion";
import { nodeGroups, defaultNodeOptions } from "../design/nodes";
import { edgeOptions, relationshipStyles } from "../design/relationships";
import SearchHUD from "../layout/search";
import RightSidebar from "../layout/sidebar/right";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";
import { edgeApi, GraphLink } from "$lib/v1/graph/edge";

import { publicApi, PublicNode, PublicLink } from "$lib/v1/graph/public";

const groupColors: Record<string, string> = {
  brand: "#5EEAD4",
  model: "#2DD4BF",
  variant: "#F59E0B",
  release: "#EC4899",
  engine_displacement: "#3B82F6",
  fuel_type: "#10B981",
  transmission_type: "#8B5CF6",
  body_type: "#6366F1",
  emission_standard: "#F43F5E"
};

const KnowledgeGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const networkRef = useRef<Network | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // DataSets for vis-network
  const nodesDataSetRef = useRef<DataSet<any>>(new DataSet([]));
  const edgesDataSetRef = useRef<DataSet<any>>(new DataSet([]));
  const expandedNodesRef = useRef<Set<string>>(new Set());

  const [particles, setParticles] = useState<{ x: string; y: string; opacity: number }[]>([]);
  const [nebulae, setNebulae] = useState<{ x: string; y: string; scale: number; duration: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    // (Particles and Nebulae logic remains same)
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      opacity: Math.random() * 0.2
    }));
    setParticles(newParticles);

    const newNebulae = [...Array(5)].map(() => ({
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      scale: 1 + Math.random(),
      duration: 30 + Math.random() * 20
    }));
    setNebulae(newNebulae);
  }, []);

  const formatNode = (node: PublicNode) => {
    let nodeName = "UNKNOWN";
    if (typeof node.name === 'string') nodeName = node.name;
    else if (node.name?.en) nodeName = node.name.en;
    else if (node.slug) nodeName = node.slug;

    return {
      id: node.id,
      label: nodeName.toString().toUpperCase(),
      group: node.type,
      title: nodeName,
      raw: node
    };
  };

  const formatEdge = (link: PublicLink) => {
    const style = (relationshipStyles as any)[link.type] || { color: "rgba(255,255,255,0.1)", width: 0.5 };
    return {
      id: `${link.source_id}-${link.target_id}-${link.type}`,
      from: link.source_id,
      to: link.target_id,
      label: "",
      hiddenLabel: link.type.toUpperCase().replace(/_/g, " "),
      ...style,
      smooth: { type: 'continuous', roundness: 0.2 }
    };
  };

  const collapseNode = (nodeId: string) => {
    // 1. Find all edges where this node is the TARGET (since we expand towards sources)
    const allEdges = edgesDataSetRef.current.get();
    const childEdges = allEdges.filter(e => e.to === nodeId);
    const childNodeIds = childEdges.map(e => e.from);

    // 2. Recursively collapse children
    childNodeIds.forEach(childId => collapseNode(childId));

    // 3. Remove these edges and nodes from the set
    if (childNodeIds.length > 0) {
      nodesDataSetRef.current.remove(childNodeIds);
    }
    if (childEdges.length > 0) {
      edgesDataSetRef.current.remove(childEdges.map(e => e.id));
    }
    
    expandedNodesRef.current.delete(nodeId);
  };

  const expandNode = async (nodeId: string) => {
    if (expandedNodesRef.current.has(nodeId)) {
      collapseNode(nodeId);
      return;
    }

    try {
      const data = await publicApi.expandNode(nodeId);
      
      // Filter out existing nodes/edges
      const newNodes = data.nodes.filter(n => !nodesDataSetRef.current.get(n.id));
      const newEdges = data.links.filter(l => !edgesDataSetRef.current.get(`${l.source_id}-${l.target_id}-${l.type}`));

      if (newNodes.length > 0) {
        nodesDataSetRef.current.add(newNodes.map(formatNode));
      }
      if (newEdges.length > 0) {
        edgesDataSetRef.current.add(newEdges.map(formatEdge));
      }

      if (data.nodes.length > 0) {
        expandedNodesRef.current.add(nodeId);
      }
    } catch (err) {
      console.error("Failed to expand node:", err);
    }
  };

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const initializeGraph = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Initial Layer (Brands)
        const initialData = await publicApi.getInitialGraph();

        const styledNodes = initialData.nodes.map(formatNode);
        nodesDataSetRef.current.clear();
        nodesDataSetRef.current.add(styledNodes);
        edgesDataSetRef.current.clear();

        const options: Options = {
          nodes: defaultNodeOptions,
          edges: edgeOptions,
          groups: nodeGroups,
          physics: {
            enabled: true,
            barnesHut: {
              gravitationalConstant: -4000,
              centralGravity: 1.2,
              springLength: 200,
              springConstant: 0.04,
              damping: 0.4,
              avoidOverlap: 1
            },
            stabilization: { 
              enabled: true,
              iterations: 1000,
              updateInterval: 100
            }
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            keyboard: true
          }
        };

        const data = {
          nodes: nodesDataSetRef.current,
          edges: edgesDataSetRef.current
        };

        const network = new Network(containerRef.current!, data, options);
        networkRef.current = network;

        const aggressiveClear = () => {
          const ids = edgesDataSetRef.current.getIds();
          if (ids.length > 0) {
            edgesDataSetRef.current.update(ids.map(id => ({ 
              id, 
              label: "", 
              font: { color: "rgba(0,0,0,0)", size: 1, strokeWidth: 0, background: "transparent" } 
            })) as any);
            network.redraw();
          }
        };

        network.on("doubleClick", (params) => {
          if (params.nodes.length > 0) {
            expandNode(params.nodes[0]);
          }
        });

        network.on("hoverEdge", (params) => {
          const edgeId = params.edge;
          const edge = edgesDataSetRef.current.get(edgeId) as any;
          if (edge) {
            aggressiveClear();
            edgesDataSetRef.current.update({ 
              id: edgeId, 
              label: edge.hiddenLabel || "",
              font: { color: "rgba(209, 232, 226, 0.9)", size: 7, strokeWidth: 0, background: "transparent" }
            });
          }
        });

        network.on("blurEdge", aggressiveClear);

        network.on("selectNode", (params) => {
          aggressiveClear();
          const nodeId = params.nodes[0];
          const node = nodesDataSetRef.current.get(nodeId) as any;
          if (node) {
            setSelectedNode(node.raw);
            
            // --- Slide Effect Logic ---
            if (node.group === "brand") {
              const allNodes = nodesDataSetRef.current.get();
              const brands = allNodes.filter(n => n.group === "brand");
              
              // Move all brands to the far left and fix them
              brands.forEach((b, idx) => {
                const isTarget = b.id === nodeId;
                const yPos = (idx - (brands.length - 1) / 2) * 120;
                
                nodesDataSetRef.current.update({
                  id: b.id,
                  x: -600,
                  y: yPos,
                  fixed: true // Pin them so they don't bounce
                });
              });
              
              // Adjust selected node slightly forward if needed, or keep in line
            }
            // --------------------------

            expandNode(nodeId);
          }
        });

        network.on("deselectNode", () => {
          aggressiveClear();
          setSelectedNode(null);
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to load Knowledge Graph:", error);
        setLoading(false);
      }
    };

    initializeGraph();

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [mounted]);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    
    if (!networkRef.current) return;
    
    if (q.trim() === "") {
      networkRef.current.unselectAll();
      return;
    }

    const matches = nodesDataSetRef.current.get({
      filter: (n: any) => (n.raw?.description?.en || n.raw?.slug || "").toLowerCase().includes(q)
    }).map((n: any) => n.id);

    if (matches.length > 0) {
      networkRef.current.selectNodes(matches);
      if (matches.length === 1) {
        networkRef.current.focus(matches[0], {
          scale: 1.2,
          animation: { duration: 1000, easingFunction: "easeInOutQuad" }
        });
        
        // Also expand the found node to reveal its context
        expandNode(matches[0]);
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
      <RightSidebar 
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
        groupColors={groupColors}
      />
    </div>
  );
};

export default KnowledgeGraph;
