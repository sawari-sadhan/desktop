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
  Database
} from "lucide-react";
import { entityApi, EntityNode } from "$lib/v1/graph/entity";
import { typesApi, TypeBlueprint } from "$lib/v1/graph/types/index";

const ReleaseDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const releaseId = searchParams.get("releaseId");

  const [release, setRelease] = useState<EntityNode | null>(null);
  const [model, setModel] = useState<EntityNode | null>(null);
  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [blueprint, setBlueprint] = useState<TypeBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!releaseId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Release
      const allReleases = await entityApi.listByType('release');
      const currentRelease = allReleases.find(r => r.id === releaseId);
      if (!currentRelease) throw new Error("Release not found");
      setRelease(currentRelease);

      // 2. Fetch Variant
      const variantId = currentRelease.data?.parent_variant_id;
      if (variantId) {
        const allVariants = await entityApi.listByType('variant');
        const currentVariant = allVariants.find(v => v.id === variantId);
        setVariant(currentVariant || null);
      }

      // 3. Fetch Model (to get vehicle_type)
      const modelId = currentRelease.data?.parent_model_id;
      if (modelId) {
        const allModels = await entityApi.listByType('model');
        const currentModel = allModels.find(m => m.id === modelId);
        setModel(currentModel || null);

        // 4. Fetch Blueprint based on model's vehicle_type
        const vType = currentModel?.data?.vehicle_type;
        if (vType) {
          const bp = await typesApi.getBlueprint(vType);
          setBlueprint(bp);
        }
      }
    } catch (err) {
      console.error("Failed to load release details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [releaseId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <RefreshCwIcon className="w-12 h-12 text-slate-700 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Graph Nodes</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
        <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Release Discovery Failed</p>
      </div>
    );
  }

  const releaseName = typeof release.name === 'object' ? (release.name as any).en : release.name;
  const variantName = variant ? (typeof variant.name === 'object' ? (variant.name as any).en : variant.name) : "Unknown Variant";
  const modelName = model ? (typeof model.name === 'object' ? (model.name as any).en : model.name) : "Unknown Model";

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-8 lg:px-16 min-h-screen">
      <div className="w-full max-w-7xl space-y-12">
        
        {/* Top Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/[0.03] pb-12">
          <div className="space-y-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Return to Timeline</span>
            </button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-tighter text-slate-500 border border-white/5">
                  {release.data?.year || "2024"}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{variantName}</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                {releaseName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technical Segment</p>
              <p className="text-lg font-black text-white uppercase">{blueprint?.name || "Standard"}</p>
            </div>
            <div className="w-px h-12 bg-white/5" />
            <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Core Specs (Based on Blueprint) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-slate-400" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest">Technical Specifications</h2>
            </div>

            <div className="space-y-12">
              {blueprint?.blueprint && Object.entries(blueprint.blueprint).map(([sectionKey, fields], sIdx) => (
                <motion.div 
                  key={sectionKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sIdx * 0.1 }}
                  className="space-y-6"
                >
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l border-slate-800 pl-4">
                    {sectionKey.replace(/_/g, " ")}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(fields as Record<string, any>).map(([fieldKey, fieldConfig]) => {
                      const value = release.data?.[sectionKey]?.[fieldKey];
                      return (
                        <div key={fieldKey} className="group bg-white/[0.01] border border-white/[0.03] p-6 rounded-3xl hover:bg-white/[0.02] transition-all hover:border-white/10 flex items-center justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-400 tracking-wide">
                              {fieldConfig.label || fieldKey.replace(/_/g, " ")}
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-xl font-black text-white group-hover:text-slate-100 transition-colors">
                                {value !== undefined ? value : "---"}
                              </p>
                              {fieldConfig.unit && value !== undefined && (
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                                  {fieldConfig.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Registry Context */}
          <div className="space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-widest">Registry Meta</h2>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Slug</p>
                  <p className="text-sm font-mono text-white truncate">{release.slug}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creation Era</p>
                  <p className="text-sm font-bold text-white">{new Date(release.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ingest Source</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-sm font-bold text-white uppercase tracking-tighter">Verified Pipeline</p>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
                  Audit History <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Database className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-widest">Graph Linkage</h2>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Manufacturer", val: modelName, icon: Shield },
                  { label: "Base Model", val: modelName, icon: Activity },
                  { label: "Variant Origin", val: variantName, icon: Settings2 }
                ].map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/[0.02] rounded-2xl hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <link.icon className="w-4 h-4 text-slate-600" />
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{link.label}</p>
                        <p className="text-xs font-bold text-slate-200">{link.val}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RefreshCwIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default ReleaseDetailsPage;
