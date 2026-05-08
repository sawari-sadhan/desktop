"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  Cpu, 
  Calendar,
  Box,
  Layers,
  ArrowRight
} from "lucide-react";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";

const ModelRegistryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brandId");

  const [models, setModels] = useState<EntityNode[]>([]);
  const [brands, setBrands] = useState<Record<string, string>>({}); // ID -> Name map
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allModels, allBrands] = await Promise.all([
        entityApi.listByType('model'),
        entityApi.getBrands()
      ]);

      // Create brand name map for easy lookup
      const brandMap: Record<string, string> = {};
      allBrands.forEach(b => {
        brandMap[b.id] = typeof b.name === 'object' ? (b.name?.en || b.slug) : (b.name || b.slug);
      });
      setBrands(brandMap);

      // Filter by brand if ID is provided in URL
      if (brandId) {
        setModels(allModels.filter(m => m.data?.parent_brand_id === brandId));
      } else {
        setModels(allModels);
      }
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brandId]);

  const filteredModels = models.filter(model => {
    const nameStr = (typeof model.name === 'object' && model.name !== null)
      ? String((model.name as any).en || "")
      : String(model.name || "");
    
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || model.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-8 lg:px-12 min-h-screen">
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-8">
          <div className="flex items-center gap-6">
            {brandId && (
              <button 
                onClick={() => router.push('/console/brands')}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {brandId ? brands[brandId] || "Loading..." : "Vehicle"}{" "}
                <span className="text-slate-500 text-xl font-bold tracking-widest uppercase">Models</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {brandId ? `Viewing models for brand: ${brands[brandId] || '...'}` : `Managing ${models.length} vehicle models across all brands`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.05] rounded-2xl py-3 pl-10 pr-6 text-xs text-white focus:ring-1 focus:ring-white/20 transition-all w-64 hover:bg-white/[0.05]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            </div>
            <button 
              onClick={loadData}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-[2rem] h-64 animate-pulse" />
              ))
            ) : filteredModels.length > 0 ? (
              filteredModels.map((model, idx) => (
                <motion.div
                  key={model.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.02)" }}
                  onClick={() => router.push(`/console/brands/model/variant?modelId=${model.id}`)}
                  className="group cursor-pointer relative bg-white/[0.01] border border-white/[0.03] p-8 rounded-[2.5rem] transition-all hover:border-white/10 shadow-xl"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5 group-hover:text-white transition-all">
                        <Car className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-tighter text-slate-500">
                          {model.slug}
                        </span>
                        <span className="px-3 py-1 bg-slate-400/10 rounded-full text-[8px] font-black uppercase tracking-tighter text-slate-400 border border-slate-400/20">
                          {model.data?.vehicle_type || "Standard"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-slate-300 transition-colors leading-tight">
                        {typeof model.name === 'object' ? String((model.name as any)?.en || "Unnamed Model") : String(model.name || "Unnamed Model")}
                      </h3>
                      {!brandId && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Brand: {brands[model.data?.parent_brand_id] || "Global"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-slate-500 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <Box className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{model.data?.body_type || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{model.data?.launch_year || "TBA"}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          GEN: {model.data?.generation || "1.0"}
                        </span>
                      </div>
                      <motion.button 
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No matching models discovered in registry</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default ModelRegistryPage;
