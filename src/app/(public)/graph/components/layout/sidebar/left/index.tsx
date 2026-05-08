"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronRight, ChevronDown, Database, Cpu } from "lucide-react";
import { categoryApi, CategoryNode } from "$lib/v1/graph/types/category";

interface LeftSidebarProps {
  onCategorySelect?: (slug: string) => void;
  selectedSlug?: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onCategorySelect, selectedSlug }) => {
  const [nodes, setNodes] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const data = await categoryApi.getTree();
        setNodes(data.categories || []);
      } catch (err) {
        console.error("Failed to load taxonomy tree:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  const toggleExpand = (slug: string) => {
    setExpanded(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const renderTree = (items: CategoryNode[], depth = 0) => {
    return items.map((item) => {
      const isActive = item.slug === selectedSlug;
      return (
        <div key={item.slug} className="space-y-1">
          <div 
            onClick={() => {
              if (item.children?.length) toggleExpand(item.slug);
              onCategorySelect?.(item.slug);
            }}
            className={`flex items-center gap-3 p-3 rounded-sm border transition-all cursor-pointer group ${
              isActive 
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-400' 
                : 'border-transparent hover:border-white/10 hover:bg-white/[0.03]'
            }`}
            style={{ marginLeft: `${depth * 1.5}rem` }}
          >
            {item.children?.length ? (
              expanded[item.slug] || isActive ? <ChevronDown className="w-3 h-3 text-teal-400" /> : <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-teal-400" />
            ) : (
              <div className="w-3" />
            )}
            
            <div className="flex-1 flex items-center justify-between">
              <span className={`text-[13px] font-medium tracking-wide uppercase font-outfit transition-colors ${isActive ? 'text-teal-300' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                {item.description?.en || item.slug}
              </span>
              <span className={`text-[10px] font-mono transition-colors ${isActive ? 'text-teal-500/80' : 'text-zinc-600 group-hover:text-teal-500/50'}`}>
                {item.children?.length || ""}
              </span>
            </div>
        </div>
        
        {expanded[item.slug] && item.children && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            {renderTree(item.children, depth + 1)}
          </motion.div>
        )}
        </div>
      );
    });
  };

  return (
    <div className="absolute top-10 left-10 bottom-10 w-[24rem] z-30 flex flex-col rounded-sm overflow-hidden">
      {/* Glass Surface Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[#0a0e14]/70 backdrop-blur-3xl border border-white/10 z-[-1]" />
      
      {/* Luminous Glass Edge Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

      {/* Header - Taxonomy Engine */}
      <div className="p-10 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400/80" />
          <p className="text-[11px] font-bold text-teal-400/80 uppercase tracking-[0.5em] font-mono">Taxonomy Engine</p>
        </div>
        <h2 className="text-2xl font-light text-zinc-100 tracking-[0.2em] uppercase font-outfit leading-tight">Market<br/><span className="text-teal-400 font-bold tracking-[0.1em]">Classification</span></h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-4">
        {/* Category Tree Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono opacity-30 text-teal-400">Ontology_Hierarchy</p>
            <span className="text-[10px] font-mono text-zinc-600 uppercase">Live_Sync</span>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Querying_Graph...</p>
              </div>
            ) : (
              renderTree(nodes)
            )}
          </div>
        </div>

        {/* Technical Blueprints Section */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono opacity-30 text-teal-400">Technical_Blueprints</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Automobile Brand", code: "BRAND", icon: Database },
              { label: "Vehicle Model", code: "MODEL", icon: Cpu },
              { label: "Technical Variant", code: "VARIANT", icon: Layers }
            ].map((type) => (
              <div key={type.code} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <type.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-teal-400/80 transition-colors" />
                  <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider group-hover:text-zinc-200">{type.label}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">{type.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="h-10 border-t border-white/5 bg-white/[0.01] px-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Node_Stream_Active</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
