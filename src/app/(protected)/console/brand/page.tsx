"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Globe, MapPin, Search, RefreshCw, Layers, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { graphClient, EntityNode } from "@lib/core";

const BrandRegistryPage = () => {
  const router = useRouter();
  const [brands, setBrands] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const response = await graphClient.searchNodes({
        query: "",
        types: ["brand"],
        limit: 100,
        vector: []
      });
      
      const mappedBrands: EntityNode[] = (response.nodes || []).map(n => ({
        id: n.id,
        type: n.type,
        slug: n.slug,
        name: n.name || {},
        description: n.description || {},
        tags: n.tags || [],
        metadata: n.metadata || {},
        data: n.data || {},
        created_at: "",
        updated_at: n.updatedAt
      }));
      
      setBrands(mappedBrands);
    } catch (err) {
      console.error("Failed to load brands:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filteredBrands = brands.filter(brand => {
    const nameStr = (brand.name?.en || brand.name?.default || "").toString().toLowerCase();
    
    return nameStr.includes(searchTerm.toLowerCase()) || brand.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-8">
        
        {/* Simplified Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Brands <span className="text-slate-400 text-xl ml-2 font-bold tracking-widest uppercase">Registry</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Managing {brands.length} manufacturers in Knowledge Graph</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-6 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 transition-all w-64 shadow-sm hover:bg-slate-50 placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            <button 
              onClick={loadBrands}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-[2rem] h-56 animate-pulse" />
              ))
            ) : filteredBrands.length > 0 ? (
              filteredBrands.map((brand, idx) => (
                <motion.div
                  key={brand.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.03)" }}
                  onClick={() => router.push(`/console/brand/${brand.slug}`)}
                  className="group cursor-pointer relative bg-white border border-slate-200 p-7 rounded-[2rem] transition-all hover:border-blue-200 shadow-sm hover:shadow-md overflow-hidden"
                >
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-blue-50 transition-all" />
                  
                  <div className="space-y-8 relative">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-black text-xl border border-slate-200 group-hover:border-blue-200 transition-all">
                        {typeof brand.name === 'object' ? (brand.name?.en || "?")[0] : (brand.name || "?")[0]}
                      </div>
                      <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[8px] font-black uppercase tracking-tighter text-slate-500">
                        {brand.slug}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {typeof brand.name === 'object' ? (brand.name?.en || "Unnamed Brand") : (brand.name || "Unnamed Brand")}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-2">
                        {typeof brand.description === 'object' ? (brand.description?.en || "No description provided.") : (brand.description || "No description provided.")}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {brand.data?.headquarters || "Unknown HQ"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Layers className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          ID: {brand.id.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No matching brands discovered in registry</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

// Simple icon fallback if CheckCircle2 is missing or for design variety
const CheckCircleIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default BrandRegistryPage;
