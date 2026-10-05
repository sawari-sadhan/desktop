"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { graphClient, EntityNode } from "@lib/core";

const BrandModelsPage = () => {
  const router = useRouter();
  const params = useParams();
  const brandSlug = params.slug as string;

  const [models, setModels] = useState<EntityNode[]>([]);
  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    if (!brandSlug) return;
    setIsLoading(true);
    try {
      // 1. Fetch Brand by Slug
      const brandRes = await graphClient.getNode({ id: "", slug: brandSlug });
      if (!brandRes.node) throw new Error("Brand not found");
      
      const mappedBrand: EntityNode = {
        id: brandRes.node.id,
        type: brandRes.node.type,
        slug: brandRes.node.slug,
        name: brandRes.node.name || {},
        description: brandRes.node.description || {},
        tags: brandRes.node.tags || [],
        metadata: brandRes.node.metadata || {},
        data: brandRes.node.data || {},
        created_at: "",
        updated_at: brandRes.node.updatedAt
      };
      setBrand(mappedBrand);

      // 2. Fetch Models for this Brand
      const neighborsResponse = await graphClient.getNeighbors({
        nodeId: brandRes.node.id,
        linkTypes: ["has_model"]
      });
      const modelNodes = neighborsResponse.nodes || [];

      const mappedModels: EntityNode[] = modelNodes
        .filter(n => n.type === "model")
        .map(n => ({
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

      setModels(mappedModels);
    } catch (err) {
      console.error("Failed to load models for brand:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brandSlug]);

  const filteredModels = models.filter(model => {
    const nameStr = String(model.name?.en || model.name?.default || "");
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || model.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const brandName = brand ? ((brand.name as any)?.en || (brand.name as any)?.default || brand.slug) : "Loading...";

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/console/brand')}
              className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {brandName}{" "}
                <span className="text-slate-400 text-xl font-bold tracking-widest uppercase">Models</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Managing {models.length} vehicle models for {brandName}
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
                className="bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-6 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 transition-all w-64 shadow-sm hover:bg-slate-50 placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            <button 
              onClick={loadData}
              className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
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
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-[2rem] h-64 animate-pulse" />
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
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,1)" }}
                  onClick={() => router.push(`/console/brand/model/${model.slug}`)}
                  className="group cursor-pointer relative bg-white border border-slate-200 p-8 rounded-[2.5rem] transition-all hover:border-blue-200 shadow-sm hover:shadow-md"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                        <Car className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[8px] font-black uppercase tracking-tighter text-slate-500">
                          {model.slug}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[8px] font-black uppercase tracking-tighter text-blue-600">
                          {model.data?.vehicle_type || "Standard"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {(model.name as any)?.en || (model.name as any)?.default || model.name || "Unnamed Model"}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <Box className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{model.data?.body_type || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{model.data?.launch_year || "TBA"}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          GEN: {model.data?.generation || "1.0"}
                        </span>
                      </div>
                      <motion.button 
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-600 transition-all"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No matching models discovered in registry</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

const BrandModelsPageWithSuspense = () => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen text-slate-400">Loading Models...</div>}>
    <BrandModelsPage />
  </Suspense>
);

export default BrandModelsPageWithSuspense;
