"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings2, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  Users, 
  Disc,
  DoorOpen,
  Layers,
  ArrowRight
} from "lucide-react";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";

const VariantRegistryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("modelId");

  const [variants, setVariants] = useState<EntityNode[]>([]);
  const [models, setModels] = useState<Record<string, string>>({}); // ID -> Name map
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allVariants, allModels] = await Promise.all([
        entityApi.listByType('variant'),
        entityApi.listByType('model')
      ]);

      const modelMap: Record<string, string> = {};
      allModels.forEach(m => {
        modelMap[m.id] = typeof m.name === 'object' ? (m.name?.en || m.slug) : (m.name || m.slug);
      });
      setModels(modelMap);

      if (modelId) {
        setVariants(allVariants.filter(v => v.data?.parent_model_id === modelId));
      } else {
        setVariants(allVariants);
      }
    } catch (err) {
      console.error("Failed to load variants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modelId]);

  const filteredVariants = variants.filter(variant => {
    const nameStr = String(variant.name?.en || variant.name?.default || "");
    
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || variant.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-8 lg:px-12 min-h-screen">
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {modelId ? models[modelId] || "Loading..." : "Technical"}{" "}
                <span className="text-slate-500 text-xl font-bold tracking-widest uppercase">Variants</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {modelId ? `Refining specifications for model: ${models[modelId] || '...'}` : `Managing ${variants.length} technical variants in registry`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search variants..."
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

        {/* Variant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-[2rem] h-64 animate-pulse" />
              ))
            ) : filteredVariants.length > 0 ? (
              filteredVariants.map((variant, idx) => (
                <motion.div
                  key={variant.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.02)" }}
                  onClick={() => router.push(`/console/brands/model/variant/release?variantId=${variant.id}`)}
                  className="group cursor-pointer relative bg-white/[0.01] border border-white/[0.03] p-8 rounded-[2.5rem] transition-all hover:border-white/10 shadow-xl"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-xl border border-white/5 group-hover:border-white/20 transition-all">
                        {String((variant.name as any)?.en || (variant.name as any)?.default || variant.name || "?")[0]}
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-tighter text-slate-500">
                        {variant.slug}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-slate-300 transition-colors leading-tight">
                        {(variant.name as any)?.en || (variant.name as any)?.default || variant.name || "Unnamed Variant"}
                      </h3>
                      {!modelId && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Model: {models[variant.data?.parent_model_id] || "Global"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center gap-1.5 text-slate-500 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black">{variant.data?.seating_capacity || "-"}P</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 text-slate-500 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <DoorOpen className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black">{variant.data?.door_count || "-"}D</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 text-slate-500 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                        <Disc className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black truncate w-full text-center">{variant.data?.drivetrain_type || "AWD"}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-2">
                        {typeof variant.description === 'object' ? String((variant.description as any)?.en || "No description provided.") : String(variant.description || "No description provided.")}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          TRIM: {variant.data?.trim_level || "Standard"}
                        </span>
                      </div>
                      <motion.button 
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                      >
                        Releases <ArrowRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No technical variants discovered</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default VariantRegistryPage;
