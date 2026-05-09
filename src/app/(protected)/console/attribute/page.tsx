"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, ArrowRight, Type, Hash, ToggleLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { attributeApi, AttributeNode } from "$lib/v1/graph/attribute";

const AttributeRegistryPage = () => {
  const router = useRouter();
  const [attributes, setAttributes] = useState<AttributeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAttributes = async () => {
    setIsLoading(true);
    try {
      const data = await attributeApi.listAll();
      setAttributes(data);
    } catch (err) {
      console.error("Failed to load attributes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  const filteredAttributes = (attributes || []).filter(attr => 
    attr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    attr.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-8 lg:px-12 min-h-screen">
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Simplified Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.03] pb-8 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Technical <span className="text-slate-500 text-xl ml-2 font-bold tracking-widest uppercase">Attributes</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Managing {attributes.length} technical features in Knowledge Graph</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input 
                type="text"
                placeholder="Search attributes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.05] rounded-2xl py-3 pl-10 pr-6 text-xs text-white focus:ring-1 focus:ring-white/20 transition-all w-full md:w-64 hover:bg-white/[0.05]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            </div>
            <button 
              onClick={loadAttributes}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Attribute Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-[2rem] h-56 animate-pulse" />
              ))
            ) : filteredAttributes.length > 0 ? (
              filteredAttributes.map((attr, idx) => (
                <motion.div
                  key={attr.code}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.005 }} // Faster transition for large lists
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.03)" }}
                  onClick={() => router.push(`/console/attribute/${attr.code}`)}
                  className="group cursor-pointer relative bg-white/[0.01] border border-white/[0.03] p-7 rounded-[2rem] transition-all hover:border-white/10 shadow-xl overflow-hidden"
                >
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-all" />
                  
                  {/* Active Boolean Indicator */}
                  {attr.data_types.type === "boolean" && attr.node_count > 0 && (
                    <motion.div 
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-7 right-7 w-1 h-1 bg-amber-400/80 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)] z-20" 
                    />
                  )}
                  
                  <div className="space-y-6 relative">
                    {/* The icon section has been removed as per user request */}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-slate-500 mb-1 font-mono tracking-widest uppercase">
                        {attr.code}
                      </p>
                      <h3 className="text-lg font-black text-white group-hover:text-slate-300 transition-colors line-clamp-1">
                        {attr.name}
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {attr.data_types.type === "string" && (
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300/80">String {attr.node_count > 0 ? `(${attr.node_count})` : ""}</span>
                        )}
                        {attr.data_types.type === "number" && (
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300/80">Number {attr.node_count > 0 ? `(${attr.node_count})` : ""}</span>
                        )}
                        {attr.data_types.type === "boolean" && (
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/80">Boolean {attr.node_count > 0 ? `(${attr.node_count})` : ""}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No matching attributes found</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AttributeRegistryPage;
