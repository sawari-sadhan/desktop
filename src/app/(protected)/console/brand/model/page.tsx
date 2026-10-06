"use client";

import React, { useState, useEffect, Suspense } from "react";
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
import { graphClient, EntityNode } from "@lib/core";

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
      const brandsResponse = await graphClient.searchNodes({
        query: "",
        types: ["brand"],
        limit: 1000,
        vector: []
      });
      const allBrands = brandsResponse.nodes || [];

      // Create brand name map for easy lookup
      const brandMap: Record<string, string> = {};
      allBrands.forEach(b => {
        const bName = b.name || {};
        brandMap[b.id] = (bName as any).en || (bName as any).default || b.slug;
      });
      setBrands(brandMap);

      // Fetch models
      let modelNodes: any[] = [];
      if (brandId) {
        // Fetch only models linked to this brand via "has_model" link type
        const neighborsResponse = await graphClient.getNeighbors({
          nodeId: brandId,
          linkTypes: ["has_model"]
        });
        modelNodes = neighborsResponse.nodes || [];
      } else {
        // Fetch all models
        const modelsResponse = await graphClient.searchNodes({
          query: "",
          types: ["model"],
          limit: 1000,
          vector: []
        });
        modelNodes = modelsResponse.nodes || [];
      }

      const mappedModels: EntityNode[] = modelNodes.map(n => ({
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
      console.error("Failed to load models:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brandId]);

  const filteredModels = models.filter(model => {
    const nameStr = String(model.name?.en || model.name?.default || "");
    
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || model.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-8">
        
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
                  className="group cursor-pointer relative bg-white border border-slate-200 p-8 rounded-[2.5rem] transition-all hover:border-blue-200"
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
                      {!brandId && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Brand: {brands[model.data?.parent_brand_id] || "Global"}
                        </p>
                      )}
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

const ModelRegistryPageWithSuspense = () => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen text-slate-400">Loading Model Registry...</div>}>
    <ModelRegistryPage />
  </Suspense>
);

export default ModelRegistryPageWithSuspense;
