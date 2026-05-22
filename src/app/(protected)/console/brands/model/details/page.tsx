"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  ChevronLeft, 
  Cpu, 
  Settings2, 
  Zap, 
  Activity,
  Layers,
  Info,
  ExternalLink,
  ChevronRight,
  Database,
  Search,
  RefreshCw,
  Car,
  Tag,
  Gauge,
  Sliders,
  Sparkles
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";

const ModelDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("modelId");

  const [model, setModel] = useState<EntityNode | null>(null);
  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [variants, setVariants] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!modelId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Model Node
      const modelRes = await graphClient.getNode({ id: modelId, slug: "" });
      if (!modelRes.node) throw new Error("Model not found");

      const mappedModel: EntityNode = {
        id: modelRes.node.id,
        type: modelRes.node.type,
        slug: modelRes.node.slug,
        name: modelRes.node.name || {},
        description: modelRes.node.description || {},
        tags: modelRes.node.tags || [],
        metadata: modelRes.node.metadata || {},
        data: modelRes.node.data || {},
        created_at: "",
        updated_at: modelRes.node.updatedAt
      };
      setModel(mappedModel);

      // 2. Fetch Brand Node (linked via incoming/outgoing has_model)
      const brandNeighbors = await graphClient.getNeighbors({
        nodeId: modelId,
        linkTypes: ["has_model"]
      });
      const brandNode = (brandNeighbors.nodes || []).find(n => n.type === "brand");
      if (brandNode) {
        setBrand({
          id: brandNode.id,
          type: brandNode.type,
          slug: brandNode.slug,
          name: brandNode.name || {},
          description: brandNode.description || {},
          tags: brandNode.tags || [],
          metadata: brandNode.metadata || {},
          data: brandNode.data || {},
          created_at: "",
          updated_at: brandNode.updatedAt
        });
      }

      // 3. Fetch Variants Node (linked via has_variant)
      const variantNeighbors = await graphClient.getNeighbors({
        nodeId: modelId,
        linkTypes: ["has_variant"]
      });
      const mappedVariants: EntityNode[] = (variantNeighbors.nodes || [])
        .filter(n => n.type === "variant")
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
      setVariants(mappedVariants);
    } catch (err) {
      console.error("Failed to load model details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modelId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="w-12 h-12 text-slate-700 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Model Spec Graph</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Model Discovery Failed</p>
      </div>
    );
  }

  const modelName = typeof model.name === 'object' ? (model.name as any).en : model.name;
  const brandName = brand ? (typeof brand.name === 'object' ? (brand.name as any).en : brand.name) : "Global";

  const specs = model.data?.specifications || {};
  const features: string[] = model.data?.features || [];

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-8 lg:px-16 min-h-screen">
      <div className="w-full max-w-7xl space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/[0.03] pb-12">
          <div className="space-y-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Return to Models</span>
            </button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-teal-400 font-black text-sm uppercase tracking-[0.3em]">{brandName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="text-slate-500 text-xs font-bold font-mono">{model.slug}</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-none">
                {modelName}
              </h1>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={loadData}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sync</span>
            </button>
          </div>
        </div>

        {/* Specifications & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Specifications Box */}
          <div className="lg:col-span-2 bg-slate-950/40 border border-white/[0.03] p-8 rounded-[2.5rem] space-y-8 backdrop-blur-md">
            <div className="flex items-center gap-3 text-slate-200">
              <Sliders className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-black uppercase tracking-wider">Specifications Blueprint</h2>
            </div>

            {Object.keys(specs).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(specs).map(([key, val]: [string, any]) => {
                  let valStr = "";
                  if (typeof val === 'object' && val !== null) {
                    valStr = val.unit ? `${val.value} ${val.unit}` : String(val.value || "");
                  } else {
                    valStr = String(val);
                  }
                  return (
                    <div key={key} className="bg-white/[0.01] border border-white/[0.02] p-4 rounded-2xl flex flex-col gap-1 hover:border-white/5 transition-all">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                      <span className="text-slate-200 font-bold text-sm">{valStr || "---"}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specifications blueprint seeded for this model.</p>
            )}
          </div>

          {/* Features Column */}
          <div className="bg-slate-950/40 border border-white/[0.03] p-8 rounded-[2.5rem] space-y-8 backdrop-blur-md flex flex-col">
            <div className="flex items-center gap-3 text-slate-200">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-black uppercase tracking-wider">Key Features</h2>
            </div>

            {features.length > 0 ? (
              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[350px] pr-2">
                {features.map((feature, i) => (
                  <span 
                    key={i}
                    className="px-3.5 py-2 bg-white/5 border border-white/5 hover:border-teal-500/20 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No key features list mapped to this model node.</p>
            )}
          </div>
        </div>

        {/* Variants List Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-slate-200">
            <Layers className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-black uppercase tracking-wider">Linked Variants ({variants.length})</h2>
          </div>

          {variants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {variants.map((variant, idx) => {
                const varName = typeof variant.name === 'object' ? (variant.name as any).en : variant.name;
                const specData = variant.data?.specifications || {};
                
                return (
                  <motion.div
                    key={variant.id}
                    whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.02)" }}
                    onClick={() => router.push(`/console/brands/model/details/variant?variantId=${variant.id}`)}
                    className="group cursor-pointer bg-white/[0.01] border border-white/[0.03] hover:border-white/10 p-6 rounded-[2rem] transition-all flex flex-col justify-between h-48 relative shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase tracking-tighter bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-slate-500">
                          {variant.slug}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-teal-400 transition-colors leading-tight">
                        {varName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider pt-4 border-t border-white/5">
                      <span>{specData["Fuel Type"] || "Fuel N/A"}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span>{specData["Transmission Type"] || "Trans N/A"}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 border border-dashed border-white/5 rounded-[2rem] text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No variants mapped to this model graph node yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ModelDetailsPage;
