"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface RightSidebarProps {
  selectedNode: any;
  onClose: () => void;
  groupColors: Record<string, string>;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ selectedNode, onClose, groupColors }) => {
  return (
    <div className="absolute top-10 right-10 bottom-10 w-[26rem] z-30 flex flex-col rounded-sm overflow-hidden">
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
                onClick={onClose}
                className="text-white/20 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 mb-12">
              <p className="text-[12px] font-bold uppercase tracking-[0.5em] font-mono opacity-80" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>NODE_TYPE // {selectedNode.type?.toUpperCase() || "UNKNOWN"}</p>
              <h2 className="text-3xl font-light text-zinc-100 tracking-[0.1em] uppercase font-outfit leading-tight">{ (selectedNode.description?.en || selectedNode.slug).toUpperCase() }</h2>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto pr-4 custom-scrollbar">
              {selectedNode.description?.en && (
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] opacity-20" style={{ backgroundColor: groupColors[selectedNode.type] || "#5EEAD4" }} />
                  <p className="pl-6 text-[15px] text-zinc-400 font-sans leading-relaxed tracking-wide font-light italic">
                    {selectedNode.description.en}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-10">
                {/* Registry Metadata */}
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] font-mono opacity-30" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>Registry_Metadata</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "Slug", val: selectedNode.slug },
                      { label: "Technical Type", val: selectedNode.type }
                    ].map((item) => item.val && (
                      <div key={item.label} className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5">
                        <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider font-sans">{item.label}</span>
                        <span className="text-[11px] font-bold text-zinc-200 font-mono tracking-tight">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Technical Data Payload */}
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] font-mono opacity-30" style={{ color: groupColors[selectedNode.type] || "#5EEAD4" }}>Technical_Payload</p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(selectedNode.data || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                        <span className="text-[11px] text-zinc-400 uppercase font-medium tracking-wider font-sans">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-200 font-mono">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RightSidebar;
