"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, MapPin, Layers, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { graphClient, EntityNode } from "@lib/core";
import { theme } from "../theme";

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = params.brand as string;

  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [models, setModels] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrandAndModels = async () => {
    if (!brandSlug) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Brand node by slug
      const brandRes = await graphClient.getNode({ id: "", slug: brandSlug });
      if (!brandRes.node) {
        setError("Brand not found in directory");
        setIsLoading(false);
        return;
      }

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

      // Fetch Models linked to this brand via "has_model" link type
      setIsLoadingModels(true);
      const neighborsResponse = await graphClient.getNeighbors({
        nodeId: mappedBrand.id,
        linkTypes: ["has_model"]
      });
      
      const mappedModels: EntityNode[] = (neighborsResponse.nodes || []).map(n => ({
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
      console.error("Failed to load brand details:", err);
      setError("Failed to resolve brand directory data");
    } finally {
      setIsLoading(false);
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    loadBrandAndModels();
  }, [brandSlug]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Loading Profile...</span>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 space-y-4">
        <Shield className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{error || "Brand Profile Error"}</p>
        <Link 
          href="/"
          className="px-5 py-2 bg-slate-200 hover:bg-slate-300/80 border border-slate-300/60 rounded-xl text-slate-700 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const brandName = typeof brand.name === 'object' ? (brand.name?.en || brand.name?.default || "Unnamed") : (brand.name || "Unnamed");

  return (
    <div className={`flex-1 min-h-screen py-10 px-8 max-w-5xl mx-auto space-y-10 ${theme.pageBg}`}>
      
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <div className="inline-flex items-center gap-2 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
          slug: {brand.slug}
        </div>
      </div>

      {/* Brand Profile Overview */}
      <div className="bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-teal-500/[0.01] rounded-full blur-3xl" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-3xl border border-slate-200/60">
            {brandName[0]}
          </div>
          <div className="space-y-1.5">
            <div className={theme.drawerBadge}>
              <Shield className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Brand Profile</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{brandName}</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
              {typeof brand.description === 'object' ? (brand.description?.en || "No description available.") : (brand.description || "No description available.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 border border-slate-200/60 bg-slate-50/50 px-5 py-3 rounded-2xl relative z-10 shrink-0">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {brand.data?.headquarters || brand.metadata?.headquarters || "Global Headquarters"}
          </span>
        </div>
      </div>

      {/* Models List */}
      <div className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-300 pl-3">
          Registered Vehicle Models
        </h2>
        
        {isLoadingModels ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Querying Models...</span>
          </div>
        ) : models.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {models.map((model) => {
              const modelName = typeof model.name === 'object' ? (model.name?.en || model.name?.default || "Unnamed Model") : (model.name || "Unnamed Model");
                const cleanModelSlug = model.slug.startsWith(`${brandSlug}-`)
                  ? model.slug.substring(brandSlug.length + 1)
                  : model.slug;

                return (
                  <div 
                    key={model.id}
                    onClick={() => router.push(`/${brandSlug}/${cleanModelSlug}`)}
                    className={`${theme.modelContainer} ${theme.modelContainerInactive} cursor-pointer hover:border-teal-500/30 hover:shadow-md transition-all`}
                  >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className={theme.modelTitle}>{modelName}</h4>
                      <p className={theme.modelDesc}>
                        {typeof model.description === 'object' ? (model.description?.en || "No description provided.") : (model.description || "No description provided.")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600 self-center">
                      <span className="text-[9px] font-black uppercase tracking-widest">Specs</span>
                      <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 border border-dashed border-slate-200 rounded-[2rem] text-center space-y-2 bg-white">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">No models registered for this manufacturer</p>
          </div>
        )}
      </div>

    </div>
  );
}
