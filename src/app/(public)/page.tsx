"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, MapPin, RefreshCw, ChevronRight } from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { theme } from "./theme";

export default function Home() {
  const router = useRouter();
  const [brands, setBrands] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all brands
  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const response = await graphClient.searchNodes({
        query: "",
        types: ["brand"],
        limit: 100
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
    <div className={`flex-1 flex flex-col ${theme.pageBg}`}>
      
      {/* Directory Section */}
      <section className="py-12 px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Manufacturer Directory</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-mono">Discover {brands.length} automotive brands</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:flex-none">
              <input 
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={theme.input}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <button 
              onClick={loadBrands}
              className={theme.refreshBtn}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/50 rounded-[2rem] h-56 animate-pulse shadow-sm" />
              ))
            ) : filteredBrands.length > 0 ? (
              filteredBrands.map((brand, idx) => {
                const brandName = typeof brand.name === 'object' ? (brand.name?.en || brand.name?.default || "Unnamed") : (brand.name || "Unnamed");
                return (
                  <motion.div
                    key={brand.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.015 }}
                    onClick={() => router.push(`/${brand.slug}`)}
                    className={theme.card}
                  >
                    <div className={theme.cardDecorativeBlob} />
                    
                    <div className="space-y-6 relative">
                      <div className="flex items-start justify-between">
                        <div className={theme.cardIcon}>
                          {brandName[0]}
                        </div>
                        <div className={theme.cardBadge}>
                          {brand.slug}
                        </div>
                      </div>

                      <div>
                        <h3 className={theme.cardTitle}>
                          {brandName}
                        </h3>
                        <p className={theme.cardDesc}>
                          {typeof brand.description === 'object' ? (brand.description?.en || "No description provided.") : (brand.description || "No description provided.")}
                        </p>
                      </div>

                      <div className={theme.cardFooter}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className={theme.cardMapPin} />
                          <span className={theme.cardHqLabel}>
                            {brand.data?.headquarters || brand.metadata?.headquarters || "Global HQ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-teal-600">
                          <span className="text-[9px] font-black uppercase tracking-widest">Explore</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">No matching brands discovered in registry</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
